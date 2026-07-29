import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { roleDescriptions, roleLabels } from "@/data/permissions";
import type { Role } from "@/data/types";
import { useApp } from "@/lib/store";
import { Avatar, Badge } from "@/components/ui";

const demoOrder: Role[] = ["global_admin", "admin", "explorer"];

export function LoginPage() {
  const { state, loginAs } = useApp();
  const navigate = useNavigate();

  const personas = useMemo(() => {
    return demoOrder
      .map((role) => state.users.find((u) => u.role === role && u.status === "active"))
      .filter(Boolean);
  }, [state.users]);

  return (
    <div className="login-page">
      <div className="login-stage">
        <section className="login-brand">
          <div>
            <div className="eyebrow">PilotAI</div>
            <h1>Command Deck for multi-role AI programs</h1>
            <p>
              Jump between Global Admin, Admin, and Explorer to exercise access
              reviews, project lifecycle, and audit trails — tuned for a live
              Meticulous visual-diff demo.
            </p>
          </div>
          <div className="row" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
            <Badge tone="teal">3 personas</Badge>
            <Badge tone="amber">10+ screens</Badge>
            <Badge tone="ok">Diff-ready flows</Badge>
          </div>
        </section>

        <section className="login-panel">
          <h2 style={{ fontSize: "1.35rem", marginBottom: "0.35rem" }}>
            Choose a demo persona
          </h2>
          <p className="muted" style={{ marginBottom: "1.1rem" }}>
            No password needed — pick a role and compare permissions across the
            same PilotAI workspace.
          </p>
          <div className="stack">
            {personas.map((user) => {
              if (!user) return null;
              const org = state.organizations.find((o) => o.id === user.orgId);
              return (
                <button
                  key={user.id}
                  type="button"
                  className="role-card"
                  onClick={() => {
                    loginAs(user.id);
                    navigate("/");
                  }}
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
                    <Badge
                      tone={
                        user.role === "global_admin"
                          ? "coral"
                          : user.role === "admin"
                            ? "amber"
                            : "teal"
                      }
                    >
                      {roleLabels[user.role]}
                    </Badge>
                  </div>
                  <span style={{ marginTop: "0.7rem" }}>
                    {roleDescriptions[user.role]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
