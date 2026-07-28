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

  if (!currentUser) return null;

  const canReview = can(currentUser.role, "review_access");

  const requests = state.accessRequests.filter((r) => {
    if (currentUser.role === "global_admin") return true;
    if (currentUser.role === "admin") return r.orgId === currentUser.orgId;
    return r.requesterId === currentUser.id;
  });

  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending");

  const onReview = (
    e: FormEvent,
    requestId: string,
    status: "approved" | "denied",
  ) => {
    e.preventDefault();
    reviewAccess(
      requestId,
      status,
      notes[requestId]?.trim() ||
        (status === "approved" ? "Approved for active program use." : "Denied pending policy review."),
    );
  };

  return (
    <>
      <PageHeader
        title="Access workflow"
        subtitle={
          canReview
            ? "Review pending entitlements and leave an auditable decision note."
            : "Track the status of your dataset access requests."
        }
      />

      <Panel title={`Pending (${pending.length})`}>
        {pending.length === 0 ? (
          <EmptyState
            title="Queue clear"
            body="No pending access requests in your current role scope."
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
                  style={{ padding: "1rem", background: "rgba(7,17,31,0.35)" }}
                >
                  <div className="row-between">
                    <div>
                      <strong>{dataset?.name}</strong>
                      <div className="muted" style={{ fontSize: "0.85rem" }}>
                        {requester?.name} · {org?.name} · {formatDate(req.createdAt)}
                      </div>
                    </div>
                    <Badge tone="amber">pending</Badge>
                  </div>
                  <p style={{ marginTop: "0.7rem" }}>{req.reason}</p>
                  {canReview ? (
                    <form
                      className="form-grid"
                      style={{ marginTop: "0.85rem" }}
                      onSubmit={(e) => onReview(e, req.id, "approved")}
                    >
                      <div className="field">
                        <label htmlFor={`note-${req.id}`}>Decision note</label>
                        <input
                          id={`note-${req.id}`}
                          value={notes[req.id] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                          }
                          placeholder="Optional reviewer note"
                        />
                      </div>
                      <div className="row">
                        <button className="btn" type="submit">
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={(e) => onReview(e, req.id, "denied")}
                        >
                          Deny
                        </button>
                        {dataset ? (
                          <Link className="btn btn-secondary" to={`/datasets/${dataset.id}`}>
                            View dataset
                          </Link>
                        ) : null}
                      </div>
                    </form>
                  ) : (
                    <p className="muted" style={{ marginTop: "0.7rem" }}>
                      Waiting on an admin review.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="History" bodyClassName="">
        {history.length === 0 ? (
          <EmptyState title="No history yet" body="Reviewed requests will appear here." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Dataset</th>
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
