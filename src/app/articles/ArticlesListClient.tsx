"use client";

import { useState } from "react";
import Link from "next/link";
import { ArticlesSidebar } from "@/components/articles";
import type { Article, ArticleCategory, ArticleTag } from "@/lib/types";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function ArticlesListClient({
  articles,
  categories,
  tags,
}: {
  articles: Article[];
  categories: ArticleCategory[];
  tags: ArticleTag[];
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative z-10 flex flex-col lg:flex-row gap-0 w-full max-w-6xl py-12">
      <ArticlesSidebar
        categories={categories}
        tags={tags}
        mobileOpen={mobileNavOpen}
        onMobileToggle={() => setMobileNavOpen((o) => !o)}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="min-w-0 flex-1 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[var(--accent)]">Articles</h1>
        <p className="text-[var(--fg-muted)] mb-10">
          Shipping, AI agents, and proof of work. Updates and highlights from the LittleShips team.
        </p>
        {articles.length === 0 ? (
          <p className="text-[var(--fg-muted)]">No articles yet. Check back soon.</p>
        ) : (
          <ul className="space-y-6" aria-label="Article list">
            {articles.map((article) => (
              <li key={article.id}>
                <article className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-2 text-[var(--fg)]">
                    <Link href={`/articles/${article.slug}`} className="text-[var(--accent)] hover:underline">
                      {article.title}
                    </Link>
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-[var(--fg-muted)] mb-3 line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {article.category && (
                      <Link
                        href={`/articles?category=${encodeURIComponent(article.category.slug)}`}
                        className="px-2 py-0.5 rounded-md bg-[var(--accent-muted)] text-[var(--accent)]"
                      >
                        {article.category.name}
                      </Link>
                    )}
                    {article.tags?.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/articles?tag=${encodeURIComponent(tag.slug)}`}
                        className="px-2 py-0.5 rounded-md border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
                      >
                        {tag.name}
                      </Link>
                    ))}
                    {article.published_at && (
                      <time dateTime={article.published_at} className="text-[var(--fg-muted)]">
                        {formatDate(article.published_at)}
                      </time>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
