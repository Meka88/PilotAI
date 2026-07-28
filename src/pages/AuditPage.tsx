import { Badge, PageHeader, Panel } from "@/components/ui";
import { useApp } from "@/lib/store";
import { formatDate } from "@/lib/format";

export function AuditPage() {
  const { state, currentUser } = useApp();
  if (!currentUser) return null;

  const events =
    currentUser.role === "global_admin"
      ? state.auditEvents
      : state.auditEvents.filter(
          (e) => e.orgId === currentUser.orgId || e.orgId === "system",
        );

  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Every sensitive action lands here — ideal for Meticulous replay diffs."
      />

      <Panel title={`${events.length} events`} bodyClassName="">
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const actor = state.users.find((u) => u.id === event.actorId);
              return (
                <tr key={event.id}>
                  <td className="muted">{formatDate(event.createdAt)}</td>
                  <td>{actor?.name ?? event.actorId}</td>
                  <td>{event.action}</td>
                  <td>{event.target}</td>
                  <td>
                    <Badge
                      tone={
                        event.severity === "critical"
                          ? "coral"
                          : event.severity === "warning"
                            ? "amber"
                            : "teal"
                      }
                    >
                      {event.severity}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
