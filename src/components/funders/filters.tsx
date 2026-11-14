"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { BANDS_LIST, TYPES, type Filters as F } from "@/lib/list-filters";
import { typeLabel } from "@/components/ui";

const SEARCH_DEBOUNCE_MS = 300;

export function Filters({ filters, excludedCount }: { filters: F; excludedCount: number }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q);

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("funder");
    startTransition(() => router.replace(`${path}?${next.toString()}`, { scroll: false }));
  };

  useEffect(() => {
    if (q === filters.q) return;
    const t = setTimeout(() => set("q", q || null), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const select = "rounded-md border border-line bg-white px-2.5 py-1.5 text-sm text-ink";
  const tab = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${active ? "bg-brand text-white" : "text-muted hover:bg-white hover:text-ink"}`;

  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-xl border border-line bg-canvas p-2 ${pending ? "opacity-70" : ""}`}>
      <div className="flex gap-1" role="tablist" aria-label="List view">
        <button role="tab" aria-selected={filters.view === "shortlist"} className={tab(filters.view === "shortlist")} onClick={() => set("view", null)}>
          Top matches
        </button>
        <button role="tab" aria-selected={filters.view === "all"} className={tab(filters.view === "all")} onClick={() => set("view", "all")}>
          All scored
        </button>
        <button role="tab" aria-selected={filters.view === "excluded"} className={tab(filters.view === "excluded")} onClick={() => set("view", "excluded")}>
          Excluded ({excludedCount.toLocaleString()})
        </button>
      </div>
      <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
      <select aria-label="Funder type" className={select} value={filters.type ?? ""} onChange={(e) => set("type", e.target.value || null)}>
        <option value="">All types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {typeLabel(t)}
          </option>
        ))}
      </select>
      <select aria-label="Band" className={select} value={filters.band ?? ""} onChange={(e) => set("band", e.target.value || null)}>
        <option value="">All bands</option>
        {BANDS_LIST.map((b) => (
          <option key={b}>{b}</option>
        ))}
      </select>
      <label className="flex items-center gap-1.5 px-1 text-sm text-ink">
        <input type="checkbox" checked={filters.openOnly} onChange={(e) => set("open", e.target.checked ? "1" : null)} className="accent-teal" />
        Open calls only
      </label>
      <input
        type="search"
        placeholder="Search funders…"
        aria-label="Search funders"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="ml-auto min-w-48 flex-1 rounded-md border border-line bg-white px-3 py-1.5 text-sm sm:flex-none"
      />
    </div>
  );
}
