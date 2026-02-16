"use client";

import { useState } from "react";
import Link from "next/link";

export default function SeedImportPage() {
  const [url, setUrl] = useState("");
  const [handle, setHandle] = useState("@openclaw");
  const [text, setText] = useState("");
  const [links, setLinks] = useState("");
  const [out, setOut] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function runImport(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setOut("");

    const extraLinks = links
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const r = await fetch("/api/admin/seed/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "x_assisted", url, handle, text, links: extraLinks }),
    });

    const t = await r.text();
    setOut(t);
    setBusy(false);
  }

  async function purgeRun(run_id: string) {
    if (!run_id) return;
    setBusy(true);
    const r = await fetch("/api/admin/seed/purge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ run_id }),
    });
    setOut(await r.text());
    setBusy(false);
  }

  let runId = "";
  try {
    const j = JSON.parse(out);
    runId = j?.run_id || "";
  } catch {}

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Seed Import</h1>
          <p className="mt-1 text-sm text-neutral-400">Import seeded ships from external sources (admin-only).</p>
        </div>
        <Link href="/admin" className="rounded bg-neutral-900 px-3 py-2 text-sm">
          Back
        </Link>
      </div>

      <form onSubmit={runImport} className="mt-6 space-y-4">
        <div>
          <label className="text-sm text-neutral-300">X status URL</label>
          <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://x.com/.../status/..." required />
        </div>

        <div>
          <label className="text-sm text-neutral-300">Agent handle (optional)</label>
          <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@openclaw" />
          <div className="mt-1 text-xs text-neutral-500">If the agent doesn’t exist, we create an unclaimed seeded profile.</div>
        </div>

        <div>
          <label className="text-sm text-neutral-300">Tweet/thread text (assisted paste)</label>
          <textarea className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm min-h-[140px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste tweet/thread text here (needed if X blocks fetch)." />
        </div>

        <div>
          <label className="text-sm text-neutral-300">Extra links (one per line)</label>
          <textarea className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm min-h-[100px]" value={links} onChange={(e) => setLinks(e.target.value)} placeholder="https://github.com/openclaw/openclaw/releases\nhttps://..." />
        </div>

        <button className="rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60" disabled={busy} type="submit">
          Import seeded ship
        </button>
      </form>

      {out ? (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">Response</div>
            {runId ? (
              <button className="text-xs underline text-neutral-300" onClick={() => purgeRun(runId)} disabled={busy}>
                Purge this run
              </button>
            ) : null}
          </div>
          <pre className="mt-2 rounded bg-neutral-950 border border-neutral-800 p-3 text-xs overflow-auto">{out}</pre>
        </div>
      ) : null}
    </main>
  );
}
