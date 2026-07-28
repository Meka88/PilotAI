import { Badge, PageHeader, Panel, Stat } from "@/components/ui";
import { useApp } from "@/lib/store";
import { relativeLabel } from "@/lib/format";

export function AnalyticsPage() {
  const { state, currentUser } = useApp();
  if (!currentUser) return null;

  const runs = state.explorationRuns.filter((run) => {
    const project = state.projects.find((p) => p.id === run.projectId);
    if (!project) return false;
    return currentUser.role === "global_admin" || project.orgId === currentUser.orgId;
  });

  const completed = runs.filter((r) => r.status === "completed").length;
  const running = runs.filter((r) => r.status === "running").length;
  const approved = state.accessRequests.filter((r) => {
    if (r.status !== "approved") return false;
    return currentUser.role === "global_admin" || r.orgId === currentUser.orgId;
  }).length;

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Throughput across explorations, approvals, and insight delivery."
      />

      <div className="grid grid-4">
        <Stat label="Runs in scope" value={runs.length} />
        <Stat label="Completed" value={completed} hint="Ready insights" />
        <Stat label="Running" value={running} hint="Live compute" />
        <Stat label="Access approved" value={approved} hint="Entitlements granted" />
      </div>

      <div className="split">
        <Panel title="Recent insights">
          <div className="stack">
            {runs
              .filter((r) => r.status === "completed")
              .slice(0, 5)
              .map((run) => {
                const project = state.projects.find((p) => p.id === run.projectId);
                return (
                  <div key={run.id}>
                    <div className="row-between">
                      <strong>{run.name}</strong>
                      <Badge tone="ok">insight</Badge>
                    </div>
                    <p className="muted" style={{ marginTop: "0.3rem" }}>
                      {run.insight}
                    </p>
                    <div className="muted" style={{ fontSize: "0.78rem", marginTop: "0.3rem" }}>
                      {project?.name} · {relativeLabel(run.createdAt)}
                    </div>
                  </div>
                );
              })}
          </div>
        </Panel>

        <Panel title="Funnel snapshot">
          <div className="stack">
            <FunnelRow
              label="Datasets in catalog"
              value={
                currentUser.role === "global_admin"
                  ? state.datasets.length
                  : state.datasets.filter((d) => d.orgId === currentUser.orgId).length
              }
            />
            <FunnelRow
              label="Access requests"
              value={
                currentUser.role === "global_admin"
                  ? state.accessRequests.length
                  : state.accessRequests.filter((r) => r.orgId === currentUser.orgId).length
              }
            />
            <FunnelRow label="Approved entitlements" value={approved} />
            <FunnelRow label="Exploration completions" value={completed} />
          </div>
        </Panel>
      </div>
    </>
  );
}

function FunnelRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="row-between">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
