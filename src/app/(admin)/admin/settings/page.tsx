"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [slotsTotal, setSlotsTotal] = useState<number | null>(null);
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
    setSlotsTotal(typeof j.slotsTotal === "number" ? j.slotsTotal : 10);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function saveEnabled(next: boolean) {
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

  async function saveSlotsTotal(next: number) {
    setBusy(true);
    setErr(null);

    const r = await fetch("/api/admin/settings/sponsors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slotsTotal: next }),
    });

    if (!r.ok) {
      setErr(await r.text());
      setBusy(false);
      return;
    }

    setSlotsTotal(next);
    setBusy(false);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
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
            <div className="text-sm font-medium">Sponsor rails</div>
            <div className="mt-1 text-xs text-neutral-500">When off, sponsor rails never render.</div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!enabled}
              disabled={busy || enabled === null}
              onChange={(e) => saveEnabled(e.target.checked)}
            />
            Enabled
          </label>
        </div>

        <div className="mt-3 text-xs text-neutral-500">Current: {enabled === null ? "…" : enabled ? "Enabled" : "Disabled"}</div>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Sponsor slots (total)</div>
            <div className="mt-1 text-xs text-neutral-500">Controls how many sponsor modules can be active at once.</div>
          </div>
          <input
            type="number"
            min={0}
            max={50}
            step={1}
            value={slotsTotal ?? ""}
            disabled={busy || slotsTotal === null}
            onChange={(e) => {
              const n = Math.floor(Number(e.target.value));
              if (!Number.isFinite(n)) return;
              setSlotsTotal(n);
            }}
            onBlur={() => {
              if (slotsTotal === null) return;
              const clamped = Math.max(0, Math.min(50, Math.floor(slotsTotal)));
              if (clamped !== slotsTotal) setSlotsTotal(clamped);
              saveSlotsTotal(clamped);
            }}
            className="w-24 rounded bg-neutral-900 px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-3 text-xs text-neutral-500">Current: {slotsTotal === null ? "…" : slotsTotal}</div>
      </div>
    </main>
  );
}
