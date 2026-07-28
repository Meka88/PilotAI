import type { ReactNode } from "react";
import { classNames } from "@/lib/format";

export function Badge({
  tone = "muted",
  children,
}: {
  tone?: "teal" | "amber" | "coral" | "ok" | "muted";
  children: ReactNode;
}) {
  return <span className={classNames("badge", `badge-${tone}`)}>{children}</span>;
}

export function Avatar({ name, hue, size = 34 }: { name: string; hue: number; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, hsl(${hue} 55% 42%), hsl(${(hue + 40) % 360} 45% 28%))`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress" aria-label={`${value}% complete`}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      <p className="muted" style={{ marginTop: "0.35rem" }}>
        {body}
      </p>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-hero">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {actions ? <div className="row">{actions}</div> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  bodyClassName,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>{title}</h3>
        {action}
      </div>
      <div className={classNames("panel-body", bodyClassName)}>{children}</div>
    </section>
  );
}
