"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Funders" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" },
];

export function NavLinks({ unread }: { unread: number }) {
  const path = usePathname();
  return (
    <nav className="flex flex-1 items-center gap-1 overflow-x-auto text-sm">
      {LINKS.map((l) => {
        const active = l.href === "/" ? path === "/" || path === "/excluded" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`relative whitespace-nowrap rounded-md px-3 py-2 font-medium transition-colors ${
              active ? "bg-brand-soft text-brand" : "text-muted hover:bg-canvas hover:text-ink"
            }`}
          >
            {l.label}
            {l.href === "/notifications" && unread > 0 && (
              <span className="ml-1.5 rounded-full bg-rose px-1.5 py-0.5 text-[11px] font-semibold text-white">{unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
