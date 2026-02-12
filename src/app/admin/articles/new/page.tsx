"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewArticlePage() {
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [authorDisplay, setAuthorDisplay] = useState("Signal");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "New article | Admin";
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);

    const r = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug,
        title,
        category_id: categoryId,
        excerpt: excerpt || null,
        body: body || "",
        author_display: authorDisplay || null,
      }),
    });

    if (!r.ok) {
      setErr(await r.text());
      setBusy(false);
      return;
    }

    const j = await r.json();
    router.push(`/admin/articles/${j.article.slug}`);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">New article</h1>
      <p className="mt-1 text-sm text-neutral-400">Create a draft. You can publish from the edit screen.</p>

      <form onSubmit={create} className="mt-6 space-y-3">
        <input className="w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="slug (kebab-case)" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <input className="w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="category_id (uuid)" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required />
        <input className="w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="Excerpt (optional)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        <input className="w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="Author display (optional)" value={authorDisplay} onChange={(e) => setAuthorDisplay(e.target.value)} />
        <textarea className="h-64 w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="Markdown body" value={body} onChange={(e) => setBody(e.target.value)} />

        <button className="rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950" disabled={busy} type="submit">
          Create draft
        </button>

        {err && <div className="text-sm text-red-400">{err}</div>}
      </form>
    </main>
  );
}
