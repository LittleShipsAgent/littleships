"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Category = { id: string; slug: string; name: string; description: string | null };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function refresh() {
    setErr(null);
    const r = await fetch("/api/admin/article-categories");
    if (!r.ok) {
      setErr(await r.text());
      setCategories([]);
      return;
    }
    const j = await r.json();
    setCategories((j.categories ?? []) as Category[]);
  }

  useEffect(() => {
    refresh();
  }, []);

  const rows = useMemo(() => categories ?? [], [categories]);

  async function create() {
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/admin/article-categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, name, description: description || null }),
    });
    if (!r.ok) setErr(await r.text());
    setSlug("");
    setName("");
    setDescription("");
    await refresh();
    setBusy(false);
  }

  async function saveInline(id: string, patch: Partial<Category>) {
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/admin/article-categories/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!r.ok) setErr(await r.text());
    await refresh();
    setBusy(false);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Categories</h1>
          <p className="mt-1 text-sm text-neutral-400">Used for article filtering and navigation.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/articles" className="rounded bg-neutral-900 px-3 py-2 text-sm">
            Back
          </Link>
          <button className="rounded bg-neutral-900 px-3 py-2 text-sm" onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>

      {err && <div className="mt-6 rounded border border-red-900 bg-red-950 p-3 text-sm">{err}</div>}

      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        <div className="text-sm font-medium">Add category</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-neutral-400">Slug</label>
            <input className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="shipping" />
          </div>
          <div>
            <label className="text-xs text-neutral-400">Name</label>
            <input className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shipping" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-neutral-400">Description (optional)</label>
            <input className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short helper text" />
          </div>
        </div>
        <button className="mt-3 rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60" disabled={busy} onClick={create}>
          Create
        </button>
      </div>

      {categories === null ? (
        <div className="mt-6 text-sm text-neutral-400">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">No categories yet.</div>
      ) : (
        <div className="mt-6 divide-y divide-neutral-900 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
          {rows.map((c) => (
            <div key={c.id} className="px-4 py-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs text-neutral-500">Slug</label>
                  <input
                    className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-sm"
                    defaultValue={c.slug}
                    onBlur={(e) => e.target.value !== c.slug && saveInline(c.id, { slug: e.target.value })}
                    disabled={busy}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Name</label>
                  <input
                    className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-sm"
                    defaultValue={c.name}
                    onBlur={(e) => e.target.value !== c.name && saveInline(c.id, { name: e.target.value })}
                    disabled={busy}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Description</label>
                  <input
                    className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-sm"
                    defaultValue={c.description ?? ""}
                    onBlur={(e) => (e.target.value || "") !== (c.description ?? "") && saveInline(c.id, { description: e.target.value || null })}
                    disabled={busy}
                  />
                </div>
              </div>
              <div className="mt-2 font-mono text-xs text-neutral-600">id: {c.id}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
