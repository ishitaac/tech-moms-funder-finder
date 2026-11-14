"use client";

import { useState, useTransition } from "react";
import { addPayment, updateAmounts } from "@/app/actions";
import { STAGE_LABELS, STAGES, type PipelineCard, type Stage } from "@/lib/pipeline-model";
import { typeLabel, usd } from "@/components/ui";

interface Props {
  card: PipelineCard;
  onStageChange: (id: number, stage: Stage) => void;
  onChange: (c: PipelineCard) => void;
}

/** Stops drag listeners from hijacking clicks/typing inside the card's controls. */
const stop = { onPointerDown: (e: React.PointerEvent) => e.stopPropagation(), onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation() };

export function PipelineCardView({ card, onStageChange, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [asked, setAsked] = useState(card.amountAsked?.toString() ?? "");
  const [awarded, setAwarded] = useState(card.amountAwarded?.toString() ?? "");
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      const r = await updateAmounts({ id: card.id, amountAsked: asked, amountAwarded: awarded });
      if (!r.ok) return setError(r.error);
      setError(null);
      setEditing(false);
      onChange({ ...card, amountAsked: asked ? Number(asked) : null, amountAwarded: awarded ? Number(awarded) : null });
    });

  const recordPayment = () =>
    start(async () => {
      const amount = Number(payAmount);
      const r = await addPayment({ pipelineItemId: card.id, amount, receivedOn: payDate });
      if (!r.ok) return setError(r.error);
      setError(null);
      setPayAmount("");
      onChange({ ...card, received: card.received + amount });
    });

  const input = "w-full rounded-lg border border-line bg-card px-2 py-1.5 text-sm text-plum";

  return (
    <article className="cursor-grab rounded-[14px] border border-line bg-card p-4 text-sm shadow-card active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-plum" title={card.funderName}>{card.funderName}</p>
          {card.opportunityTitle && <p className="line-clamp-1 text-xs text-muted">{card.opportunityTitle}</p>}
          <p className="text-xs text-muted">{typeLabel(card.funderType)}</p>
        </div>
        {card.isSample && <span className="shrink-0 rounded-full bg-rose-tint px-2 py-0.5 text-[10px] font-medium text-plum">SAMPLE</span>}
      </div>

      <dl className="mt-2 grid grid-cols-3 gap-1 text-xs">
        <div><dt className="text-muted">Asked</dt><dd className="tabular-nums">{usd(card.amountAsked)}</dd></div>
        <div><dt className="text-muted">Awarded</dt><dd className="tabular-nums">{usd(card.amountAwarded)}</dd></div>
        <div><dt className="text-muted">Received</dt><dd className="tabular-nums">{usd(card.received)}</dd></div>
      </dl>
      {card.deadline && <p className="mt-2 inline-flex rounded-full bg-rose-tint px-2.5 py-0.5 text-xs font-medium text-plum">Due {card.deadline}</p>}

      <div className="mt-2 flex items-center gap-2" {...stop}>
        <label className="sr-only" htmlFor={`stage-${card.id}`}>Stage</label>
        <select id={`stage-${card.id}`} value={card.stage} onChange={(e) => onStageChange(card.id, e.target.value as Stage)} className="rounded-full border border-line bg-card px-2.5 py-1 text-xs text-plum">
          {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
        <button onClick={() => setEditing((v) => !v)} className="text-xs font-medium text-plum underline underline-offset-2">
          {editing ? "Close" : "Edit $"}
        </button>
      </div>

      {editing && (
        <div className="mt-2 space-y-2 border-t border-line pt-2" {...stop}>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted">Asked<input inputMode="decimal" value={asked} onChange={(e) => setAsked(e.target.value)} className={input} /></label>
            <label className="text-xs text-muted">Awarded<input inputMode="decimal" value={awarded} onChange={(e) => setAwarded(e.target.value)} className={input} /></label>
          </div>
          <button disabled={pending} onClick={save} className="w-full rounded-full bg-plum px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">Save amounts</button>
          {card.stage === "awarded" && (
            <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <label className="text-xs text-muted">Payment<input inputMode="decimal" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className={input} /></label>
              <label className="text-xs text-muted">Received on<input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className={input} /></label>
              <button disabled={pending || !payAmount} onClick={recordPayment} className="rounded-full bg-plum px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">Add</button>
            </div>
          )}
          {error && <p className="text-xs font-medium text-plum" role="alert">{error}</p>}
        </div>
      )}
    </article>
  );
}
