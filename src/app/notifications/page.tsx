import { formatDistanceToNow } from "date-fns";
import { desc } from "drizzle-orm";
import { connection } from "next/server";
import { Suspense } from "react";
import { db, schema } from "@/db";
import { MarkAllRead } from "@/components/notifications/mark-all-read";
import { PageHeader } from "@/components/ui";

const LIMIT = 100;
const KIND_LABEL = { new_match: "New match", open_call: "Open call", deadline: "Deadline" } as const;
const KIND_STYLE = {
  new_match: "bg-brand-soft text-brand",
  open_call: "bg-teal-soft text-teal",
  deadline: "bg-rose-soft text-plum",
} as const;

async function List() {
  await connection();
  const rows = await db.select().from(schema.notifications).orderBy(desc(schema.notifications.createdAt)).limit(LIMIT);
  const unread = rows.filter((r) => !r.readAt).length;

  if (rows.length === 0) {
    return <p className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">No notifications yet. They appear after each refresh.</p>;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{unread} unread</span>
        {unread > 0 && <MarkAllRead />}
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
        {rows.map((n) => (
          <li key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.readAt ? "" : "bg-brand-soft/40"}`}>
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-rose"}`} aria-label={n.readAt ? "Read" : "Unread"} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${KIND_STYLE[n.kind]}`}>{KIND_LABEL[n.kind]}</span>
                <span className="text-xs text-muted">{formatDistanceToNow(n.createdAt, { addSuffix: true })}</span>
              </div>
              <p className={`mt-1 text-sm ${n.readAt ? "text-ink" : "font-semibold text-ink"}`}>{n.title}</p>
              {n.body && <p className="text-sm text-muted">{n.body}</p>}
            </div>
            {n.link && (
              <a href={n.link} className="shrink-0 text-xs font-semibold text-brand hover:underline" {...(n.link.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                Open
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" subtitle="New matches, open calls and deadline reminders — the same items as the email summary." />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white" />}>
        <List />
      </Suspense>
    </>
  );
}
