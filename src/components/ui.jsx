import Icon from "./Icon.jsx";
import { initials } from "../lib/format.js";

export function Badge({ tone = "neutral", children, dot = false }) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot ? <span className="badge-dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function Avatar({ name, size = "md", tone = "green" }) {
  return (
    <span className={`avatar avatar-${size} avatar-${tone}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="page-head">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p className="page-sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({ icon = "chat", title, text, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={24} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function CardHeader({ title, hint, action }) {
  return (
    <div className="card-head">
      <div>
        <h2>{title}</h2>
        {hint ? <p>{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}
