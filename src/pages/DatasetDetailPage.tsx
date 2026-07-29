import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, PageHeader, Panel } from "@/components/ui";
import { SensitivityBadge } from "@/pages/DatasetsPage";
import { useApp } from "@/lib/store";
import { formatNumber, formatDate } from "@/lib/format";

export function DatasetDetailPage() {
  const { datasetId } = useParams();
  const { state, currentUser, hasDatasetAccess, requestAccess } = useApp();
  const [reason, setReason] = useState(
    "Need this asset to complete an active exploration playbook.",
  );
  const [submitted, setSubmitted] = useState(false);
  const [showClearanceForm, setShowClearanceForm] = useState(false);

  const dataset = state.datasets.find((d) => d.id === datasetId);

  if (!currentUser || !dataset) {
    return (
      <Panel title="Asset not found">
        <Link className="btn btn-secondary" to="/catalog">
          Back to asset inventory
        </Link>
      </Panel>
    );
  }

  if (
    currentUser.role !== "global_admin" &&
    dataset.orgId !== currentUser.orgId
  ) {
    return (
      <Panel title="Restricted">
        <p className="muted">This asset belongs to another organization.</p>
      </Panel>
    );
  }

  const access = hasDatasetAccess(dataset.id);
  const owner = state.users.find((u) => u.id === dataset.ownerId);
  const existingPending = state.accessRequests.find(
    (r) =>
      r.datasetId === dataset.id &&
      r.requesterId === currentUser.id &&
      r.status === "pending",
  );

  const onRequest = (e: FormEvent) => {
    e.preventDefault();
    requestAccess(dataset.id, reason.trim());
    setSubmitted(true);
  };

  return (
    <>
      <PageHeader
        title={dataset.name}
        subtitle={dataset.description}
        actions={<SensitivityBadge value={dataset.sensitivity} />}
      />

      <div className="grid grid-3">
        <Panel title="Footprint">
          <div className="stack">
            <div>
              <div className="muted">Rows</div>
              <strong>{formatNumber(dataset.rows)}</strong>
            </div>
            <div>
              <div className="muted">Columns</div>
              <strong>{dataset.columns}</strong>
            </div>
            <div>
              <div className="muted">Steward</div>
              <strong>{owner?.name}</strong>
            </div>
          </div>
        </Panel>
        <Panel title="Labels">
          <div className="tag-list">
            {dataset.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <p className="muted" style={{ marginTop: "0.85rem", fontSize: "0.85rem" }}>
            Updated {formatDate(dataset.updatedAt)}
          </p>
        </Panel>
        <Panel title="Clearance status">
          {access ? (
            <div className="stack">
              <Badge tone="ok">Cleared</Badge>
              <p className="muted">
                You can attach this asset to any linked workstream.
              </p>
              <Link className="btn" to="/programs">
                Open workstreams
              </Link>
            </div>
          ) : (
            <div className="stack">
              <div className="locked-banner">
                Restricted fields stay masked until clearance is granted.
              </div>
              {existingPending || submitted ? (
                <Badge tone="amber">Clearance pending</Badge>
              ) : (
                <>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setShowClearanceForm((v) => !v)}
                  >
                    {showClearanceForm ? "Hide clearance form" : "I need clearance"}
                  </button>
                  {showClearanceForm ? (
                    <form className="form-grid" onSubmit={onRequest}>
                      <div className="field">
                        <label htmlFor="access-reason">Business justification</label>
                        <textarea
                          id="access-reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          required
                        />
                      </div>
                      <button className="btn" type="submit">
                        Submit clearance request
                      </button>
                    </form>
                  ) : null}
                </>
              )}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Field map" bodyClassName="">
        <table className="table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Visibility</th>
            </tr>
          </thead>
          <tbody>
            {dataset.schema.map((col) => (
              <tr key={col.name}>
                <td>
                  <strong>{col.name}</strong>
                </td>
                <td className="muted">{col.type}</td>
                <td>
                  <Badge tone={access ? "ok" : "amber"}>
                    {access ? "visible" : "masked until cleared"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
