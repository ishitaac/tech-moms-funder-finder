import { formatDistanceToNow } from "date-fns";
import { allFlags } from "@/config/flags";
import { filterRows, parseFilters } from "@/lib/list-filters";
import { rankedRows } from "@/lib/queries";
import { Filters } from "./filters";
import { FunderTable } from "./funder-table";
import { TrustBanner } from "./trust-banner";

const MAX_ROWS = 300;

export async function FunderList({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const { rows, refresh } = await rankedRows();
  const today = new Date().toISOString().slice(0, 10);
  const visible = filterRows(rows, filters, today);
  const newCount = rows.filter((r) => r.isNew && !r.excludedReason).length;
  const excludedCount = rows.filter((r) => r.excludedReason).length;
  const focusFunder = Number(Array.isArray(params.funder) ? params.funder[0] : params.funder) || null;

  if (!refresh) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-muted">
        No ranked list yet. Run the first refresh from <a className="text-brand underline" href="/settings">Settings</a>.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TrustBanner />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        <span>
          Last refreshed <strong className="text-ink">{formatDistanceToNow(refresh.startedAt, { addSuffix: true })}</strong>
        </span>
        <span>·</span>
        <span>{rows.length.toLocaleString()} funders scored</span>
        {newCount > 0 && (
          <span className="rounded-full bg-rose-soft px-2 py-0.5 text-xs font-semibold text-plum">{newCount} new since last refresh</span>
        )}
      </div>
      <Filters filters={filters} excludedCount={excludedCount} />
      <FunderTable
        rows={visible.slice(0, MAX_ROWS)}
        totalMatching={visible.length}
        isExcludedView={filters.view === "excluded"}
        showPeople={allFlags().boardMembers}
        showDraft={allFlags().aiDraft}
        focusFunderId={focusFunder}
      />
    </div>
  );
}
