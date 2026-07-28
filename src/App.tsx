import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AppLayout, RequireAuth } from "@/components/AppLayout";
import { AccessPage } from "@/pages/AccessPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { AuditPage } from "@/pages/AuditPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DatasetDetailPage } from "@/pages/DatasetDetailPage";
import { DatasetsPage } from "@/pages/DatasetsPage";
import { LoginPage } from "@/pages/LoginPage";
import { OrganizationsPage } from "@/pages/OrganizationsPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { UsersPage } from "@/pages/UsersPage";
import { useApp } from "@/lib/store";
import { can, type Permission } from "@/data/permissions";

function PermissionGate({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { currentUser } = useApp();
  if (!currentUser || !can(currentUser.role, permission)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="datasets" element={<DatasetsPage />} />
          <Route path="datasets/:datasetId" element={<DatasetDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="access" element={<AccessPage />} />
          <Route
            path="users"
            element={
              <PermissionGate permission="view_users">
                <UsersPage />
              </PermissionGate>
            }
          />
          <Route
            path="organizations"
            element={
              <PermissionGate permission="view_orgs">
                <OrganizationsPage />
              </PermissionGate>
            }
          />
          <Route
            path="audit"
            element={
              <PermissionGate permission="view_audit">
                <AuditPage />
              </PermissionGate>
            }
          />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={currentUser ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
