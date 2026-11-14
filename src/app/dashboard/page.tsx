import { Suspense, type ReactNode } from "react";
import { CommittedVsReceived, SingleBars } from "@/components/dashboard/charts";
import { PageHeader, typeLabel, usd } from "@/components/ui";
import { isEnabled } from "@/config/flags";
import { distinctByMonth, fundingMix, giftRanges, winRateByType } from "@/lib/dashboard-model";
import { committedVsReceivedByMonth, paymentRows, pipelineCards, STAGE_LABELS, STAGES, stageTotal, upcomingDeadlines } from "@/lib/pipeline-queries";

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-white p-4 ${className}`}>
      <h2 className="text-base font-medium text-ink">{title}</h2>
      {subtitle && <p className="mb-3 text-xs text-muted">{subtitle}</p>}
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display text-2xl font-medium text-ink tabular-nums">{value}</p>
    </div>
  );
}

async function Dashboard() {
  const [cards, payments, deadlines] = await Promise.all([pipelineCards(), paymentRows(), upcomingDeadlines()]);
  const committed = stageTotal(cards, "awarded");
  const received = payments.reduce((s, p) => s + p.amount, 0);
  const inProgress = cards.filter((c) => ["prospect", "loi", "submitted"].includes(c.stage)).reduce((s, c) => s + (c.amountAsked ?? 0), 0);
  const hasSample = cards.some((c) => c.isSample);
  const full = isEnabled("fullDashboard");

  return (
    <div className="space-y-4">
      {hasSample && <p className="text-xs text-muted">Includes SAMPLE pipeline data for the demo (Tech-Moms has no CRM yet).</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Committed" value={usd(committed)} />
        <Stat label="Received" value={usd(received)} />
        <Stat label="Still to receive" value={usd(Math.max(0, committed - received))} />
        <Stat label="Asked, in progress" value={usd(inProgress)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Committed vs. received" subtitle="Awarded amounts by award month, payments by month received">
          <CommittedVsReceived data={committedVsReceivedByMonth(cards, payments)} />
        </Card>
        <Card title="Pipeline by stage" subtitle="Dollars asked (awarded for the Awarded stage)">
          <SingleBars valueLabel="Dollars" data={STAGES.map((s) => ({ label: `${STAGE_LABELS[s]} (${cards.filter((c) => c.stage === s).length})`, value: stageTotal(cards, s) }))} />
        </Card>
      </div>

      <Card title="Upcoming deadlines" subtitle="Applications in your pipeline and open calls due in the next 60 days">
        {deadlines.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Nothing due in the next 60 days.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr><th className="py-1.5">Due</th><th>Funder</th><th>What</th><th>Type</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {deadlines.map((d) => (
                <tr key={d.key}>
                  <td className="py-2 font-semibold tabular-nums text-plum">{d.deadline}</td>
                  <td className="font-medium">{d.funderName}</td>
                  <td className="text-ink/80">{d.title}</td>
                  <td className="text-xs text-muted">{d.kind}</td>
                  <td className="text-right">
                    <a className="text-xs font-semibold text-brand hover:underline" href={`/api/calendar/${d.key}`}>Add to calendar</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {full && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Funding mix" subtitle="Received dollars by funder type">
            <SingleBars valueLabel="Received" data={fundingMix(payments).map((m) => ({ label: typeLabel(m.type), value: m.amount }))} />
          </Card>
          <Card title="Gift ranges" subtitle="Number of payments in each size band">
            <SingleBars isMoney={false} valueLabel="Gifts" data={giftRanges(payments).map((g) => ({ label: g.label, value: g.count }))} />
          </Card>
          <Card title="Win rate by funder type" subtitle="Awarded ÷ (awarded + declined)">
            <SingleBars isMoney={false} valueLabel="Win rate %" data={winRateByType(cards).map((w) => ({ label: typeLabel(w.type), value: Math.round(w.rate * 100) }))} />
          </Card>
          <Card title="Distinct gifts and funders" subtitle="Per month; funders reported as organizations only">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted"><tr><th className="py-1.5">Month</th><th>Gifts</th><th>Funders</th></tr></thead>
              <tbody className="divide-y divide-line">
                {distinctByMonth(payments).map((r) => <tr key={r.month}><td className="py-1.5">{r.month}</td><td className="tabular-nums">{r.gifts}</td><td className="tabular-nums">{r.funders}</td></tr>)}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Where the money stands: committed vs. received, the pipeline, and what's due next." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-white" />}>
        <Dashboard />
      </Suspense>
    </>
  );
}
