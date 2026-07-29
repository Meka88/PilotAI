import { NavLink } from "react-router-dom";
import { can, roleLabels } from "@/data/permissions";
import { useApp } from "@/lib/store";
import { Avatar, Badge } from "@/components/ui";

const links = [
  { to: "/", label: "Home", permission: "view_dashboard" as const },
  { to: "/programs", label: "Workstreams", permission: "view_projects" as const },
  { to: "/catalog", label: "Assets", permission: "view_datasets" as const },
  { to: "/insights", label: "Signals", permission: "view_analytics" as const },
  { to: "/approvals", label: "Clearance", permission: "request_access" as const },
  { to: "/users", label: "People", permission: "view_users" as const },
  { to: "/organizations", label: "Tenants", permission: "view_orgs" as const },
  { to: "/audit", label: "Trail", permission: "view_audit" as const },
  { to: "/settings", label: "Prefs", permission: "manage_settings" as const },
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
    <aside className="sidebar topnav">
      <div className="brand">
        <div className="brand-mark" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="#0F766E" strokeWidth="1.8" />
            <path d="M7 15 L12 7 L17 15" stroke="#0F766E" strokeWidth="1.8" />
            <circle cx="12" cy="13" r="1.5" fill="#BE123C" />
          </svg>
        </div>
        <div className="brand-copy">
          <strong>PilotAI</strong>
          <span>Ops Console</span>
        </div>
      </div>

      <nav className="nav-section topnav-links" aria-label="Primary">
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
              {link.to === "/approvals" && pendingCount > 0 ? (
                <Badge tone="amber">{pendingCount}</Badge>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer topnav-user">
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
