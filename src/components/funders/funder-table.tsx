"use client";

import { useState } from "react";
import type { ListRow } from "@/lib/queries";
import { BandBadge, CARD, ConfidenceDots, OpenCallBadge, Pill, ScoreBadge, TypeTag } from "@/components/ui";
import { ActionButtons } from "./action-buttons";
import { FunderDrawer } from "./funder-drawer";

interface Props {
  rows: ListRow[];
  totalMatching: number;
  isExcludedView: boolean;
  showPeople: boolean;
  showDraft: boolean;
  focusFunderId: number | null;
}

const TOP_N = 3;

/** Funder results as card rows (file name kept; it is no longer a table). */
export function FunderTable({ rows, totalMatching, isExcludedView, showPeople, showDraft, focusFunderId }: Props) {
  const [selected, setSelected] = useState<ListRow | null>(() => rows.find((r) => r.funderId === focusFunderId) ?? null);
  const [notice, setNotice] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <div className={`${CARD} border-dashed p-10 text-center text-sm text-muted`}>
        No funders match these filters.
      </div>
    );
  }

  return (
    <>
      <p role="status" aria-live="polite" className={notice ? "rounded-full bg-teal-tint px-4 py-2 text-sm text-plum" : "sr-only"}>
        {notice}
      </p>
      <ul className="space-y-3">
        {rows.map((r, i) => {
          const isTop = !isExcludedView && i < TOP_N;
          const isSelected = selected?.scoreId === r.scoreId;
          return (
            <li
              key={r.scoreId}
              className={`${CARD} relative p-5 transition-shadow hover:shadow-md ${isTop ? "border-l-4 border-l-teal bg-teal-tint/40" : ""} ${isSelected ? "ring-2 ring-plum" : ""}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex shrink-0 items-center gap-3 sm:w-28 sm:flex-col sm:gap-2">
                  <ScoreBadge total={r.total} band={r.band} />
                  <div className="flex flex-col items-start gap-1 sm:items-center">
                    <BandBadge band={r.band} />
                    <ConfidenceDots confidence={r.confidence} />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-medium leading-snug">
                      <button type="button" onClick={() => setSelected(r)} className="text-left text-plum hover:underline">
                        {r.name}
                      </button>
                    </h3>
                    {isTop && <Pill tone="teal">Top {i + 1}</Pill>}
                  </div>
                  {r.title && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{r.title}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <TypeTag type={r.type} />
                    {r.state && <Pill>{r.state}</Pill>}
                    {r.isNew && <Pill tone="rose">New</Pill>}
                    {r.decision === "approve" && <Pill tone="plum">In pipeline</Pill>}
                    {r.reason?.includes("Has funded Tech-Moms") && <Pill tone="teal">Past funder</Pill>}
                    <OpenCallBadge isOpen={r.isOpen} deadline={r.deadline} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed">{isExcludedView ? r.excludedReason : r.reason}</p>

                  {!isExcludedView && (
                    <ActionButtons funderId={r.funderId} opportunityId={r.opportunityId} funderName={r.name} onResult={setNotice} className="mt-4" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(r)}
                  className="self-start text-sm font-medium text-plum underline decoration-plum/40 underline-offset-4 hover:decoration-plum"
                  aria-label={`View details for ${r.name}`}
                >
                  Details
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {totalMatching > rows.length && (
        <p className="text-center text-xs text-muted">
          Showing top {rows.length} of {totalMatching.toLocaleString()}. Narrow with filters or search.
        </p>
      )}
      {selected && (
        <FunderDrawer key={selected.scoreId} row={selected} onClose={() => setSelected(null)} showPeople={showPeople} showDraft={showDraft} />
      )}
    </>
  );
}
