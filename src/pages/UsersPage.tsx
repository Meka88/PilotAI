import { useState } from "react";
import type { FormEvent } from "react";
import { Avatar, Badge, PageHeader, Panel } from "@/components/ui";
import { can, roleLabels } from "@/data/permissions";
import type { Role } from "@/data/types";
import { useApp } from "@/lib/store";

export function UsersPage() {
  const { state, currentUser, inviteUser, updateUserRole } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("explorer");

  if (!currentUser) return null;

  const users =
    currentUser.role === "global_admin"
      ? state.users
      : state.users.filter((u) => u.orgId === currentUser.orgId);

  const onInvite = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    inviteUser({ name: name.trim(), email: email.trim(), role });
    setName("");
    setEmail("");
    setRole("explorer");
  };

  return (
    <>
      <PageHeader
        title="Users & roles"
        subtitle="Invite teammates and adjust role boundaries within policy."
      />

      {can(currentUser.role, "manage_users") ? (
        <Panel title="Invite user">
          <form className="form-grid" onSubmit={onInvite}>
            <div className="grid grid-3">
              <div className="field">
                <label htmlFor="invite-name">Name</label>
                <input
                  id="invite-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="invite-email">Email</label>
                <input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="invite-role">Role</label>
                <select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <option value="explorer">Explorer</option>
                  <option value="admin">Admin</option>
                  {currentUser.role === "global_admin" ? (
                    <option value="global_admin">Global Admin</option>
                  ) : null}
                </select>
              </div>
            </div>
            <button className="btn" type="submit">
              Send invite
            </button>
          </form>
        </Panel>
      ) : null}

      <Panel title={`${users.length} people`} bodyClassName="">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Organization</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const org = state.organizations.find((o) => o.id === user.orgId);
              return (
                <tr key={user.id}>
                  <td>
                    <div className="user-chip">
                      <Avatar name={user.name} hue={user.avatarHue} />
                      <div className="meta">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{org?.name}</td>
                  <td>
                    {can(currentUser.role, "manage_users") &&
                    user.id !== currentUser.id ? (
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateUserRole(user.id, e.target.value as Role)
                        }
                        aria-label={`Change role for ${user.name}`}
                        style={{
                          border: "1px solid var(--line-strong)",
                          background: "rgba(7,17,31,0.65)",
                          borderRadius: 10,
                          padding: "0.4rem 0.55rem",
                        }}
                      >
                        <option value="explorer">Explorer</option>
                        <option value="admin">Admin</option>
                        {currentUser.role === "global_admin" ? (
                          <option value="global_admin">Global Admin</option>
                        ) : null}
                      </select>
                    ) : (
                      <Badge tone="teal">{roleLabels[user.role]}</Badge>
                    )}
                  </td>
                  <td>
                    <Badge
                      tone={
                        user.status === "active"
                          ? "ok"
                          : user.status === "invited"
                            ? "amber"
                            : "coral"
                      }
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="muted">{user.lastActive}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
