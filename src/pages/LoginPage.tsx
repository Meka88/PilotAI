import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { roleDescriptions, roleLabels } from "@/data/permissions";
import type { Role, User } from "@/data/types";
import { useApp } from "@/lib/store";
import { Avatar, Badge } from "@/components/ui";

const demoOrder: Role[] = ["explorer", "admin", "global_admin"];

export function LoginPage() {
  const { state, loginAs } = useApp();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const personas = useMemo(() => {
    return demoOrder
      .map((role) => state.users.find((u) => u.role === role && u.status === "active"))
      .filter(Boolean) as User[];
  }, [state.users]);

  const selected = personas.find((u) => u.id === selectedId) ?? null;

  return (
    <div className="login-page light-login">
      <div className="login-stage stacked-login">
        <section className="login-brand">
          <div>
            <div className="eyebrow">PilotAI Ops</div>
            <h1>Welcome back to Ops Console</h1>
            <p>
              Pick a demo persona, confirm, and jump into clearance + workstream
              flows. Small copy tweak for a Meticulous smoke test.
            </p>
          </div>
          <div className="row" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
            <Badge tone="teal">Smoke test</Badge>
            <Badge tone="ok">Sessions ready</Badge>
            <Badge tone="amber">Login diff</Badge>
          </div>
        </section>

        <section className="login-panel">
          <h2 style={{ fontSize: "1.35rem", marginBottom: "0.35rem" }}>
            Step 1 · Choose your persona
          </h2>
          <p className="muted" style={{ marginBottom: "1.1rem" }}>
            Explorer → Admin → Global Admin. Then confirm below to enter.
          </p>
          <div className="stack">
            {personas.map((user) => {
              const org = state.organizations.find((o) => o.id === user.orgId);
              const isSelected = selectedId === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  className={`role-card${isSelected ? " selected" : ""}`}
                  onClick={() => setSelectedId(user.id)}
                >
                  <div className="row-between">
                    <div className="user-chip">
                      <Avatar name={user.name} hue={user.avatarHue} size={40} />
                      <div className="meta">
                        <strong>{user.name}</strong>
                        <span>
                          {roleLabels[user.role]} · {org?.name}
                        </span>
                      </div>
                    </div>
                    <Badge tone={isSelected ? "ok" : "muted"}>
                      {isSelected ? "Selected" : "Select"}
                    </Badge>
                  </div>
                  <span style={{ marginTop: "0.7rem" }}>
                    {roleDescriptions[user.role]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="login-confirm">
            <h3>Step 2 · Enter workspace</h3>
            <p className="muted">
              {selected
                ? `Ready to enter as ${selected.name} (${roleLabels[selected.role]}).`
                : "Select a persona above to unlock entry."}
            </p>
            <button
              className="btn"
              type="button"
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                loginAs(selected.id);
                navigate("/");
              }}
            >
              Enter Ops Console
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
