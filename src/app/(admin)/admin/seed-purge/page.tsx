"use client";

import { useState } from "react";
import Link from "next/link";

export default function SeedPurgePage() {
  const [runId, setRunId] = useState("");
  const [shipId, setShipId] = useState("");
  const [out, setOut] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function purgeRun(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setOut("");

    const r = await fetch("/api/admin/seed/purge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ run_id: runId.trim() }),
    });

    setOut(await r.text());
    setBusy(false);
  }

  async function purgeShip(e: React.FormEvent) {
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
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Purge</h1>
          <p className="mt-1 text-sm text-neutral-400">Delete seeded ships by import run or by ship id.</p>
        </div>
        <Link href="/admin/ships" className="rounded bg-neutral-900 px-3 py-2 text-sm">
          Back
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6">
        <form onSubmit={purgeShip} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="text-sm font-semibold">Purge by ship_id</div>
          <div>
            <label className="text-sm text-neutral-300">ship_id</label>
            <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={shipId} onChange={(e) => setShipId(e.target.value)} placeholder="SHP-..." required />
            <div className="mt-1 text-xs text-neutral-500">Only deletes seeded ships (refuses verified/non-seeded).</div>
          </div>
          <button className="rounded bg-red-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={busy} type="submit">
            Purge ship
          </button>
        </form>

        <form onSubmit={purgeRun} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="text-sm font-semibold">Purge by import run_id</div>
          <div>
            <label className="text-sm text-neutral-300">run_id</label>
            <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={runId} onChange={(e) => setRunId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
            <div className="mt-1 text-xs text-neutral-500">Deletes all ships with seeded_import_run_id = run_id.</div>
          </div>
          <button className="rounded bg-red-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={busy} type="submit">
            Purge run
          </button>
        </form>
      </div>

      {out ? (
        <div className="mt-6">
          <div className="text-sm font-semibold">Response</div>
          <pre className="mt-2 rounded bg-neutral-950 border border-neutral-800 p-3 text-xs overflow-auto">{out}</pre>
        </div>
      ) : null}
    </main>
  );
}
