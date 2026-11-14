import { addDays, formatDistanceToNow } from "date-fns";
import { allFlags } from "@/config/flags";
import { filterRows, parseFilters } from "@/lib/list-filters";
import { pipelineCards, stageTotal, upcomingDeadlines } from "@/lib/pipeline-queries";
import { rankedRows } from "@/lib/queries";
import { CalendarIcon, CoinsIcon, DoorIcon, SparkleIcon } from "@/components/icons";
import { CARD, StatCard, usd } from "@/components/ui";
import { Filters } from "./filters";
import { FunderTable } from "./funder-table";
import { TrustBanner } from "./trust-banner";

const MAX_ROWS = 300;
const DEADLINE_SOON_DAYS = 14;

export async function FunderList({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [{ rows, refresh }, cards, deadlines] = await Promise.all([rankedRows(), pipelineCards(), upcomingDeadlines()]);
  const today = new Date().toISOString().slice(0, 10);
  const visible = filterRows(rows, filters, today);
  const active = rows.filter((r) => !r.excludedReason);
  const newCount = active.filter((r) => r.isNew).length;
  const openCalls = active.filter((r) => r.isOpen).length;
  const soonCutoff = addDays(new Date(), DEADLINE_SOON_DAYS).toISOString().slice(0, 10);
  const dueSoon = deadlines.filter((d) => d.deadline <= soonCutoff).length;
  const pipelineTotal = (["prospect", "loi", "submitted"] as const).reduce((s, st) => s + stageTotal(cards, st), 0);
  const excludedCount = rows.length - active.length;
  const focusFunder = Number(Array.isArray(params.funder) ? params.funder[0] : params.funder) || null;

  if (!refresh) {
    return (
      <div className={`${CARD} border-dashed p-10 text-center text-muted`}>
        No ranked list yet. Run the first refresh from <a className="text-plum underline" href="/settings">Settings</a>.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TrustBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New matches" value={newCount} hint="since last refresh" icon={<SparkleIcon />} tone="rose" />
        <StatCard label="Open calls" value={openCalls} hint="accepting applications" icon={<DoorIcon />} tone="teal" />
        <StatCard label="Deadlines" value={dueSoon} hint={`in the next ${DEADLINE_SOON_DAYS} days`} icon={<CalendarIcon />} tone="plum" />
        <StatCard label="Pipeline total" value={usd(pipelineTotal)} hint="asked, still in progress" icon={<CoinsIcon />} tone="teal" />
      </div>

      <p className="text-sm text-muted">
        Last refreshed <strong className="font-medium text-plum">{formatDistanceToNow(refresh.startedAt, { addSuffix: true })}</strong> ·{" "}
        {rows.length.toLocaleString()} funders scored
      </p>

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
