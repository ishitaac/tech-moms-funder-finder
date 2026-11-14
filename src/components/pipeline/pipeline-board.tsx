"use client";

import { DndContext, PointerSensor, KeyboardSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useState, useTransition } from "react";
import { moveStage } from "@/app/actions";
import { STAGE_LABELS, STAGES, stageTotal, type PipelineCard, type Stage } from "@/lib/pipeline-model";
import { usd } from "@/components/ui";
import { PipelineCardView } from "./pipeline-card";

const COLUMN_STYLE: Record<Stage, { bg: string; dot: string }> = {
  prospect: { bg: "bg-plum-tint", dot: "bg-plum" },
  loi: { bg: "bg-teal-tint", dot: "bg-teal-logo" },
  submitted: { bg: "bg-rose-tint", dot: "bg-rose" },
  awarded: { bg: "bg-teal-tint", dot: "bg-teal" },
  declined: { bg: "bg-plum-tint", dot: "bg-muted" },
};

export function PipelineBoard({ initialCards }: { initialCards: PipelineCard[] }) {
  const [cards, setCards] = useState(initialCards);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

  const changeStage = (id: number, stage: Stage) => {
    const before = cards;
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, stage } : c)));
    setError(null);
    startTransition(async () => {
      const r = await moveStage({ id, stage });
      if (!r.ok) {
        setCards(before);
        setError(r.error);
      }
    });
  };

  const onDragEnd = (e: DragEndEvent) => {
    const stage = e.over?.id as Stage | undefined;
    const id = Number(e.active.id);
    const card = cards.find((c) => c.id === id);
    if (stage && card && card.stage !== stage) changeStage(id, stage);
  };

  const hasSample = cards.some((c) => c.isSample);

  return (
    <div className="space-y-4">
      {error && <p className="rounded-full bg-rose-tint px-4 py-2 text-sm text-plum" role="alert">{error}</p>}
      {hasSample && (
        <p className="text-xs text-muted">
          Cards marked <span className="rounded-full bg-rose-tint px-2 py-0.5 font-medium text-plum">SAMPLE</span> are demo data (Tech-Moms has no CRM yet). Clear them in Settings.
        </p>
      )}
      {/* Stable id keeps dnd-kit's aria ids identical on server and client (avoids hydration mismatch). */}
      <DndContext id="pipeline-board" sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {STAGES.map((stage) => (
            <Column key={stage} stage={stage} cards={cards.filter((c) => c.stage === stage)} total={stageTotal(cards, stage)} onStageChange={changeStage} onCardChange={(c) => setCards((cs) => cs.map((x) => (x.id === c.id ? c : x)))} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function Column({
  stage,
  cards,
  total,
  onStageChange,
  onCardChange,
}: {
  stage: Stage;
  cards: PipelineCard[];
  total: number;
  onStageChange: (id: number, stage: Stage) => void;
  onCardChange: (c: PipelineCard) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const st = COLUMN_STYLE[stage];
  return (
    <section ref={setNodeRef} aria-label={`${STAGE_LABELS[stage]} column`} className={`flex min-h-64 flex-col rounded-[16px] border border-line p-3 ${st.bg} ${isOver ? "ring-2 ring-plum" : ""}`}>
      <header className="px-1 pb-3 pt-1">
        <h2 className="flex items-center gap-2 text-base font-medium text-plum">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${st.dot}`} aria-hidden="true" />
          {STAGE_LABELS[stage]}
          <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-plum" aria-label={`${cards.length} cards`}>{cards.length}</span>
        </h2>
        <p className="mt-1 text-lg font-medium tabular-nums text-plum" title={stage === "awarded" ? "Committed (awarded)" : "Amount asked"}>
          {usd(total)}
          <span className="ml-1 text-xs font-normal text-muted">{stage === "awarded" ? "committed" : "asked"}</span>
        </p>
      </header>
      <div className="flex-1 space-y-3">
        {cards.map((c) => (
          <Draggable key={c.id} id={c.id}>
            <PipelineCardView card={c} onStageChange={onStageChange} onChange={onCardChange} />
          </Draggable>
        ))}
        {cards.length === 0 && <p className="rounded-[12px] border border-dashed border-plum/20 px-1 py-8 text-center text-xs text-muted">Drop cards here</p>}
      </div>
    </section>
  );
}

function Draggable({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: String(id) });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "relative z-20 opacity-80 shadow-lg" : ""} {...listeners} {...attributes}>
      {children}
    </div>
  );
}
