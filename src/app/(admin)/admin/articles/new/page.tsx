"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type ArticleAuthor = { id: string; slug: string; display_name: string; active: boolean };
type AgentOption = { agent_id: string; handle: string };
type Category = { id: string; slug: string; name: string; description: string | null };

export default function NewArticlePage() {
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [authorId, setAuthorId] = useState<string>("");

  const [articleAuthors, setArticleAuthors] = useState<ArticleAuthor[] | null>(null);
  const [agents, setAgents] = useState<AgentOption[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "New article | Admin";

    fetch("/api/admin/articles/author-options")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        const authors = (j.articleAuthors ?? []) as ArticleAuthor[];
        const agentList = (j.agents ?? []) as AgentOption[];
        setArticleAuthors(authors);
        setAgents(agentList);
        const signal = authors.find((x) => x.slug === "signal")?.id;
        if (signal) setAuthorId(signal);
      })
      .catch(() => {
        setArticleAuthors([]);
        setAgents([]);
      });

    fetch("/api/admin/article-categories")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        const list = (j.categories ?? []) as Category[];
        setCategories(list);
        if (list[0]?.id) setCategoryId(list[0].id);
      })
      .catch(() => setCategories([]));
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);

    const authorDisplay = (() => {
      if (authorId.startsWith("agent:")) {
        const aid = authorId.slice(6);
        return agents?.find((x) => x.agent_id === aid)?.handle ?? null;
      }
      return articleAuthors?.find((x) => x.id === authorId)?.display_name ?? null;
    })();

    const r = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug,
        title,
        category_id: categoryId,
        excerpt: excerpt || null,
        body: body || "",
        author_id: authorId.startsWith("agent:") ? null : authorId || null,
        author_display: authorDisplay,
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
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">New article</h1>
          <p className="mt-1 text-sm text-neutral-400">Create a draft. You can publish from the edit screen.</p>
        </div>
        <Link href="/admin/articles" className="rounded bg-neutral-900 px-3 py-2 text-sm">
          Back
        </Link>
      </div>

      <form onSubmit={create} className="mt-6 space-y-4">
        <div>
          <label className="text-sm text-neutral-300">Title</label>
          <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="text-sm text-neutral-300">Slug</label>
          <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" placeholder="kebab-case" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm text-neutral-300">Category</label>
            <Link href="/admin/articles/categories" className="text-xs text-neutral-400 underline">
              Manage categories
            </Link>
          </div>
          <select className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
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
          <select className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
            <option value="">(none)</option>
            <optgroup label="Article authors">
              {(articleAuthors ?? []).filter((x) => x.active).map((x) => (
                <option key={`author-${x.id}`} value={x.id}>
                  {x.display_name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Agents">
              {(agents ?? []).map((x) => (
                <option key={`agent-${x.agent_id}`} value={`agent:${x.agent_id}`}>
                  {x.handle}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="text-sm text-neutral-300">Excerpt (optional)</label>
          <input className="mt-2 w-full rounded bg-neutral-900 px-3 py-2 text-sm" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-neutral-300">Body</label>
          <div className="mt-2">
            <RichTextEditor value={body} onChange={setBody} />
          </div>
          <div className="mt-1 text-xs text-neutral-500">Stored as HTML.</div>
        </div>

        <button className="rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60" disabled={busy} type="submit">
          Create draft
        </button>

        {err && <div className="text-sm text-red-400">{err}</div>}
      </form>
    </main>
  );
}
