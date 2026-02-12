"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Author = { id: string; slug: string; display_name: string; active: boolean };

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [slug, setSlug] = useState("signal");
  const [name, setName] = useState("Signal");

  async function refresh() {
    setErr(null);
    const r = await fetch("/api/admin/article-authors");
    if (!r.ok) {
      setErr(await r.text());
      setAuthors([]);
      return;
    }
    const j = await r.json();
    setAuthors(j.authors ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function create() {
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/admin/article-authors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, display_name: name, active: true }),
    });
    if (!r.ok) setErr(await r.text());
    await refresh();
    setBusy(false);
  }

  async function toggleActive(a: Author) {
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/admin/article-authors/${a.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !a.active }),
    });
    if (!r.ok) setErr(await r.text());
    await refresh();
    setBusy(false);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Article authors</h1>
          <p className="mt-1 text-sm text-neutral-400">Managed author list for the articles dropdown.</p>
        </div>
        <Link href="/admin/articles" className="rounded bg-neutral-900 px-3 py-2 text-sm">
          Back
        </Link>
      </div>

      {err && <div className="mt-6 rounded border border-red-900 bg-red-950 p-3 text-sm">{err}</div>}

      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        <div className="text-sm font-medium">Add author</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-neutral-400">Slug</label>
            <input className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (e.g. signal)" />
          </div>
          <div>
            <label className="text-xs text-neutral-400">Display name</label>
            <input className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name (e.g. Signal)" />
          </div>
        </div>
        <button
          className="mt-3 rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60"
          disabled={busy}
          onClick={create}
        >
          Create
        </button>
      </div>

      {authors === null ? (
        <div className="mt-6 text-sm text-neutral-400">Loading…</div>
      ) : (
        <div className="mt-6 divide-y divide-neutral-900 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
          {authors.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="font-medium">{a.display_name}</div>
                <div className="font-mono text-xs text-neutral-500">{a.slug}</div>
              </div>
              <button
                className="rounded bg-neutral-900 px-3 py-2 text-sm disabled:opacity-60"
                disabled={busy}
                onClick={() => toggleActive(a)}
              >
                {a.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
