import type { Role } from "./types";

export type Permission =
  | "view_dashboard"
  | "view_projects"
  | "manage_projects"
  | "view_datasets"
  | "explore_datasets"
  | "request_access"
  | "review_access"
  | "view_analytics"
  | "view_users"
  | "manage_users"
  | "view_orgs"
  | "manage_orgs"
  | "view_audit"
  | "manage_settings"
  | "impersonate_hint";

const rolePermissions: Record<Role, Permission[]> = {
  explorer: [
    "view_dashboard",
    "view_projects",
    "view_datasets",
    "explore_datasets",
    "request_access",
    "view_analytics",
    "manage_settings",
  ],
  admin: [
    "view_dashboard",
    "view_projects",
    "manage_projects",
    "view_datasets",
    "explore_datasets",
    "request_access",
    "review_access",
    "view_analytics",
    "view_users",
    "manage_users",
    "view_audit",
    "manage_settings",
  ],
  global_admin: [
    "view_dashboard",
    "view_projects",
    "manage_projects",
    "view_datasets",
    "explore_datasets",
    "request_access",
    "review_access",
    "view_analytics",
    "view_users",
    "manage_users",
    "view_orgs",
    "manage_orgs",
    "view_audit",
    "manage_settings",
    "impersonate_hint",
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export const roleLabels: Record<Role, string> = {
  global_admin: "Global Admin",
  admin: "Admin",
  explorer: "Explorer",
};

export const roleDescriptions: Record<Role, string> = {
  global_admin:
    "Cross-organization control plane. Manage orgs, seats, and system policy.",
  admin:
    "Organization operator. Approve access, manage users, and run programs.",
  explorer:
    "Field analyst. Explore datasets, request access, and ship insights.",
};
