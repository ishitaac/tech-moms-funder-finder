"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { addPayment, updateAmounts } from "@/app/actions";
import { GripIcon } from "@/components/icons";
import { STAGE_LABELS, STAGES, type PipelineCard, type Stage } from "@/lib/pipeline-model";
import { typeLabel, usd } from "@/components/ui";

interface Props {
  card: PipelineCard;
  onStageChange: (id: number, stage: Stage) => void;
  onChange: (c: PipelineCard) => void;
}

/** Stops drag listeners from hijacking clicks/typing inside the card's controls. */
const stop = { onPointerDown: (e: React.PointerEvent) => e.stopPropagation(), onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation() };

const TYPE_PILL: Record<string, string> = {
  corporate: "bg-teal-tint border-teal-logo/40",
  foundation: "bg-plum-tint border-plum/20",
  family_foundation: "bg-rose-tint border-rose/40",
  state: "bg-teal-tint border-teal-logo/40",
  federal: "bg-plum-tint border-plum/20",
};

const POPOVER_WIDTH = 288;
const money = (n: number | null) => (n ? usd(n) : "-");

export function PipelineCardView({ card, onStageChange, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [asked, setAsked] = useState(card.amountAsked?.toString() ?? "");
  const [awarded, setAwarded] = useState(card.amountAwarded?.toString() ?? "");
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const popId = useId();

  const closePopover = () => {
    setEditing(false);
    btnRef.current?.focus();
  };

  const togglePopover = () => {
    if (editing) return closePopover();
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 8, left: Math.min(Math.max(8, r.right - POPOVER_WIDTH), window.innerWidth - POPOVER_WIDTH - 8) });
    setEditing(true);
  };

  // While open: focus the first field; close on Escape, outside click, or resize.
  useEffect(() => {
    if (!editing) return;
    popRef.current?.querySelector("input")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditing(false);
        btnRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !btnRef.current?.contains(t)) setEditing(false);
    };
    const onResize = () => setEditing(false);
    // Capture phase: the popover and card controls stop propagation (to protect drag), which would otherwise hide these events.
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("resize", onResize);
    };
  }, [editing]);

  const save = () =>
    start(async () => {
      const r = await updateAmounts({ id: card.id, amountAsked: asked, amountAwarded: awarded });
      if (!r.ok) return setError(r.error);
      setError(null);
      closePopover();
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

  const input = "mt-1 w-full rounded-full border border-line bg-card px-3 py-2 text-body text-plum";
  // Very large amounts ($100,000+) drop one size so three columns still fit a narrow card.
  const longFigures = [card.amountAsked, card.amountAwarded, card.received].some((n) => money(n).length > 7);
  const isAwarded = card.stage === "awarded";
  const isDeclined = card.stage === "declined";

  return (
    <article
      className={`group cursor-grab rounded-[12px] border p-3 shadow-card transition duration-150 hover:-translate-y-0.5 hover:shadow-card-hover active:cursor-grabbing ${
        isDeclined ? "border-line bg-[#faf7f9]" : "border-line bg-card"
      } ${isAwarded ? "border-l-4 border-l-teal-logo" : ""}`}
    >
      <div className="flex items-start gap-1.5">
        <GripIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted/70 group-hover:text-plum" />
        <div className="min-w-0 flex-1">
          <p className={`text-cardname font-semibold ${isDeclined ? "text-muted" : "text-plum"}`} title={card.funderName}>
            {card.funderName}
          </p>
          {card.opportunityTitle && <p className="line-clamp-1 text-meta text-muted">{card.opportunityTitle}</p>}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-meta font-medium text-plum ${TYPE_PILL[card.funderType] ?? "bg-plum-tint border-plum/20"}`}>
          {typeLabel(card.funderType)}
        </span>
        {card.isSample && (
          <span className="inline-flex rounded-full border border-line bg-card px-2 py-0.5 text-meta font-medium text-muted">SAMPLE</span>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-1 border-t border-line pt-3">
        {(
          [
            ["Asked", card.amountAsked],
            ["Awarded", card.amountAwarded],
            ["Received", card.received],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-meta text-muted">{label}</dt>
            <dd className={`font-semibold tabular-nums text-plum ${longFigures ? "text-[13px]" : "text-body"}`}>{money(value)}</dd>
          </div>
        ))}
      </dl>
      {card.deadline && <p className="mt-2 inline-flex rounded-full bg-rose-tint px-2.5 py-0.5 text-meta font-medium text-plum">Due {card.deadline}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2" {...stop}>
        <label className="sr-only" htmlFor={`stage-${card.id}`}>
          Stage for {card.funderName}
        </label>
        <select
          id={`stage-${card.id}`}
          value={card.stage}
          onChange={(e) => onStageChange(card.id, e.target.value as Stage)}
          className="shrink-0 rounded-full border border-line bg-card py-1.5 pl-3 pr-2 text-meta font-medium text-plum"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          ref={btnRef}
          type="button"
          onClick={togglePopover}
          aria-expanded={editing}
          aria-controls={editing ? popId : undefined}
          aria-haspopup="dialog"
          className="ml-auto shrink-0 rounded-full border border-plum/30 bg-card px-3 py-1.5 text-meta font-semibold text-plum hover:bg-plum-tint"
        >
          Edit amounts
        </button>
      </div>

      {editing &&
        createPortal(
          <div
            ref={popRef}
            id={popId}
            role="dialog"
            aria-label={`Edit amounts for ${card.funderName}`}
            style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
            className="fixed z-50 space-y-3 rounded-[16px] border border-line bg-card p-4 shadow-[0_8px_32px_rgb(75_27_60/0.18)]"
            {...stop}
          >
            <p className="text-body font-semibold text-plum">{card.funderName}</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-meta text-muted">
                Asked
                <input inputMode="decimal" value={asked} onChange={(e) => setAsked(e.target.value)} className={input} />
              </label>
              <label className="text-meta text-muted">
                Awarded
                <input inputMode="decimal" value={awarded} onChange={(e) => setAwarded(e.target.value)} className={input} />
              </label>
            </div>
            <button type="button" disabled={pending} onClick={save} className="w-full rounded-full bg-plum px-3 py-2 text-body font-semibold text-white hover:bg-plum/90 disabled:opacity-60">
              Save amounts
            </button>
            {isAwarded && (
              <div className="space-y-2 border-t border-line pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-meta text-muted">
                    Payment
                    <input inputMode="decimal" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className={input} />
                  </label>
                  <label className="text-meta text-muted">
                    Received on
                    <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className={input} />
                  </label>
                </div>
                <button
                  type="button"
                  disabled={pending || !payAmount}
                  onClick={recordPayment}
                  className="w-full rounded-full border border-plum/30 bg-card px-3 py-2 text-body font-semibold text-plum hover:bg-plum-tint disabled:opacity-60"
                >
                  Add payment
                </button>
              </div>
            )}
            {error && (
              <p className="text-meta font-medium text-plum" role="alert">
                {error}
              </p>
            )}
          </div>,
          document.body,
        )}
    </article>
  );
}
