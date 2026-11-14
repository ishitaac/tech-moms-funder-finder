"use client";

import { useState } from "react";
import type { ListRow } from "@/lib/queries";
import { BandBadge, ConfidenceDots, OpenCallBadge, ScoreCell, TypeTag } from "@/components/ui";
import { FunderDrawer } from "./funder-drawer";

interface Props {
  rows: ListRow[];
  totalMatching: number;
  isExcludedView: boolean;
  showPeople: boolean;
  showDraft: boolean;
  focusFunderId: number | null;
}

export function FunderTable({ rows, totalMatching, isExcludedView, showPeople, showDraft, focusFunderId }: Props) {
  const [selected, setSelected] = useState<ListRow | null>(() => rows.find((r) => r.funderId === focusFunderId) ?? null);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
        No funders match these filters.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Fit</th>
              <th className="px-4 py-2.5 font-semibold">Funder</th>
              <th className="px-4 py-2.5 font-semibold">{isExcludedView ? "Why excluded" : "Why this match"}</th>
              <th className="px-4 py-2.5 font-semibold">Open call</th>
              <th className="px-4 py-2.5 font-semibold">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const isSelected = selected?.scoreId === r.scoreId;
              return (
                <tr
                  key={r.scoreId}
                  onClick={() => setSelected(r)}
                  className={`cursor-pointer align-top transition-colors ${isSelected ? "bg-brand-soft" : "hover:bg-canvas"}`}
                >
                  <td className="px-4 py-3">
                    <ScoreCell total={r.total} />
                    <div className="mt-1.5 flex items-center gap-2">
                      <BandBadge band={r.band} />
                      <ConfidenceDots confidence={r.confidence} />
                    </div>
                  </td>
                  <td className="max-w-64 px-4 py-3">
                    <button
                      className="text-left font-semibold text-ink hover:text-brand focus-visible:text-brand"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(r);
                      }}
                    >
                      {r.name}
                    </button>
                    {r.title && <div className="mt-0.5 line-clamp-2 text-xs text-ink/80">{r.title}</div>}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <TypeTag type={r.type} />
                      {r.state && <span className="text-xs text-muted">· {r.state}</span>}
                      {r.isNew && <span className="rounded bg-rose-soft px-1.5 text-[11px] font-semibold text-plum">NEW</span>}
                      {r.decision === "approve" && <span className="rounded bg-strong-soft px-1.5 text-[11px] font-semibold text-strong">IN PIPELINE</span>}
                      {r.reason?.includes("Has funded Tech-Moms") && (
                        <span className="rounded bg-teal-soft px-1.5 text-[11px] font-semibold text-teal">PAST FUNDER</span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-md px-4 py-3 text-ink/90">
                    <p className="line-clamp-2">{isExcludedView ? r.excludedReason : r.reason}</p>
                  </td>
                  <td className="px-4 py-3">
                    <OpenCallBadge isOpen={r.isOpen} deadline={r.deadline} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{r.filingYear ? `990 · TY${r.filingYear}` : r.opportunityId ? "Listing" : "Website"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalMatching > rows.length && (
        <p className="text-center text-xs text-muted">
          Showing top {rows.length} of {totalMatching.toLocaleString()}. Narrow with filters or search.
        </p>
      )}
      {selected && (
        <FunderDrawer row={selected} onClose={() => setSelected(null)} showPeople={showPeople} showDraft={showDraft} />
      )}
    </>
  );
}
