"use client";

import { useEffect, useState } from "react";

const KEY = "ff-trust-banner-dismissed";

/** First-screen privacy and AI statement (PRD non-functional: Privacy). */
export function TrustBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  if (hidden) return null;
  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // private mode: banner just reappears next visit
    }
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
