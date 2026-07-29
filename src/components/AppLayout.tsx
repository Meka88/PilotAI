import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { useApp } from "@/lib/store";
import type { Permission } from "@/data/permissions";
import { can } from "@/data/permissions";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Ops Console",
    subtitle: "Priority signals across workstreams, assets, and clearance.",
  },
  "/programs": {
    title: "Workstreams",
    subtitle: "Active delivery programs and exploration attach points.",
  },
  "/catalog": {
    title: "Asset inventory",
    subtitle: "Sensitivity, ownership, and clearance posture.",
  },
  "/insights": {
    title: "Signal board",
    subtitle: "Exploration throughput and insight outcomes.",
  },
  "/approvals": {
    title: "Clearance desk",
    subtitle: "Resolve pending dataset entitlements.",
  },
  "/users": {
    title: "People",
    subtitle: "Seat assignments and role boundaries.",
  },
  "/organizations": {
    title: "Tenants",
    subtitle: "Global tenant map and seat pools.",
  },
  "/audit": {
    title: "Trail",
    subtitle: "Immutable trail of sensitive actions.",
  },
  "/settings": {
    title: "Prefs",
    subtitle: "Demo preferences and account context.",
  },
};

export function RequireAuth({ permission }: { permission?: Permission }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (permission && !can(currentUser.role, permission)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function AppLayout() {
  const location = useLocation();
  const meta =
    titles[location.pathname] ??
    (location.pathname.startsWith("/programs/")
      ? {
          title: "Workstream detail",
          subtitle: "Status, assets, and exploration runs.",
        }
      : location.pathname.startsWith("/catalog/")
        ? {
            title: "Asset detail",
            subtitle: "Schema, clearance, and explore actions.",
          }
        : { title: "PilotAI", subtitle: "Ops Console" });

  return (
    <div className="app-shell topnav-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
