"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminShipsPage() {
  const [shipId, setShipId] = useState("");
  const [out, setOut] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function deleteSeededShip(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setOut("");

    const r = await fetch("/api/admin/seed/purge-ship", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ship_id: shipId.trim() }),
    });

    setOut(await r.text());
    setBusy(false);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Ships</h1>
      <p className="mt-1 text-sm text-neutral-400">Import ships and manage seeded cleanup.</p>

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
      </div>

      <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Delete (seeded) ship</div>
            <div className="mt-1 text-xs text-neutral-500">Deletes a single seeded ship by ship_id (SHP-…).</div>
          </div>
        </div>

        <form onSubmit={deleteSeededShip} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            className="w-full flex-1 rounded bg-neutral-900 px-3 py-2 text-sm"
            value={shipId}
            onChange={(e) => setShipId(e.target.value)}
            placeholder="SHP-..."
            required
          />
          <button
            className="rounded bg-red-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={busy}
            type="submit"
          >
            Delete
          </button>
        </form>

        {out ? (
          <pre className="mt-4 rounded bg-neutral-950 border border-neutral-800 p-3 text-xs overflow-auto">{out}</pre>
        ) : null}
      </div>
    </main>
  );
}
