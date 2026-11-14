"use client";

import { useTransition } from "react";
import { decide } from "@/app/actions";
import { BTN } from "@/components/ui";

export type DecisionAction = "approve" | "snooze" | "reject";

const DONE: Record<DecisionAction, string> = {
  approve: "Added to your pipeline as a Prospect.",
  snooze: "Snoozed — it will come back later.",
  reject: "Rejected — hidden from future lists unless something changes.",
};

/** Approve / Snooze / Reject. Same three actions in the list rows and the drawer. */
export function ActionButtons({
  funderId,
  opportunityId,
  funderName,
  onResult,
  className = "",
}: {
  funderId: number;
  opportunityId: number | null;
  funderName: string;
  onResult: (message: string) => void;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  const act = (action: DecisionAction) =>
    startTransition(async () => {
      const r = await decide({ funderId, opportunityId, action });
      onResult(r.ok ? `${funderName}: ${DONE[action]}` : r.error);
    });

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button type="button" disabled={pending} onClick={() => act("approve")} className={BTN.primary} aria-label={`Approve ${funderName}`}>
        Approve
      </button>
      <button type="button" disabled={pending} onClick={() => act("snooze")} className={BTN.secondary} aria-label={`Snooze ${funderName}`}>
        Snooze
      </button>
      <button type="button" disabled={pending} onClick={() => act("reject")} className={BTN.soft} aria-label={`Reject ${funderName}`}>
        Reject
      </button>
    </div>
  );
}
