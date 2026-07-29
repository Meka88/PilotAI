import { NavLink } from "react-router-dom";
import { can, roleLabels } from "@/data/permissions";
import { useApp } from "@/lib/store";
import { Avatar, Badge } from "@/components/ui";

const links = [
  { to: "/", label: "Command Deck", permission: "view_dashboard" as const },
  { to: "/projects", label: "Programs", permission: "view_projects" as const },
  { to: "/datasets", label: "Data Catalog", permission: "view_datasets" as const },
  { to: "/analytics", label: "Insights", permission: "view_analytics" as const },
  { to: "/access", label: "Access Queue", permission: "request_access" as const },
  { to: "/users", label: "Users & Roles", permission: "view_users" as const },
  { to: "/organizations", label: "Organizations", permission: "view_orgs" as const },
  { to: "/audit", label: "Audit Log", permission: "view_audit" as const },
  { to: "/settings", label: "Settings", permission: "manage_settings" as const },
];

export function Sidebar() {
  const { currentUser, state } = useApp();
  if (!currentUser) return null;

  const pendingCount = state.accessRequests.filter((r) => {
    if (r.status !== "pending") return false;
    if (currentUser.role === "global_admin") return true;
    if (currentUser.role === "admin") return r.orgId === currentUser.orgId;
    return r.requesterId === currentUser.id;
  }).length;

  const org = state.organizations.find((o) => o.id === currentUser.orgId);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 17 L12 4 L20 17 Z" stroke="#45D0FF" strokeWidth="1.8" />
            <circle cx="12" cy="14.5" r="1.7" fill="#FFB347" />
          </svg>
        </div>
        <div className="brand-copy">
          <strong>PilotAI</strong>
          <span>Command Deck</span>
        </div>
      </div>

      <nav className="nav-section" aria-label="Primary">
        <div className="nav-label">Workspace</div>
        {links.map((link) => {
          if (!can(currentUser.role, link.permission)) return null;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {link.label}
              {link.to === "/access" && pendingCount > 0 ? (
                <Badge tone="amber">{pendingCount}</Badge>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <Avatar name={currentUser.name} hue={currentUser.avatarHue} />
          <div className="meta">
            <strong>{currentUser.name}</strong>
            <span>
              {roleLabels[currentUser.role]} · {org?.name}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
