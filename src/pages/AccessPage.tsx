import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Badge, EmptyState, PageHeader, Panel } from "@/components/ui";
import { can } from "@/data/permissions";
import { useApp } from "@/lib/store";
import { formatDate } from "@/lib/format";

export function AccessPage() {
  const { state, currentUser, reviewAccess } = useApp();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<
    Record<string, "approved" | "denied" | "">
  >({});

  if (!currentUser) return null;

  const canReview = can(currentUser.role, "review_access");

  const requests = state.accessRequests.filter((r) => {
    if (currentUser.role === "global_admin") return true;
    if (currentUser.role === "admin") return r.orgId === currentUser.orgId;
    return r.requesterId === currentUser.id;
  });

  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending");

  const onApply = (e: FormEvent, requestId: string) => {
    e.preventDefault();
    const status = decisions[requestId];
    if (!status) return;
    reviewAccess(
      requestId,
      status,
      notes[requestId]?.trim() ||
        (status === "approved"
          ? "Cleared for active workstream use."
          : "Held pending policy review."),
    );
  };

  return (
    <>
      <PageHeader
        title="Clearance desk"
        subtitle={
          canReview
            ? "Pick a decision, then apply it. Direct approve/deny buttons were removed in this release."
            : "Track clearance status for your dataset entitlements."
        }
      />

      <Panel title={`Open tickets (${pending.length})`}>
        {pending.length === 0 ? (
          <EmptyState
            title="No open tickets"
            body="Nothing waiting in your clearance scope."
          />
        ) : (
          <div className="stack">
            {pending.map((req) => {
              const dataset = state.datasets.find((d) => d.id === req.datasetId);
              const requester = state.users.find((u) => u.id === req.requesterId);
              const org = state.organizations.find((o) => o.id === req.orgId);
              return (
                <div
                  key={req.id}
                  className="panel"
                  style={{ padding: "1rem", background: "rgba(15, 23, 42, 0.04)" }}
                >
                  <div className="row-between">
                    <div>
                      <strong>{dataset?.name}</strong>
                      <div className="muted" style={{ fontSize: "0.85rem" }}>
                        {requester?.name} · {org?.name} · {formatDate(req.createdAt)}
                      </div>
                    </div>
                    <Badge tone="amber">awaiting decision</Badge>
                  </div>
                  <p style={{ marginTop: "0.7rem" }}>{req.reason}</p>
                  {canReview ? (
                    <form
                      className="form-grid"
                      style={{ marginTop: "0.85rem" }}
                      onSubmit={(e) => onApply(e, req.id)}
                    >
                      <div className="field">
                        <label htmlFor={`decision-${req.id}`}>Decision</label>
                        <select
                          id={`decision-${req.id}`}
                          value={decisions[req.id] ?? ""}
                          onChange={(e) =>
                            setDecisions((prev) => ({
                              ...prev,
                              [req.id]: e.target.value as "approved" | "denied" | "",
                            }))
                          }
                          required
                        >
                          <option value="">Choose outcome…</option>
                          <option value="approved">Grant clearance</option>
                          <option value="denied">Hold / deny</option>
                        </select>
                      </div>
                      <div className="field">
                        <label htmlFor={`note-${req.id}`}>Reviewer note</label>
                        <input
                          id={`note-${req.id}`}
                          value={notes[req.id] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                          }
                          placeholder="Required context for audit trail"
                        />
                      </div>
                      <div className="row">
                        <button
                          className="btn"
                          type="submit"
                          disabled={!decisions[req.id]}
                        >
                          Apply decision
                        </button>
                        {dataset ? (
                          <Link
                            className="btn btn-secondary"
                            to={`/catalog/${dataset.id}`}
                          >
                            Open asset
                          </Link>
                        ) : null}
                      </div>
                    </form>
                  ) : (
                    <p className="muted" style={{ marginTop: "0.7rem" }}>
                      Waiting on clearance desk review.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Resolved history" bodyClassName="">
        {history.length === 0 ? (
          <EmptyState title="No history yet" body="Resolved tickets will appear here." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Requester</th>
                <th>Status</th>
                <th>Reviewed</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {history.map((req) => {
                const dataset = state.datasets.find((d) => d.id === req.datasetId);
                const requester = state.users.find((u) => u.id === req.requesterId);
                const reviewer = state.users.find((u) => u.id === req.reviewedById);
                return (
                  <tr key={req.id}>
                    <td>{dataset?.name}</td>
                    <td>{requester?.name}</td>
                    <td>
                      <Badge tone={req.status === "approved" ? "ok" : "coral"}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="muted">
                      {reviewer?.name ?? "—"}
                      <div style={{ fontSize: "0.78rem" }}>
                        {req.reviewedAt ? formatDate(req.reviewedAt) : ""}
                      </div>
                    </td>
                    <td className="muted">{req.reviewNote ?? "—"}</td>
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
