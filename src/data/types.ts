export type Role = "global_admin" | "admin" | "explorer";

export type ProjectStatus = "draft" | "active" | "paused" | "archived";
export type DatasetSensitivity = "public" | "internal" | "restricted";
export type AccessRequestStatus = "pending" | "approved" | "denied";
export type AuditSeverity = "info" | "warning" | "critical";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  region: string;
  plan: "starter" | "growth" | "enterprise";
  seats: number;
  usedSeats: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  orgId: string;
  title: string;
  avatarHue: number;
  lastActive: string;
  status: "active" | "invited" | "suspended";
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  code: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  datasetIds: string[];
  tags: string[];
  progress: number;
  updatedAt: string;
  createdAt: string;
}

export interface Dataset {
  id: string;
  orgId: string;
  name: string;
  description: string;
  sensitivity: DatasetSensitivity;
  rows: number;
  columns: number;
  ownerId: string;
  tags: string[];
  updatedAt: string;
  schema: { name: string; type: string }[];
}

export interface AccessRequest {
  id: string;
  requesterId: string;
  datasetId: string;
  orgId: string;
  reason: string;
  status: AccessRequestStatus;
  createdAt: string;
  reviewedById?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface AuditEvent {
  id: string;
  orgId: string | "system";
  actorId: string;
  action: string;
  target: string;
  severity: AuditSeverity;
  createdAt: string;
}

export interface ExplorationRun {
  id: string;
  projectId: string;
  datasetId: string;
  actorId: string;
  name: string;
  status: "queued" | "running" | "completed" | "failed";
  insight: string;
  createdAt: string;
}

export interface AppState {
  sessionUserId: string | null;
  organizations: Organization[];
  users: User[];
  projects: Project[];
  datasets: Dataset[];
  accessRequests: AccessRequest[];
  auditEvents: AuditEvent[];
  explorationRuns: ExplorationRun[];
  grantedDatasetIds: Record<string, string[]>;
}
