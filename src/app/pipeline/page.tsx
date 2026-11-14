import { Suspense } from "react";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { pipelineCards } from "@/lib/pipeline-queries";

async function Board() {
  const cards = await pipelineCards();
  return <PipelineBoard initialCards={cards} />;
}

export default function PipelinePage() {
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-6">
        <h1 className="text-title font-semibold text-plum">Funding pipeline</h1>
        <p className="mt-1 text-body text-muted">Approved matches land here as prospects. Drag a card, or use its stage menu, to move it.</p>
      </header>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[16px] bg-card" />}>
        <Board />
      </Suspense>
    </div>
  );
}
