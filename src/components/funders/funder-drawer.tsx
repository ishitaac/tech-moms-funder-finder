"use client";

import { useEffect, useState, useTransition } from "react";
import { decide, loadFunderDetail } from "@/app/actions";
import { COMPONENT_KEYS, COMPONENT_LABELS } from "@/config/scoring";
import type { FunderDetail, ListRow } from "@/lib/queries";
import { BandBadge, ConfidenceDots, OpenCallBadge, SourceLink, typeLabel, usd } from "@/components/ui";
import { DraftPanel } from "./draft-panel";

interface Props {
  row: ListRow;
  onClose: () => void;
  showPeople: boolean;
  showDraft: boolean;
}

export function FunderDrawer({ row, onClose, showPeople, showDraft }: Props) {
  const [detail, setDetail] = useState<FunderDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setMessage(null);
    loadFunderDetail(row.funderId).then((d) => !cancelled && setDetail(d));
    return () => {
      cancelled = true;
    };
  }, [row.funderId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const act = (action: "approve" | "snooze" | "reject") =>
    startTransition(async () => {
      const r = await decide({ funderId: row.funderId, opportunityId: row.opportunityId, action });
      setMessage(
        r.ok
          ? { approve: "Added to your pipeline as a Prospect.", snooze: "Snoozed — it will come back later.", reject: "Rejected — hidden from future lists unless something changes." }[action]
          : r.error,
      );
    });

  const opp = detail?.opportunities.find((o) => o.id === row.opportunityId) ?? detail?.opportunities.find((o) => o.isOpen === "open");

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label={`${row.name} details`}>
      <button aria-label="Close" className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 border-b border-line bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">
                {typeLabel(row.type)}
                {row.state ? ` · ${row.state}` : ""}
              </p>
              <h2 className="text-xl font-medium text-brand">{row.name}</h2>
              {row.title && <p className="text-sm text-ink">{row.title}</p>}
            </div>
            <button onClick={onClose} className="rounded-md px-2 py-1 text-muted hover:bg-canvas" aria-label="Close panel">
              ✕
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="font-display text-3xl font-medium text-ink">{row.total ?? "—"}</span>
            <span className="text-xs text-muted">fit score</span>
            <BandBadge band={row.band} />
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <ConfidenceDots confidence={row.confidence} /> {row.confidence} confidence
            </span>
          </div>
        </header>

        <div className="flex-1 space-y-6 px-5 py-5 text-sm">
          <section>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Why this match</h3>
            <p className="text-ink">{row.excludedReason ? `Excluded: ${row.excludedReason}` : row.reason}</p>
            <div className="mt-1">
              <SourceLink href={row.reasonSourceUrl}>{row.filingYear ? `990 filing, tax year ${row.filingYear}` : "Source"}</SourceLink>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Score breakdown</h3>
            <ul className="space-y-3">
              {COMPONENT_KEYS.map((k) => {
                const c = row.components[k];
                return (
                  <li key={k}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-ink">{COMPONENT_LABELS[k]}</span>
                      <span className="text-xs text-muted">
                        weight {Math.round(c.weight * 100)}% · {c.score === null ? "unknown" : `${Math.round(c.score * 100)}/100`}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                      {c.score !== null && <div className="h-full rounded-full bg-brand" style={{ width: `${c.score * 100}%` }} />}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {c.evidence ?? "Unknown — no public evidence found."} {c.sourceUrl && <SourceLink href={c.sourceUrl} />}
                    </p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted">
              Components without evidence are left out and lower confidence instead of counting as zero. This is a fit score, not odds of winning.
            </p>
          </section>

          <section>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Open call</h3>
            <OpenCallBadge isOpen={row.isOpen} deadline={row.deadline} />
            {opp && opp.isOpen === "open" ? (
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted">Deadline</dt>
                <dd>{opp.deadline ?? "Rolling / not stated"}</dd>
                <dt className="text-muted">Route</dt>
                <dd>{opp.route === "loi" ? "Letter of inquiry first" : opp.route === "direct" ? "Direct application" : "Unknown"}</dd>
                {(opp.awardMin || opp.awardMax) && (
                  <>
                    <dt className="text-muted">Award</dt>
                    <dd>{[opp.awardMin, opp.awardMax].filter(Boolean).map((n) => usd(n)).join(" – ")}</dd>
                  </>
                )}
                <dt className="text-muted">Page</dt>
                <dd>
                  <SourceLink href={opp.sourceUrl}>Funder page</SourceLink>
                </dd>
              </dl>
            ) : (
              <p className="mt-2 text-muted">
                No open call found. {row.website ? <SourceLink href={row.website.startsWith("http") ? row.website : `https://${row.website}`}>Check the funder&apos;s website</SourceLink> : "Check the funder's 990 for application instructions below."}
              </p>
            )}
          </section>

          {detail?.applicationInfo && (
            <section>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">How to apply (from 990-PF)</h3>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <dt className="text-muted">Materials</dt>
                <dd>{detail.applicationInfo.materials ?? "—"}</dd>
                <dt className="text-muted">Deadlines</dt>
                <dd>{detail.applicationInfo.deadlines ?? "—"}</dd>
                <dt className="text-muted">Restrictions</dt>
                <dd>{detail.applicationInfo.restrictions ?? "—"}</dd>
              </dl>
              <SourceLink href={detail.applicationSourceUrl}>990 filing</SourceLink>
            </section>
          )}

          {detail && detail.topGrants.length > 0 && (
            <section>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                Past grants (Utah first){detail.filing ? ` · TY${detail.filing.taxYear}` : ""}
              </h3>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {detail.topGrants.map((g) => (
                  <li key={g.id} className="flex items-start justify-between gap-3 px-3 py-2">
                    <div>
                      <p className="font-medium text-ink">{g.recipientName}</p>
                      <p className="text-xs text-muted">
                        {[g.recipientCity, g.recipientState].filter(Boolean).join(", ")}
                        {g.purpose ? ` · ${g.purpose}` : ""}
                      </p>
                    </div>
                    <span className="whitespace-nowrap tabular-nums">{usd(g.amount)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showPeople && detail && detail.people.length > 0 && (
            <section>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Board & officers (public filing)</h3>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {detail.people.map((p) => (
                  <li key={p.id}>
                    <span className="font-medium text-ink">{p.name}</span>
                    {p.title && <span className="text-muted"> · {p.title}</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-muted">Names and titles only, as published in the 990. No contact details are collected.</p>
              <SourceLink href={detail.filing?.sourceUrl ?? null}>990 filing</SourceLink>
            </section>
          )}

          {showDraft && <DraftPanel funderId={row.funderId} funderName={row.name} />}
        </div>

        <footer className="sticky bottom-0 border-t border-line bg-white px-5 py-3">
          {message && <p className="mb-2 text-sm text-ink" role="status">{message}</p>}
          <div className="flex gap-2">
            <button disabled={pending} onClick={() => act("approve")} className="flex-1 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              Approve → pipeline
            </button>
            <button disabled={pending} onClick={() => act("snooze")} className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-60">
              Snooze
            </button>
            <button disabled={pending} onClick={() => act("reject")} className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-rose hover:bg-rose-soft disabled:opacity-60">
              Reject
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
