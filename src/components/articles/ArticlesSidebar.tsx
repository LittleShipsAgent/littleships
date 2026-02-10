"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ArticleCategory, ArticleTag } from "@/lib/types";

interface ArticlesSidebarProps {
  categories: ArticleCategory[];
  tags: ArticleTag[];
  mobileOpen: boolean;
  onMobileToggle: () => void;
  onMobileClose: () => void;
}

export function ArticlesSidebar({
  categories,
  tags,
  mobileOpen,
  onMobileToggle,
  onMobileClose,
}: ArticlesSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentTag = searchParams.get("tag");

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden lg:block shrink-0 w-56 xl:w-64 pt-8 pr-6 sticky top-24 self-start"
        aria-label="Articles navigation"
      >
        <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">Articles</p>
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              href="/articles"
              className={`block py-2 px-2 rounded-lg transition group ${!currentCategory && !currentTag ? "text-[var(--accent)] font-medium" : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)]"}`}
            >
              All articles
            </Link>
          </li>
        </ul>
        {categories.length > 0 && (
          <>
            <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mt-6 mb-3">Categories</p>
            <ul className="space-y-1 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/articles?category=${encodeURIComponent(cat.slug)}`}
                    onClick={onMobileClose}
                    className={`block py-2 px-2 rounded-lg transition group ${currentCategory === cat.slug ? "text-[var(--accent)] font-medium" : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)]"}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        {tags.length > 0 && (
          <>
            <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mt-6 mb-3">Tags</p>
            <ul className="space-y-1 text-sm">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    href={`/articles?tag=${encodeURIComponent(tag.slug)}`}
                    onClick={onMobileClose}
                    className={`block py-2 px-2 rounded-lg transition group ${currentTag === tag.slug ? "text-[var(--accent)] font-medium" : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)]"}`}
                  >
                    {tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Mobile dropdown */}
      <div className="lg:hidden w-full mb-6">
        <button
          type="button"
          onClick={onMobileToggle}
          className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--fg)]"
          aria-expanded={mobileOpen}
          aria-controls="articles-mobile-nav"
        >
          <span>Articles navigation</span>
          <svg className={`w-4 h-4 transition ${mobileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <ul
          id="articles-mobile-nav"
          className={`mt-2 space-y-1 border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden ${mobileOpen ? "block" : "hidden"}`}
        >
          <li>
            <Link href="/articles" onClick={onMobileClose} className="block py-2.5 px-3 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)]">
              All articles
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/articles?category=${encodeURIComponent(cat.slug)}`}
                onClick={onMobileClose}
                className="block py-2.5 px-3 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)]"
              >
                {cat.name}
              </Link>
            </li>
          ))}
          {tags.map((tag) => (
            <li key={tag.id}>
              <Link
                href={`/articles?tag=${encodeURIComponent(tag.slug)}`}
                onClick={onMobileClose}
                className="block py-2.5 px-3 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)]"
              >
                {tag.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
