import type { CSSProperties, ReactNode } from "react";

/* ---------- Cards ---------- */

/** White card: 16px radius, 1px soft border, light shadow, 20px padding. */
export const CARD = "rounded-[16px] border border-line bg-card shadow-card";

export function Card({ children, className = "", as: Tag = "section", ...rest }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" } & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`${CARD} p-5 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function StatCard({ label, value, hint, icon, tone = "plum" }: { label: string; value: ReactNode; hint?: ReactNode; icon: ReactNode; tone?: "plum" | "teal" | "rose" }) {
  const toneBg = { plum: "bg-plum-tint", teal: "bg-teal-tint", rose: "bg-rose-tint" }[tone];
  return (
    <div className={`${CARD} flex items-start gap-4 p-5`}>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-plum ${toneBg}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-medium tabular-nums text-plum">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}

/* ---------- Buttons ---------- */

const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
export const BTN = {
  primary: `${BTN_BASE} bg-plum text-white hover:bg-plum/90`,
  secondary: `${BTN_BASE} border border-plum/30 bg-card text-plum hover:bg-plum-tint`,
  soft: `${BTN_BASE} border border-rose/50 bg-card text-plum hover:bg-rose-tint`,
} as const;

/* ---------- Pills (always carry a text label; never color alone) ---------- */

type Tone = "plum" | "teal" | "rose" | "neutral";
const PILL_TONE: Record<Tone, string> = {
  plum: "bg-plum-tint text-plum border-plum/20",
  teal: "bg-teal text-plum border-teal-logo/40", // text on teal fills is always plum
  rose: "bg-rose-tint text-plum border-rose/40",
  neutral: "bg-card text-muted border-line",
};

export function Pill({ children, tone = "neutral", icon, className = "" }: { children: ReactNode; tone?: Tone; icon?: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${PILL_TONE[tone]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}

const BAND_TONE: Record<string, Tone> = { Strong: "teal", "Worth a look": "rose", "Long shot": "plum" };
const BAND_COLOR: Record<string, string> = { Strong: "#40c4c8", "Worth a look": "#be677c", "Long shot": "#b9a3b1" };

export function BandBadge({ band }: { band: string | null }) {
  if (!band) return <span className="text-xs text-muted">—</span>;
  return <Pill tone={BAND_TONE[band] ?? "neutral"}>{band}</Pill>;
}

/** Large circular fit score: a ring filled to the score, number inside, band named in text beside/below it. */
export function ScoreBadge({ total, band, size = "lg" }: { total: number | null; band: string | null; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-[72px] w-[72px]" : "h-14 w-14";
  const color = BAND_COLOR[band ?? ""] ?? "#b9a3b1";
  const style: CSSProperties = { background: `conic-gradient(${color} ${total ?? 0}%, var(--plum-tint) 0)` };
  return (
    <span
      role="img"
      aria-label={total === null ? "No fit score" : `Fit score ${total} out of 100${band ? `, ${band}` : ""}`}
      title="Fit score (0–100) — not odds of winning"
      style={style}
      className={`inline-flex shrink-0 items-center justify-center rounded-full p-[5px] ${dim}`}
    >
      <span className="flex h-full w-full flex-col items-center justify-center rounded-full bg-card leading-none">
        <span className={`font-medium tabular-nums text-plum ${size === "lg" ? "text-2xl" : "text-lg"}`}>{total ?? "—"}</span>
        {size === "lg" && <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">fit</span>}
      </span>
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
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= n ? "bg-plum" : "bg-plum/20"}`} />
      ))}
    </span>
  );
}

/** Only shown when an open call is known; unknown status renders nothing. */
export function OpenCallBadge({ isOpen, deadline }: { isOpen: boolean; deadline: string | null }) {
  if (!isOpen) return null;
  return <Pill tone="teal">Open call{deadline ? ` · due ${deadline}` : ""}</Pill>;
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
  return <Pill tone="plum">{typeLabel(type)}</Pill>;
}

export function SourceLink({ href, children }: { href: string | null; children?: ReactNode }) {
  if (!href) return <span className="text-xs text-muted">source unknown</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-plum underline decoration-plum/40 underline-offset-2 hover:decoration-plum">
      {children ?? "Source"} ↗
    </a>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-medium text-plum">{title}</h1>
        {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export const usd = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `$${Math.round(n).toLocaleString("en-US")}`;
