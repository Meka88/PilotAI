import { PageHeader, Panel, Stat } from "@/components/ui";
import { useApp } from "@/lib/store";

export function OrganizationsPage() {
  const { state, currentUser, updateOrgSeats } = useApp();
  if (!currentUser) return null;

  const totalSeats = state.organizations.reduce((s, o) => s + o.seats, 0);
  const usedSeats = state.organizations.reduce((s, o) => s + o.usedSeats, 0);

  return (
    <>
      <PageHeader
        title="Tenant organizations"
        subtitle="Global Admin view of tenants, plans, and seat capacity across PilotAI."
      />

      <div className="grid grid-3">
        <Stat label="Tenants" value={state.organizations.length} />
        <Stat label="Seats used" value={`${usedSeats}/${totalSeats}`} />
        <Stat
          label="Enterprise plans"
          value={state.organizations.filter((o) => o.plan === "enterprise").length}
        />
      </div>

      <Panel title="Tenant map" bodyClassName="">
        <table className="table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Region</th>
              <th>Plan</th>
              <th>Seats</th>
              <th>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {state.organizations.map((org) => (
              <tr key={org.id}>
                <td>
                  <strong>{org.name}</strong>
                  <div className="muted" style={{ fontSize: "0.8rem" }}>
                    {org.slug}
                  </div>
                </td>
                <td>{org.region}</td>
                <td style={{ textTransform: "capitalize" }}>{org.plan}</td>
                <td>
                  {org.usedSeats} /{" "}
                  <input
                    type="number"
                    min={org.usedSeats}
                    value={org.seats}
                    onChange={(e) =>
                      updateOrgSeats(org.id, Number(e.target.value) || org.usedSeats)
                    }
                    aria-label={`Seats for ${org.name}`}
                    style={{
                      width: 72,
                      border: "1px solid var(--line-strong)",
                      background: "rgba(7,17,31,0.65)",
                      borderRadius: 8,
                      padding: "0.3rem 0.45rem",
                    }}
                  />
                </td>
                <td>
                  <div className="progress" style={{ minWidth: 120 }}>
                    <span
                      style={{
                        width: `${Math.min(100, (org.usedSeats / org.seats) * 100)}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
