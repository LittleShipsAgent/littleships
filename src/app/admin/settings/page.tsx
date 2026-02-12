"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [sponsorsEnabled, setSponsorsEnabled] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(null);
    const r = await fetch("/api/admin/settings");
    if (!r.ok) {
      setErr(await r.text());
      return;
    }
    const j = await r.json();
    setSponsorsEnabled(!!j.sponsors?.enabled);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(next: boolean) {
    setBusy(true);
    setErr(null);
    setSponsorsEnabled(next);

    const r = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sponsors: { enabled: next } }),
    });

    if (!r.ok) setErr(await r.text());
    await load();
    setBusy(false);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Settings</h1>
          <p className="mt-1 text-sm text-neutral-400">Feature toggles and site-wide switches.</p>
        </div>
        <Link href="/admin/articles" className="rounded bg-neutral-900 px-3 py-2 text-sm">
          Back
        </Link>
      </div>

      {err && <div className="mt-6 rounded border border-red-900 bg-red-950 p-3 text-sm">{err}</div>}

      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Sponsors</div>
            <div className="mt-1 text-xs text-neutral-500">Controls whether sponsorship modules render on main pages.</div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sponsorsEnabled} disabled={busy} onChange={(e) => save(e.target.checked)} />
            Enabled
          </label>
        </div>
      </div>
    </main>
  );
}
