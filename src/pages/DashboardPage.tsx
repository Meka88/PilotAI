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
        title={`${currentUser.name.split(" ")[0]}'s ops board`}
        subtitle={
          currentUser.role === "global_admin"
            ? "Cross-tenant console. Workstreams, assets, and clearance in one strip."
            : `${org?.name} workspace · redesigned layout for the Meticulous break demo.`
        }
        actions={
          <div className="row">
            <Link className="btn" to="/programs">
              Open workstreams
            </Link>
            <Link className="btn btn-secondary" to="/approvals">
              Clearance desk
            </Link>
          </div>
        }
      />

      <div className="grid grid-3">
        <Stat
          label="Workstreams live"
          value={orgScoped.filter((p) => p.status === "active").length}
          hint={`${orgScoped.length} total`}
        />
        <Stat
          label="Assets in scope"
          value={datasets.length}
          hint={`${formatNumber(datasets.reduce((s, d) => s + d.rows, 0))} rows`}
        />
        <Stat
          label="Clearance backlog"
          value={pending.length}
          hint={`${runs.filter((r) => r.status === "running").length} runs in flight`}
        />
      </div>

      <div className="split reverse-split">
        <Panel title="Clearance hotlist">
          <div className="stack">
            {pending.length === 0 ? (
              <p className="muted">No clearance tickets in your scope.</p>
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
                    <Badge tone="amber">open</Badge>
                  </div>
                );
              })
            )}
            <Link className="btn" to="/approvals">
              Go to clearance desk
            </Link>
          </div>
        </Panel>

        <Panel
          title="Workstream strip"
          action={
            <Link className="btn btn-secondary btn-sm" to="/programs">
              All workstreams
            </Link>
          }
          bodyClassName=""
        >
          <table className="table">
            <thead>
              <tr>
                <th>Workstream</th>
                <th>State</th>
                <th>Progress</th>
                <th>Touched</th>
              </tr>
            </thead>
            <tbody>
              {orgScoped.slice(0, 5).map((project) => (
                <tr key={project.id}>
                  <td>
                    <Link to={`/programs/${project.id}`}>
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
