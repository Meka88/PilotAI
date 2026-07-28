import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSeedState, STORAGE_KEY } from "@/data/seed";
import type {
  AccessRequestStatus,
  AppState,
  ProjectStatus,
  Role,
  User,
} from "@/data/types";
import { uid } from "@/lib/format";

interface AppContextValue {
  state: AppState;
  currentUser: User | null;
  loginAs: (userId: string) => void;
  logout: () => void;
  resetDemo: () => void;
  createProject: (input: {
    name: string;
    description: string;
    tags: string[];
  }) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  requestAccess: (datasetId: string, reason: string) => void;
  reviewAccess: (
    requestId: string,
    status: Exclude<AccessRequestStatus, "pending">,
    reviewNote: string,
  ) => void;
  inviteUser: (input: {
    name: string;
    email: string;
    role: Role;
  }) => void;
  updateUserRole: (userId: string, role: Role) => void;
  updateOrgSeats: (orgId: string, seats: number) => void;
  runExploration: (input: {
    projectId: string;
    datasetId: string;
    name: string;
  }) => void;
  hasDatasetAccess: (datasetId: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    return { ...createSeedState(), ...JSON.parse(raw) } as AppState;
  } catch {
    return createSeedState();
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.sessionUserId) ?? null,
    [state.users, state.sessionUserId],
  );

  const value = useMemo<AppContextValue>(() => {
    const pushAudit = (
      draft: AppState,
      action: string,
      target: string,
      severity: "info" | "warning" | "critical" = "info",
      orgId?: string,
    ) => {
      const actorId = draft.sessionUserId ?? "system";
      draft.auditEvents = [
        {
          id: uid("aud"),
          orgId: orgId ?? draft.users.find((u) => u.id === actorId)?.orgId ?? "system",
          actorId,
          action,
          target,
          severity,
          createdAt: new Date().toISOString(),
        },
        ...draft.auditEvents,
      ];
    };

    return {
      state,
      currentUser,
      loginAs: (userId) => {
        setState((prev) => {
          const next = structuredClone(prev);
          next.sessionUserId = userId;
          pushAudit(next, "Signed in", next.users.find((u) => u.id === userId)?.email ?? userId);
          return next;
        });
      },
      logout: () => {
        setState((prev) => {
          const next = structuredClone(prev);
          if (next.sessionUserId) {
            pushAudit(next, "Signed out", next.sessionUserId);
          }
          next.sessionUserId = null;
          return next;
        });
      },
      resetDemo: () => {
        const fresh = createSeedState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        setState(fresh);
      },
      createProject: ({ name, description, tags }) => {
        setState((prev) => {
          if (!prev.sessionUserId) return prev;
          const user = prev.users.find((u) => u.id === prev.sessionUserId);
          if (!user) return prev;
          const next = structuredClone(prev);
          const code = `${user.orgId.split("-")[1]?.slice(0, 2).toUpperCase() ?? "PX"}-${name
            .slice(0, 5)
            .toUpperCase()
            .replace(/\s/g, "")}`;
          next.projects = [
            {
              id: uid("proj"),
              orgId: user.orgId,
              name,
              code,
              description,
              status: "draft",
              ownerId: user.id,
              datasetIds: [],
              tags,
              progress: 5,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
            ...next.projects,
          ];
          pushAudit(next, "Created project", name, "info", user.orgId);
          return next;
        });
      },
      updateProjectStatus: (projectId, status) => {
        setState((prev) => {
          const next = structuredClone(prev);
          const project = next.projects.find((p) => p.id === projectId);
          if (!project) return prev;
          project.status = status;
          project.updatedAt = new Date().toISOString();
          pushAudit(next, `Set project status to ${status}`, project.code, "info", project.orgId);
          return next;
        });
      },
      requestAccess: (datasetId, reason) => {
        setState((prev) => {
          if (!prev.sessionUserId) return prev;
          const user = prev.users.find((u) => u.id === prev.sessionUserId);
          const dataset = prev.datasets.find((d) => d.id === datasetId);
          if (!user || !dataset) return prev;
          const next = structuredClone(prev);
          next.accessRequests = [
            {
              id: uid("req"),
              requesterId: user.id,
              datasetId,
              orgId: dataset.orgId,
              reason,
              status: "pending",
              createdAt: new Date().toISOString(),
            },
            ...next.accessRequests,
          ];
          pushAudit(next, "Requested dataset access", dataset.name, "warning", dataset.orgId);
          return next;
        });
      },
      reviewAccess: (requestId, status, reviewNote) => {
        setState((prev) => {
          const actorId = prev.sessionUserId;
          if (!actorId) return prev;
          const next = structuredClone(prev);
          const request = next.accessRequests.find((r) => r.id === requestId);
          if (!request || request.status !== "pending") return prev;
          request.status = status;
          request.reviewedById = actorId;
          request.reviewedAt = new Date().toISOString();
          request.reviewNote = reviewNote;
          if (status === "approved") {
            const granted = next.grantedDatasetIds[request.requesterId] ?? [];
            if (!granted.includes(request.datasetId)) {
              next.grantedDatasetIds[request.requesterId] = [
                ...granted,
                request.datasetId,
              ];
            }
          }
          const dataset = next.datasets.find((d) => d.id === request.datasetId);
          pushAudit(
            next,
            status === "approved" ? "Approved access request" : "Denied access request",
            dataset?.name ?? request.datasetId,
            status === "approved" ? "info" : "warning",
            request.orgId,
          );
          return next;
        });
      },
      inviteUser: ({ name, email, role }) => {
        setState((prev) => {
          if (!prev.sessionUserId) return prev;
          const actor = prev.users.find((u) => u.id === prev.sessionUserId);
          if (!actor) return prev;
          const next = structuredClone(prev);
          const orgId =
            actor.role === "global_admin" ? actor.orgId : actor.orgId;
          next.users = [
            {
              id: uid("user"),
              name,
              email,
              role,
              orgId,
              title: role === "admin" ? "Org Admin" : "Explorer",
              avatarHue: Math.floor(Math.random() * 360),
              lastActive: "Never",
              status: "invited",
            },
            ...next.users,
          ];
          const org = next.organizations.find((o) => o.id === orgId);
          if (org) org.usedSeats += 1;
          pushAudit(next, "Invited user", email, "info", orgId);
          return next;
        });
      },
      updateUserRole: (userId, role) => {
        setState((prev) => {
          const next = structuredClone(prev);
          const user = next.users.find((u) => u.id === userId);
          if (!user) return prev;
          user.role = role;
          pushAudit(next, "Updated user role", `${user.email} → ${role}`, "critical", user.orgId);
          return next;
        });
      },
      updateOrgSeats: (orgId, seats) => {
        setState((prev) => {
          const next = structuredClone(prev);
          const org = next.organizations.find((o) => o.id === orgId);
          if (!org) return prev;
          org.seats = seats;
          pushAudit(next, "Updated organization seat pool", `${org.name} → ${seats} seats`, "critical", orgId);
          return next;
        });
      },
      runExploration: ({ projectId, datasetId, name }) => {
        setState((prev) => {
          const actorId = prev.sessionUserId;
          if (!actorId) return prev;
          const next = structuredClone(prev);
          next.explorationRuns = [
            {
              id: uid("run"),
              projectId,
              datasetId,
              actorId,
              name,
              status: "running",
              insight: "Exploration queued on PilotAI compute…",
              createdAt: new Date().toISOString(),
            },
            ...next.explorationRuns,
          ];
          const project = next.projects.find((p) => p.id === projectId);
          pushAudit(next, "Started exploration run", name, "info", project?.orgId);
          return next;
        });
        window.setTimeout(() => {
          setState((prev) => {
            const next = structuredClone(prev);
            const run = next.explorationRuns.find(
              (r) =>
                r.name === name &&
                r.projectId === projectId &&
                r.status === "running",
            );
            if (run) {
              run.status = "completed";
              run.insight =
                "PilotAI surfaced a high-confidence pattern: focus on the top 12% of anomalous segments for the next playbook.";
            }
            return next;
          });
        }, 1800);
      },
      hasDatasetAccess: (datasetId) => {
        if (!currentUser) return false;
        if (currentUser.role === "global_admin") return true;
        if (currentUser.role === "admin") {
          const dataset = state.datasets.find((d) => d.id === datasetId);
          return dataset?.orgId === currentUser.orgId;
        }
        const granted = state.grantedDatasetIds[currentUser.id] ?? [];
        return granted.includes(datasetId);
      },
    };
  }, [state, currentUser]);

  return createElement(AppContext.Provider, { value }, children);
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
