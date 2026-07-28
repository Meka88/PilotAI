import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, PageHeader, Panel } from "@/components/ui";
import { StatusBadge } from "@/pages/ProjectsPage";
import { can } from "@/data/permissions";
import type { ProjectStatus } from "@/data/types";
import { useApp } from "@/lib/store";
import { formatDate, relativeLabel } from "@/lib/format";

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const {
    state,
    currentUser,
    updateProjectStatus,
    runExploration,
    hasDatasetAccess,
  } = useApp();
  const [runName, setRunName] = useState("New exploration pass");
  const [datasetId, setDatasetId] = useState("");

  const project = state.projects.find((p) => p.id === projectId);

  const linkedDatasets = useMemo(() => {
    if (!project) return [];
    return state.datasets.filter(
      (d) => project.datasetIds.includes(d.id) || d.orgId === project.orgId,
    );
  }, [project, state.datasets]);

  if (!currentUser || !project) {
    return (
      <Panel title="Project not found">
        <p className="muted">This project is missing or outside your scope.</p>
        <Link className="btn btn-secondary" to="/projects">
          Back to projects
        </Link>
      </Panel>
    );
  }

  if (
    currentUser.role !== "global_admin" &&
    project.orgId !== currentUser.orgId
  ) {
    return (
      <Panel title="Restricted">
        <p className="muted">You do not have access to this organization&apos;s project.</p>
      </Panel>
    );
  }

  const owner = state.users.find((u) => u.id === project.ownerId);
  const runs = state.explorationRuns.filter((r) => r.projectId === project.id);
  const accessibleDatasets = linkedDatasets.filter((d) => hasDatasetAccess(d.id));

  const onRun = (e: FormEvent) => {
    e.preventDefault();
    const chosen = datasetId || accessibleDatasets[0]?.id;
    if (!chosen) return;
    runExploration({
      projectId: project.id,
      datasetId: chosen,
      name: runName.trim() || "Exploration run",
    });
  };

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={project.description}
        actions={
          <>
            <StatusBadge status={project.status} />
            {can(currentUser.role, "manage_projects") ? (
              <select
                value={project.status}
                onChange={(e) =>
                  updateProjectStatus(project.id, e.target.value as ProjectStatus)
                }
                aria-label="Update project status"
                style={{
                  border: "1px solid var(--line-strong)",
                  background: "rgba(7,17,31,0.65)",
                  borderRadius: 10,
                  padding: "0.5rem 0.7rem",
                }}
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="paused">paused</option>
                <option value="archived">archived</option>
              </select>
            ) : null}
          </>
        }
      />

      <div className="grid grid-3">
        <Panel title="Ownership">
          <div className="stack">
            <div>
              <div className="muted">Owner</div>
              <strong>{owner?.name}</strong>
            </div>
            <div>
              <div className="muted">Code</div>
              <strong>{project.code}</strong>
            </div>
            <div>
              <div className="muted">Updated</div>
              <strong>{formatDate(project.updatedAt)}</strong>
            </div>
          </div>
        </Panel>
        <Panel title="Tags">
          <div className="tag-list">
            {project.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </Panel>
        <Panel title="Linked datasets">
          <div className="stack">
            {linkedDatasets.slice(0, 4).map((ds) => (
              <Link key={ds.id} to={`/datasets/${ds.id}`} className="row-between">
                <span>{ds.name}</span>
                <Badge tone={hasDatasetAccess(ds.id) ? "ok" : "amber"}>
                  {hasDatasetAccess(ds.id) ? "access" : "locked"}
                </Badge>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="split">
        <Panel title="Exploration runs">
          <div className="stack">
            {runs.length === 0 ? (
              <p className="muted">No runs yet for this project.</p>
            ) : (
              runs.map((run) => {
                const actor = state.users.find((u) => u.id === run.actorId);
                return (
                  <div key={run.id} className="panel" style={{ padding: "0.85rem" }}>
                    <div className="row-between">
                      <strong>{run.name}</strong>
                      <Badge
                        tone={
                          run.status === "completed"
                            ? "ok"
                            : run.status === "running"
                              ? "amber"
                              : "muted"
                        }
                      >
                        {run.status}
                      </Badge>
                    </div>
                    <p className="muted" style={{ marginTop: "0.35rem", fontSize: "0.9rem" }}>
                      {run.insight}
                    </p>
                    <div className="muted" style={{ marginTop: "0.45rem", fontSize: "0.78rem" }}>
                      {actor?.name} · {relativeLabel(run.createdAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>

        <Panel title="Launch exploration">
          {accessibleDatasets.length === 0 ? (
            <div className="locked-banner">
              You need dataset access before launching a run. Request access from
              the Datasets page.
            </div>
          ) : (
            <form className="form-grid" onSubmit={onRun}>
              <div className="field">
                <label htmlFor="run-name">Run name</label>
                <input
                  id="run-name"
                  value={runName}
                  onChange={(e) => setRunName(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="run-dataset">Dataset</label>
                <select
                  id="run-dataset"
                  value={datasetId || accessibleDatasets[0]?.id}
                  onChange={(e) => setDatasetId(e.target.value)}
                >
                  {accessibleDatasets.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn" type="submit">
                Start run
              </button>
            </form>
          )}
        </Panel>
      </div>
    </>
  );
}
