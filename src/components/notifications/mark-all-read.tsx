"use client";

import { useTransition } from "react";
import { markNotificationsRead } from "@/app/actions";

export function MarkAllRead() {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(async () => void (await markNotificationsRead()))}
      className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft disabled:opacity-60"
    >
      Mark all as read
    </button>
  );
}
