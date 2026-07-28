import { Link } from "react-router-dom";
import { Badge, PageHeader, Panel } from "@/components/ui";
import { useApp } from "@/lib/store";
import { formatNumber, relativeLabel } from "@/lib/format";

export function DatasetsPage() {
  const { state, currentUser, hasDatasetAccess } = useApp();
  if (!currentUser) return null;

  const datasets =
    currentUser.role === "global_admin"
      ? state.datasets
      : state.datasets.filter((d) => d.orgId === currentUser.orgId);

  return (
    <>
      <PageHeader
        title="Dataset catalog"
        subtitle="Sensitivity levels drive who can explore immediately vs who must request access."
      />

      <Panel title={`${datasets.length} datasets`} bodyClassName="">
        <table className="table">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Sensitivity</th>
              <th>Scale</th>
              <th>Access</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => {
              const org = state.organizations.find((o) => o.id === dataset.orgId);
              const access = hasDatasetAccess(dataset.id);
              return (
                <tr key={dataset.id}>
                  <td>
                    <Link to={`/datasets/${dataset.id}`}>
                      <strong>{dataset.name}</strong>
                    </Link>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>
                      {currentUser.role === "global_admin" ? `${org?.name} · ` : ""}
                      {dataset.description.slice(0, 64)}
                      {dataset.description.length > 64 ? "…" : ""}
                    </div>
                  </td>
                  <td>
                    <SensitivityBadge value={dataset.sensitivity} />
                  </td>
                  <td>
                    {formatNumber(dataset.rows)} rows
                    <div className="muted" style={{ fontSize: "0.78rem" }}>
                      {dataset.columns} columns
                    </div>
                  </td>
                  <td>
                    <Badge tone={access ? "ok" : "amber"}>
                      {access ? "granted" : "request needed"}
                    </Badge>
                  </td>
                  <td className="muted">{relativeLabel(dataset.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}

export function SensitivityBadge({
  value,
}: {
  value: "public" | "internal" | "restricted";
}) {
  const tone = value === "public" ? "ok" : value === "internal" ? "teal" : "coral";
  return <Badge tone={tone}>{value}</Badge>;
}
