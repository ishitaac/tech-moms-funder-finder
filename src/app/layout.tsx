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
      <body className="min-h-full font-sans lg:flex">
        <Suspense fallback={<div className="h-14 border-b border-line bg-card lg:h-screen lg:w-64 lg:border-r" />}>
          <AppNav />
        </Suspense>
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-10">{children}</main>
          <footer className="px-6 py-6 text-center text-xs text-muted">
            Public data only · No personal data · AI finds, extracts and explains — you decide.
          </footer>
        </div>
      </body>
    </html>
  );
}
