import { Link } from "react-router-dom";
import { Badge, PageHeader, Panel, ProgressBar, Stat } from "@/components/ui";
import { useApp } from "@/lib/store";
import { formatNumber, relativeLabel } from "@/lib/format";

export function DashboardPage() {
  const { state, currentUser } = useApp();
  if (!currentUser) return null;

  const orgScoped =
    currentUser.role === "global_admin"
      ? state.projects
      : state.projects.filter((p) => p.orgId === currentUser.orgId);

  const datasets =
    currentUser.role === "global_admin"
      ? state.datasets
      : state.datasets.filter((d) => d.orgId === currentUser.orgId);

  const pending = state.accessRequests.filter((r) => {
    if (r.status !== "pending") return false;
    if (currentUser.role === "global_admin") return true;
    if (currentUser.role === "admin") return r.orgId === currentUser.orgId;
    return r.requesterId === currentUser.id;
  });

  const runs = state.explorationRuns.filter((run) => {
    const project = state.projects.find((p) => p.id === run.projectId);
    if (!project) return false;
    return currentUser.role === "global_admin" || project.orgId === currentUser.orgId;
  });

  const org = state.organizations.find((o) => o.id === currentUser.orgId);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${currentUser.name.split(" ")[0]}`}
        subtitle={
          currentUser.role === "global_admin"
            ? "You are flying the global control plane across all PilotAI tenants."
            : `Operating inside ${org?.name}. Track programs, access, and explorations.`
        }
        actions={
          <Link className="btn" to="/projects">
            Open projects
          </Link>
        }
      />

      <div className="grid grid-4">
        <Stat
          label="Active projects"
          value={orgScoped.filter((p) => p.status === "active").length}
          hint={`${orgScoped.length} total in view`}
        />
        <Stat
          label="Datasets"
          value={datasets.length}
          hint={`${formatNumber(datasets.reduce((s, d) => s + d.rows, 0))} rows`}
        />
        <Stat
          label="Pending access"
          value={pending.length}
          hint={
            currentUser.role === "explorer"
              ? "Your open requests"
              : "Awaiting review"
          }
        />
        <Stat
          label="Exploration runs"
          value={runs.length}
          hint={`${runs.filter((r) => r.status === "running").length} running now`}
        />
      </div>

      <div className="split">
        <Panel
          title="Program pulse"
          action={
            <Link className="btn btn-secondary btn-sm" to="/projects">
              View all
            </Link>
          }
          bodyClassName=""
        >
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {orgScoped.slice(0, 5).map((project) => (
                <tr key={project.id}>
                  <td>
                    <Link to={`/projects/${project.id}`}>
                      <strong>{project.name}</strong>
                      <div className="muted" style={{ fontSize: "0.8rem" }}>
                        {project.code}
                      </div>
                    </Link>
                  </td>
                  <td>
                    <StatusBadge status={project.status} />
                  </td>
                  <td style={{ minWidth: 120 }}>
                    <ProgressBar value={project.progress} />
                  </td>
                  <td className="muted">{relativeLabel(project.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Needs attention">
          <div className="stack">
            {pending.length === 0 ? (
              <p className="muted">No pending access items in your queue.</p>
            ) : (
              pending.slice(0, 4).map((req) => {
                const dataset = state.datasets.find((d) => d.id === req.datasetId);
                const requester = state.users.find((u) => u.id === req.requesterId);
                return (
                  <div key={req.id} className="row-between">
                    <div>
                      <strong>{dataset?.name}</strong>
                      <div className="muted" style={{ fontSize: "0.82rem" }}>
                        {requester?.name} · {relativeLabel(req.createdAt)}
                      </div>
                    </div>
                    <Badge tone="amber">pending</Badge>
                  </div>
                );
              })
            )}
            <Link className="btn btn-secondary" to="/access">
              Open access queue
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
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
