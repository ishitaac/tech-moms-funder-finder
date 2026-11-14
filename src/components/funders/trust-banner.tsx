"use client";

import { useSyncExternalStore } from "react";

const KEY = "ff-trust-banner-dismissed";
const EVENT = "ff-trust-banner";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** First-screen privacy and AI statement (PRD non-functional: Privacy). */
export function TrustBanner() {
  // Server snapshot = hidden, so SSR and first client render agree; it appears after hydration if not dismissed.
  const dismissed = useSyncExternalStore(subscribe, read, () => true);
  if (dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // private mode: banner reappears next visit
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-teal/30 bg-teal-soft px-4 py-3 text-sm">
      <div className="space-y-1">
        <p className="font-semibold text-ink">A research assistant you control</p>
        <p className="text-muted">
          <strong className="text-ink">Public data only</strong> (IRS 990 filings, Grants.gov, Utah state listings, funder websites) ·{" "}
          <strong className="text-ink">no personal data</strong> about donors, students or staff · AI reads, extracts and explains;{" "}
          <strong className="text-ink">you make every decision</strong>. Every score links to its source. The AI provider does not train on our data.
        </p>
      </div>
      <button onClick={dismiss} className="rounded-md px-2 py-1 text-xs font-semibold text-brand hover:bg-white">
        Got it
      </button>
    </div>
  );
}
