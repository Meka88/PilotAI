import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Badge, EmptyState, PageHeader, Panel, ProgressBar } from "@/components/ui";
import { can } from "@/data/permissions";
import type { ProjectStatus } from "@/data/types";
import { useApp } from "@/lib/store";
import { relativeLabel } from "@/lib/format";

export function ProjectsPage() {
  const { state, currentUser, createProject } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("experiment");

  if (!currentUser) return null;

  const projects =
    currentUser.role === "global_admin"
      ? state.projects
      : state.projects.filter((p) => p.orgId === currentUser.orgId);

  const onCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProject({
      name: name.trim(),
      description: description.trim() || "New PilotAI program.",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setName("");
    setDescription("");
    setTags("experiment");
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Programs"
        subtitle="Create programs, advance status, and attach explorations."
        actions={
          can(currentUser.role, "manage_projects") ? (
            <button className="btn" type="button" onClick={() => setOpen((v) => !v)}>
              {open ? "Close form" : "New program"}
            </button>
          ) : null
        }
      />

      {open ? (
        <Panel title="Create program">
          <form className="form-grid" onSubmit={onCreate}>
            <div className="field">
              <label htmlFor="project-name">Name</label>
              <input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Quiet Hours Experiment"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="project-desc">Description</label>
              <textarea
                id="project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What decision will this program unlock?"
              />
            </div>
            <div className="field">
              <label htmlFor="project-tags">Tags (comma separated)</label>
              <input
                id="project-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <button className="btn" type="submit">
              Create draft program
            </button>
          </form>
        </Panel>
      ) : null}

      <Panel title={`${projects.length} programs`} bodyClassName="">
        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            body="Admins can create a draft program to kick off the workflow."
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const owner = state.users.find((u) => u.id === project.ownerId);
                const org = state.organizations.find((o) => o.id === project.orgId);
                return (
                  <tr key={project.id}>
                    <td>
                      <Link to={`/projects/${project.id}`}>
                        <strong>{project.name}</strong>
                      </Link>
                      <div className="muted" style={{ fontSize: "0.8rem" }}>
                        {project.code}
                        {currentUser.role === "global_admin" ? ` · ${org?.name}` : ""}
                      </div>
                    </td>
                    <td>{owner?.name ?? "—"}</td>
                    <td>
                      <StatusBadge status={project.status} />
                    </td>
                    <td style={{ minWidth: 130 }}>
                      <div className="stack" style={{ gap: "0.35rem" }}>
                        <ProgressBar value={project.progress} />
                        <span className="muted" style={{ fontSize: "0.78rem" }}>
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="muted">{relativeLabel(project.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus | string }) {
  const tone =
    status === "active"
      ? "ok"
      : status === "paused"
        ? "amber"
        : status === "draft"
          ? "muted"
          : "coral";
  return <Badge tone={tone}>{status}</Badge>;
}
