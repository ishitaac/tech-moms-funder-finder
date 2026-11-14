import Image from "next/image";
import Link from "next/link";
import { unreadNotificationCount } from "@/lib/queries";
import { NavLinks } from "./nav-links";

export async function AppNav() {
  const unread = await unreadNotificationCount();
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image src="/tech-moms-logo.png" alt="Tech-Moms" width={96} height={56} priority />
          <span className="hidden font-display text-lg font-medium text-brand sm:inline">Funder Finder</span>
        </Link>
        <NavLinks unread={unread} />
      </div>
    </header>
  );
}
