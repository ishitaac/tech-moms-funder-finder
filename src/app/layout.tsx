import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Funder Finder · Tech-Moms",
  description: "Ranked, explained grant and sponsorship matches for Tech-Moms, from free public data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Suspense fallback={<div className="h-16 border-b border-line bg-white" />}>
          <AppNav />
        </Suspense>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
        <footer className="border-t border-line bg-white px-6 py-3 text-center text-xs text-muted">
          Public data only · No personal data · AI finds, extracts and explains — you decide.
        </footer>
      </body>
    </html>
  );
}
