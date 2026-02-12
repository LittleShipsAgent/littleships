"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type Author = { id: string; slug: string; display_name: string; active: boolean };
type Category = { id: string; slug: string; name: string; description: string | null };

type Article = {
  id: string;
  slug: string;
  category_id: string;
  title: string;
  excerpt: string | null;
  body: string;
  author_display: string | null;
  author_id?: string | null;
  published_at: string | null;
  updated_at: string;
};

export default function EditArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [a, setA] = useState<Article | null>(null);
  const [authors, setAuthors] = useState<Author[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(null);
    const r = await fetch(`/api/admin/articles/${slug}`);
    if (!r.ok) {
      setErr(await r.text());
      setA(null);
      return;
    }
    const j = await r.json();
    setA(j.article);
  }

  useEffect(() => {
    load();
    fetch("/api/admin/article-authors")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => setAuthors((j.authors ?? []) as Author[]))
      .catch(() => setAuthors([]));

    fetch("/api/admin/article-categories")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => setCategories((j.categories ?? []) as Category[]))
      .catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function save() {
    if (!a) return;
    setBusy(true);
    setErr(null);

    const authorDisplay = authors?.find((x) => x.id === (a.author_id ?? null))?.display_name ?? a.author_display ?? null;

    const r = await fetch(`/api/admin/articles/${slug}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        body: a.body,
        author_id: a.author_id ?? null,
        author_display: authorDisplay,
        category_id: a.category_id,
        published_at: a.published_at,
      }),
    });

    if (!r.ok) {
      setErr(await r.text());
      setBusy(false);
      return;
    }

    const j = await r.json();
    setA(j.article);
    setBusy(false);
  }

  async function publishNow() {
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/admin/articles/${slug}/publish`, { method: "POST" });
    if (!r.ok) setErr(await r.text());
    await load();
    setBusy(false);
  }

  async function unpublish() {
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/admin/articles/${slug}/unpublish`, { method: "POST" });
    if (!r.ok) setErr(await r.text());
    await load();
    setBusy(false);
  }

  if (!a && !err) {
    return <main className="mx-auto w-full max-w-4xl px-4 py-10 text-sm text-neutral-400">Loading…</main>;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Edit article</h1>
          <div className="mt-1 font-mono text-xs text-neutral-500">/{slug}</div>
        </div>
        <div className="flex gap-2">
          <Link className="rounded bg-neutral-900 px-3 py-2 text-sm" href="/admin/articles">
            Back
          </Link>
          <Link className="rounded bg-neutral-900 px-3 py-2 text-sm" href={`/articles/${slug}`}>
            View
          </Link>
        </div>
      </div>

      {err && <div className="mt-6 rounded border border-red-900 bg-red-950 p-3 text-sm">{err}</div>}

      {!a ? (
        <div className="mt-6 text-sm text-neutral-400">Not found.</div>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-neutral-300">Title</label>
            <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Slug</label>
            <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={a.slug} onChange={(e) => setA({ ...a, slug: e.target.value })} />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm text-neutral-300">Category</label>
              <Link href="/admin/articles/categories" className="text-xs text-neutral-400 underline">
                Manage categories
              </Link>
            </div>
            <select className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={a.category_id} onChange={(e) => setA({ ...a, category_id: e.target.value })}>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {(categories ?? []).length === 0 && <div className="mt-1 text-xs text-neutral-500">No categories yet — add one first.</div>}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm text-neutral-300">Author</label>
              <Link href="/admin/articles/authors" className="text-xs text-neutral-400 underline">
                Manage authors
              </Link>
            </div>
            <select className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={a.author_id ?? ""} onChange={(e) => setA({ ...a, author_id: e.target.value || null })}>
              <option value="">(none)</option>
              {(authors ?? []).filter((x) => x.active).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.display_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-neutral-300">Excerpt (optional)</label>
            <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={a.excerpt ?? ""} onChange={(e) => setA({ ...a, excerpt: e.target.value || null })} />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Body</label>
            <div className="mt-2">
              <RichTextEditor value={a.body} onChange={(v) => setA({ ...a, body: v })} height={560} />
            </div>
            <div className="mt-1 text-xs text-neutral-500">Stored as HTML.</div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button className="rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60" disabled={busy} onClick={save}>
              Save
            </button>
            <button className="rounded bg-emerald-700 px-3 py-2 text-sm font-medium hover:bg-emerald-600 disabled:opacity-60" disabled={busy} onClick={publishNow}>
              Publish now
            </button>
            <button className="rounded bg-neutral-800 px-3 py-2 text-sm font-medium hover:bg-neutral-700 disabled:opacity-60" disabled={busy} onClick={unpublish}>
              Unpublish
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
