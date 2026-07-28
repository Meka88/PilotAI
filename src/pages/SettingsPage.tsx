import { Badge, PageHeader, Panel } from "@/components/ui";
import { roleDescriptions, roleLabels } from "@/data/permissions";
import { useApp } from "@/lib/store";
import { STORAGE_KEY } from "@/data/seed";

export function SettingsPage() {
  const { state, currentUser, resetDemo, logout } = useApp();
  if (!currentUser) return null;

  const org = state.organizations.find((o) => o.id === currentUser.orgId);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Demo controls and account context for your PilotAI session."
      />

      <div className="grid grid-2">
        <Panel title="Session">
          <div className="stack">
            <div className="row-between">
              <span className="muted">Signed in as</span>
              <strong>{currentUser.name}</strong>
            </div>
            <div className="row-between">
              <span className="muted">Role</span>
              <Badge tone="teal">{roleLabels[currentUser.role]}</Badge>
            </div>
            <div className="row-between">
              <span className="muted">Organization</span>
              <strong>{org?.name}</strong>
            </div>
            <p className="muted">{roleDescriptions[currentUser.role]}</p>
            <div className="row">
              <button className="btn btn-secondary" type="button" onClick={logout}>
                Sign out
              </button>
              <button className="btn btn-danger" type="button" onClick={resetDemo}>
                Reset demo data
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Meticulous demo tips">
          <div className="stack">
            <p>
              Record flows while switching personas. Good replay candidates:
            </p>
            <ol className="muted" style={{ margin: 0, paddingLeft: "1.1rem" }}>
              <li>Explorer requests access to Cohort Ledger</li>
              <li>Admin approves the request and checks audit</li>
              <li>Explorer launches an exploration on the unlocked dataset</li>
              <li>Global Admin adjusts Harbor seat capacity</li>
            </ol>
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              Local state key: <code>{STORAGE_KEY}</code>
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
