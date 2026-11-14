import { Suspense } from "react";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { PageHeader } from "@/components/ui";
import { pipelineCards } from "@/lib/pipeline-queries";

async function Board() {
  const cards = await pipelineCards();
  return <PipelineBoard initialCards={cards} />;
}

export default function PipelinePage() {
  return (
    <>
      <PageHeader
        title="Funding pipeline"
        subtitle="Approved matches land here as prospects. Drag a card (or use its stage menu) to move it. Committed = awarded; received = payments recorded."
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[16px] bg-card" />}>
        <Board />
      </Suspense>
    </>
  );
}
