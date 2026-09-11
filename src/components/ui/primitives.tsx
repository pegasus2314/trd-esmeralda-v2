import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-navy-800 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="block text-[11px] font-extrabold tracking-[0.16em] text-cyan uppercase">
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-7 max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-1.5 font-display text-4xl leading-tight">{title}</h2>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}
    </div>
  );
}

export function Field({
  label,
  children,
  className = "",
  ...rest
}: { label: string; children: ReactNode } & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`grid gap-1.5 text-[12.5px] font-bold text-[#c7d9e3] ${className}`} {...rest}>
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "w-full min-h-11.5 rounded-lg border border-line bg-navy-900 px-3.5 py-2.5 text-ink outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20 placeholder:text-muted-2/80";

export function Badge({
  tone = "default",
  children,
}: {
  tone?: "default" | "success" | "warning" | "danger";
  children: ReactNode;
}) {
  const tones = {
    default: "bg-white/[0.06] text-celeste",
    success: "bg-success-bg text-success",
    warning: "bg-warning-bg text-warning",
    danger: "bg-danger-bg text-[#fca5a5]",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[10.5px] font-extrabold whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong p-7 text-center text-muted">
      {icon && <div className="mb-2 text-2xl">{icon}</div>}
      <div className="font-bold text-ink">{title}</div>
      {description && <p className="mt-1 text-sm">{description}</p>}
    </div>
  );
}

export function FormMessage({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "error" | "success" }) {
  if (!children) return null;
  const colors = {
    default: "text-muted",
    error: "text-danger",
    success: "text-success",
  };
  return <p className={`text-[12.5px] ${colors[tone]}`}>{children}</p>;
}
