import { useApp } from "@/lib/store";
import { Avatar, Badge } from "@/components/ui";
import { roleLabels } from "@/data/permissions";

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  const { currentUser, logout, resetDemo } = useApp();
  if (!currentUser) return null;

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-actions">
        <Badge tone="teal">{roleLabels[currentUser.role]}</Badge>
        <button className="btn btn-secondary btn-sm" type="button" onClick={resetDemo}>
          Reset demo
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={logout}>
          Sign out
        </button>
        <div className="user-chip">
          <Avatar name={currentUser.name} hue={currentUser.avatarHue} />
        </div>
      </div>
    </header>
  );
}
