"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pagination } from "@/components/Pagination";

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

const ARTICLES_PER_PAGE = 10;

export default function AdminArticlesIndex() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "draft" || statusParam === "scheduled" || statusParam === "published"
      ? statusParam
      : "all";

  const [articles, setArticles] = useState<ArticleRow[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const buildUrl = useCallback(
    (opts: { page?: number; search?: string; status?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (opts.page !== undefined) {
        if (opts.page <= 1) params.delete("page");
        else params.set("page", String(opts.page));
      }
      if (opts.search !== undefined) {
        if (!opts.search.trim()) params.delete("search");
        else params.set("search", opts.search.trim());
      }
      if (opts.status !== undefined) {
        if (opts.status === "all") params.delete("status");
        else params.set("status", opts.status);
      }
      const q = params.toString();
      return q ? `/admin/articles?${q}` : "/admin/articles";
    },
    [searchParams]
  );

  async function refresh() {
    setErr(null);
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    if (status !== "all") params.set("status", status);
    const r = await fetch(`/api/admin/articles?${params}`);
    if (!r.ok) {
      setErr(await r.text());
      setArticles([]);
      return;
    }
    const j = await r.json();
    setArticles(j.articles ?? []);
    setTotalPages(Math.max(1, j.totalPages ?? 1));
    setTotalCount(typeof j.count === "number" ? j.count : 0);
  }

  useEffect(() => {
    refresh();
  }, [page, search, status]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      router.push(buildUrl({ search: value, page: 1 }));
    }, 300);
  }

  const rows = useMemo(() => articles ?? [], [articles]);

  function handlePageChange(nextPage: number) {
    router.push(buildUrl({ page: nextPage }));
  }

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
          <Link href="/admin/articles/categories" className="rounded bg-neutral-900 px-3 py-2 text-sm">
            Categories
          </Link>
          <Link href="/admin/articles/authors" className="rounded bg-neutral-900 px-3 py-2 text-sm">
            Authors
          </Link>
          <button className="rounded bg-neutral-900 px-3 py-2 text-sm" onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <input
          type="search"
          placeholder="Search by title or slug…"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm placeholder:text-neutral-500 focus:border-neutral-600 focus:outline-none"
          aria-label="Search articles"
        />
        <div className="flex gap-2">
          {(["all", "draft", "scheduled", "published"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => router.push(buildUrl({ status: s, page: 1 }))}
              className={`rounded-lg px-3 py-2 text-sm ${
                status === s
                  ? "bg-neutral-700 text-neutral-100"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {err && <div className="mt-6 rounded border border-red-900 bg-red-950 p-3 text-sm">{err}</div>}

      {articles === null ? (
        <div className="mt-6 text-sm text-neutral-400">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
          {search.trim() || status !== "all"
            ? "No articles match your filters."
            : "No articles yet."}
        </div>
      ) : (
        <>
        <div className="mt-6 divide-y divide-neutral-900 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
          {rows.map((a) => {
            const s = statusLabel(a);
            return (
              <div
                key={a.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/admin/articles/${a.slug}`)}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/admin/articles/${a.slug}`)}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-900/50 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${s.className}`}>{s.text}</span>
                    <div className="truncate font-medium">{a.title || a.slug}</div>
                  </div>
                  <div className="mt-1 font-mono text-xs text-neutral-500">/{a.slug}</div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link className="rounded bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800" href={`/admin/articles/${a.slug}`}>
                    Edit
                  </Link>
                  <Link className="rounded bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800" href={`/admin/articles/${a.slug}/preview`}>
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        {totalCount > ARTICLES_PER_PAGE && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={ARTICLES_PER_PAGE}
            onPageChange={handlePageChange}
          />
        )}
        </>
      )}
    </main>
  );
}
