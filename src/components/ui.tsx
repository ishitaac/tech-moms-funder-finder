import type { ReactNode } from "react";

const BAND_STYLES: Record<string, string> = {
  Strong: "bg-strong-soft text-strong ring-strong/20",
  "Worth a look": "bg-worth-soft text-worth ring-worth/20",
  "Long shot": "bg-long-soft text-long ring-long/20",
};

export function BandBadge({ band }: { band: string | null }) {
  if (!band) return <span className="text-xs text-muted">—</span>;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${BAND_STYLES[band] ?? ""}`}>
      {band}
    </span>
  );
}

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function ConfidenceDots({ confidence }: { confidence: string | null }) {
  const n = confidence === "high" ? 3 : confidence === "medium" ? 2 : 1;
  const label = CONFIDENCE_LABEL[confidence ?? "low"];
  return (
    <span className="inline-flex items-center gap-0.5" title={`${label}: share of score components backed by real evidence`} aria-label={label}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= n ? "bg-brand" : "bg-line"}`} />
      ))}
    </span>
  );
}

export function ScoreCell({ total }: { total: number | null }) {
  if (total === null) return <span className="text-muted">—</span>;
  return (
    <div className="flex items-center gap-2" title="Fit score (0–100) — not odds of winning">
      <span className="w-7 text-right font-display text-lg font-medium tabular-nums text-ink">{total}</span>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-line">
        <span className="block h-full rounded-full bg-brand" style={{ width: `${total}%` }} />
      </span>
    </div>
  );
}

export function OpenCallBadge({ isOpen, deadline }: { isOpen: boolean; deadline: string | null }) {
  if (!isOpen) {
    return <span className="inline-flex rounded-full bg-long-soft px-2 py-0.5 text-xs font-medium text-muted">Unknown</span>;
  }
  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-teal-soft px-2 py-0.5 text-xs font-semibold text-teal ring-1 ring-inset ring-teal/30">
      Open call{deadline ? ` · ${deadline}` : ""}
    </span>
  );
}

const TYPE_LABEL: Record<string, string> = {
  state: "State grant",
  federal: "Federal grant",
  corporate: "Corporate",
  foundation: "Foundation",
  family_foundation: "Family foundation",
};

export const typeLabel = (t: string) => TYPE_LABEL[t] ?? t;

export function TypeTag({ type }: { type: string }) {
  return <span className="whitespace-nowrap text-xs text-muted">{typeLabel(type)}</span>;
}

export function SourceLink({ href, children }: { href: string | null; children?: ReactNode }) {
  if (!href) return <span className="text-xs text-muted">source unknown</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand">
      {children ?? "Source"} ↗
    </a>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-medium text-brand">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export const usd = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `$${Math.round(n).toLocaleString("en-US")}`;
