import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { useApp } from "@/lib/store";
import type { Permission } from "@/data/permissions";
import { can } from "@/data/permissions";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Command Deck",
    subtitle: "Live picture of programs, access, and exploration health.",
  },
  "/projects": {
    title: "Programs",
    subtitle: "Programs running across your organization.",
  },
  "/datasets": {
    title: "Data Catalog",
    subtitle: "Catalog, sensitivity, and access posture.",
  },
  "/analytics": {
    title: "Insights",
    subtitle: "Exploration throughput and insight outcomes.",
  },
  "/access": {
    title: "Access Queue",
    subtitle: "Approve, deny, and track dataset entitlements.",
  },
  "/users": {
    title: "Users & Roles",
    subtitle: "Seat assignments and role boundaries.",
  },
  "/organizations": {
    title: "Organizations",
    subtitle: "Global tenant map and seat pools.",
  },
  "/audit": {
    title: "Audit Log",
    subtitle: "Immutable trail of sensitive actions.",
  },
  "/settings": {
    title: "Settings",
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
    (location.pathname.startsWith("/projects/")
      ? {
          title: "Project Detail",
          subtitle: "Status, datasets, and exploration runs.",
        }
      : location.pathname.startsWith("/datasets/")
        ? {
            title: "Dataset Detail",
            subtitle: "Schema, access, and explore actions.",
          }
        : { title: "PilotAI", subtitle: "Mission Control" });

  return (
    <div className="app-shell">
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
