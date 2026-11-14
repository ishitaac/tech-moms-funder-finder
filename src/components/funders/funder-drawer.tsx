"use client";

import { useEffect, useRef, useState } from "react";
import { loadFunderDetail } from "@/app/actions";
import { COMPONENT_KEYS, COMPONENT_LABELS } from "@/config/scoring";
import type { FunderDetail, ListRow } from "@/lib/queries";
import { CloseIcon } from "@/components/icons";
import { ConfidenceDots, OpenCallBadge, Pill, ScoreBadge, BandBadge, SourceLink, TypeTag, usd } from "@/components/ui";
import { ActionButtons } from "./action-buttons";
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
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    // The parent remounts this drawer per funder (key), so state starts fresh for each.
    let cancelled = false;
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

  const opp = detail?.opportunities.find((o) => o.id === row.opportunityId) ?? detail?.opportunities.find((o) => o.isOpen === "open");

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label={`${row.name} details`}>
      <button type="button" aria-label="Close" tabIndex={-1} className="absolute inset-0 bg-plum/30" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-card shadow-2xl">
        <header className="sticky top-0 z-10 border-b border-line bg-card px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-medium leading-snug text-plum">{row.name}</h2>
              {row.title && <p className="mt-1 text-sm text-muted">{row.title}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <TypeTag type={row.type} />
                {row.state && <Pill>{row.state}</Pill>}
                <OpenCallBadge isOpen={row.isOpen} deadline={row.deadline} />
              </div>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} className="rounded-full p-2 text-plum hover:bg-plum-tint" aria-label="Close panel">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <ScoreBadge total={row.total} band={row.band} size="md" />
            <div className="space-y-1">
              <BandBadge band={row.band} />
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <ConfidenceDots confidence={row.confidence} /> {row.confidence} confidence
              </p>
            </div>
          </div>
          {!row.excludedReason && (
            <ActionButtons funderId={row.funderId} opportunityId={row.opportunityId} funderName={row.name} onResult={setMessage} className="mt-4" />
          )}
          <p role="status" aria-live="polite" className={message ? "mt-3 rounded-full bg-teal-tint px-4 py-2 text-sm text-plum" : "sr-only"}>
            {message}
          </p>
        </header>

        <div className="flex-1 space-y-8 px-6 py-6 text-sm">
          <section>
            <h3 className="mb-1.5 text-sm font-medium text-plum">Why this match</h3>
            <p className="text-plum">{row.excludedReason ? `Excluded: ${row.excludedReason}` : row.reason}</p>
            <div className="mt-1">
              <SourceLink href={row.reasonSourceUrl}>{row.filingYear ? `990 filing, tax year ${row.filingYear}` : "Source"}</SourceLink>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-medium text-plum">Score breakdown</h3>
            <ul className="space-y-3">
              {COMPONENT_KEYS.map((k) => {
                const c = row.components[k];
                return (
                  <li key={k}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-plum">{COMPONENT_LABELS[k]}</span>
                      <span className="text-xs text-muted">
                        weight {Math.round(c.weight * 100)}% · {c.score === null ? "unknown" : `${Math.round(c.score * 100)}/100`}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-plum-tint">
                      {c.score !== null && <div className="h-full rounded-full bg-teal-logo" style={{ width: `${c.score * 100}%` }} />}
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
            <h3 className="mb-1.5 text-sm font-medium text-plum">Open call</h3>
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
              <h3 className="mb-1.5 text-sm font-medium text-plum">How to apply (from 990-PF)</h3>
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
              <h3 className="mb-1.5 text-sm font-medium text-plum">
                Past grants (Utah first){detail.filing ? ` · TY${detail.filing.taxYear}` : ""}
              </h3>
              <ul className="divide-y divide-line rounded-[12px] border border-line">
                {detail.topGrants.map((g) => (
                  <li key={g.id} className="flex items-start justify-between gap-3 px-3 py-2">
                    <div>
                      <p className="font-medium text-plum">{g.recipientName}</p>
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
              <h3 className="mb-1.5 text-sm font-medium text-plum">Board & officers (public filing)</h3>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {detail.people.map((p) => (
                  <li key={p.id}>
                    <span className="font-medium text-plum">{p.name}</span>
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

      </aside>
    </div>
  );
}
