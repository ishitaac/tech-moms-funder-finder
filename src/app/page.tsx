import { Suspense } from "react";
import { FunderList } from "@/components/funders/funder-list";
import { PageHeader } from "@/components/ui";

export default function FundersPage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <PageHeader
        title="Ranked funders"
        subtitle="Grants and sponsorships most likely to fund Tech-Moms, ranked by fit score with the reason and source for each."
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-white" />}>
        <FunderList searchParams={searchParams} />
      </Suspense>
    </>
  );
}
