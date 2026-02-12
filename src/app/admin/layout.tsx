import type { ReactNode } from "react";
import Link from "next/link";

import "./admin.css";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-900 bg-neutral-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/articles" className="text-sm font-semibold">
              Admin
            </Link>
            <nav className="hidden gap-2 sm:flex">
              <Link className="rounded px-2 py-1 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100" href="/admin/articles">
                Articles
              </Link>
              <Link className="rounded px-2 py-1 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100" href="/admin/articles/categories">
                Categories
              </Link>
              <Link className="rounded px-2 py-1 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100" href="/admin/articles/authors">
                Authors
              </Link>
              <Link className="rounded px-2 py-1 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100" href="/admin/settings">
                Settings
              </Link>
            </nav>
          </div>
          <div className="text-xs text-neutral-500">LittleShips</div>
        </div>
      </header>
      {children}
    </div>
  );
}
