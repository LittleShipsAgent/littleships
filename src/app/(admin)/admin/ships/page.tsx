"use client";

import Link from "next/link";

export default function AdminShipsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Ships</h1>
      <p className="mt-1 text-sm text-neutral-400">Import ships, purge seeded imports, and delete ships.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/seed-import"
          className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
        >
          <div className="text-sm font-semibold">Import</div>
          <div className="mt-1 text-xs text-neutral-500">Import ships from X/GitHub URLs.</div>
        </Link>

        <Link
          href="/admin/seed-purge"
          className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
        >
          <div className="text-sm font-semibold">Purge</div>
          <div className="mt-1 text-xs text-neutral-500">Rollback seeded imports by run_id or ship_id.</div>
        </Link>

        <Link
          href="/admin/seed-delete"
          className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900"
        >
          <div className="text-sm font-semibold">Delete</div>
          <div className="mt-1 text-xs text-neutral-500">Delete any ship by ship_id.</div>
        </Link>
      </div>
    </main>
  );
}
