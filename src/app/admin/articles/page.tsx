"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  updated_at: string;
};

function statusLabel(a: ArticleRow): { text: string; className: string } {
  if (!a.published_at) return { text: "Draft", className: "bg-neutral-800 text-neutral-200" };
  const when = new Date(a.published_at).getTime();
  if (when > Date.now()) return { text: "Scheduled", className: "bg-blue-900 text-blue-200" };
  return { text: "Published", className: "bg-emerald-900 text-emerald-200" };
}

export default function AdminArticlesIndex() {
  const [articles, setArticles] = useState<ArticleRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setErr(null);
    const r = await fetch("/api/admin/articles");
    if (!r.ok) {
      setErr(await r.text());
      setArticles([]);
      return;
    }
    const j = await r.json();
    setArticles(j.articles ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  const rows = useMemo(() => articles ?? [], [articles]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Articles</h1>
          <p className="mt-1 text-sm text-neutral-400">Drafts, scheduled posts, and published articles.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/articles/new" className="rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950">
            New article
          </Link>
          <button className="rounded bg-neutral-900 px-3 py-2 text-sm" onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>

      {err && <div className="mt-6 rounded border border-red-900 bg-red-950 p-3 text-sm">{err}</div>}

      {articles === null ? (
        <div className="mt-6 text-sm text-neutral-400">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
          No articles yet.
        </div>
      ) : (
        <div className="mt-6 divide-y divide-neutral-900 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
          {rows.map((a) => {
            const s = statusLabel(a);
            return (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${s.className}`}>{s.text}</span>
                    <div className="truncate font-medium">{a.title || a.slug}</div>
                  </div>
                  <div className="mt-1 font-mono text-xs text-neutral-500">/{a.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link className="rounded bg-neutral-900 px-3 py-2 text-sm" href={`/admin/articles/${a.slug}`}>
                    Edit
                  </Link>
                  <Link className="rounded bg-neutral-900 px-3 py-2 text-sm" href={`/articles/${a.slug}`}>
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
