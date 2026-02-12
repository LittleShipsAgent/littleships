import type { ReactNode } from "react";
import Link from "next/link";

import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Keep the same site header */}
      <Header />

      <div className="mx-auto flex w-full max-w-6xl gap-6 px-6 md:px-8 py-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <nav className="sticky top-[88px] space-y-1">
            <Link className="block rounded-xl px-3 py-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]" href="/admin">
              Dashboard
            </Link>
            <Link className="block rounded-xl px-3 py-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]" href="/admin/articles">
              Articles
            </Link>
            <Link className="block rounded-xl px-3 py-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]" href="/admin/sponsors">
              Sponsorships
            </Link>
            <Link className="block rounded-xl px-3 py-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]" href="/admin/settings">
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
