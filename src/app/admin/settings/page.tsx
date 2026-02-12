"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setErr(null);
    const r = await fetch("/api/settings/sponsors");
    if (!r.ok) {
      setErr(await r.text());
      setEnabled(false);
      return;
    }
    const j = await r.json();
    setEnabled(!!j.enabled);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function save(next: boolean) {
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/admin/settings/sponsors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    if (!r.ok) {
      setErr(await r.text());
      setBusy(false);
      return;
    }
    setEnabled(next);
    setBusy(false);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Settings</h1>
          <p className="mt-1 text-sm text-neutral-400">Feature flags for production.</p>
        </div>
        <Link href="/admin/articles" className="rounded bg-neutral-900 px-3 py-2 text-sm">
          Back
        </Link>
      </div>

      {err && <div className="mt-6 rounded border border-red-900 bg-red-950 p-3 text-sm">{err}</div>}

      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Sponsors rails</div>
            <div className="mt-1 text-sm text-neutral-400">When off, sponsor rails never render (no flicker).</div>
          </div>
          <button
            className="rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60"
            disabled={busy || enabled === null}
            onClick={() => save(!enabled)}
          >
            {enabled ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      <div className="mt-6 text-sm text-neutral-500">
        Current: {enabled === null ? "…" : enabled ? "Enabled" : "Disabled"}
      </div>
    </main>
  );
}
