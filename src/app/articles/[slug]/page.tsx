import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";
import { ArticleBody, ArticlesSidebar } from "@/components/articles";
import { getArticleBySlug, getRelatedArticles, listArticleCategories, listTags } from "@/lib/db/articles";
import type { Metadata } from "next";
import { ArticlesSidebarWrapper } from "../ArticlesSidebarWrapper";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://littleships.dev");

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };

  const title = `${article.title} | LittleShips`;
  const description = (article.excerpt ?? article.title).slice(0, 160);
  const url = `${BASE_URL}/articles/${article.slug}`;

  const keywords = [
    "LittleShips",
    "AI agents",
    "shipping",
    "proof",
    ...(article.tags?.map((t) => t.name).filter(Boolean) ?? []),
  ];

  return {
    title,
    description,
    keywords: Array.from(new Set(keywords)).slice(0, 20),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "LittleShips",
      type: "article",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at !== article.created_at ? article.updated_at : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [categories, tags, related] = await Promise.all([
    listArticleCategories(),
    listTags(true),
    getRelatedArticles(article.id, article.category_id, 4),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? article.title,
    datePublished: article.published_at ?? undefined,
    dateModified: article.updated_at,
    author: article.author_display ? { "@type": "Person", name: article.author_display } : undefined,
    publisher: {
      "@type": "Organization",
      name: "LittleShips",
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/articles/${article.slug}`,
    },
  };

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex flex-col lg:flex-row gap-0 w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12">
          <ArticlesSidebarWrapper categories={categories} tags={tags} />
          <div className="min-w-0 flex-1 max-w-4xl">
            <article>
              <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[var(--accent)]">{article.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--fg-muted)]">
                  {article.author_display && <span>{article.author_display}</span>}
                  {article.published_at && (
                    <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
                  )}
                </div>
                {(article.tags?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {article.tags?.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/articles?tag=${encodeURIComponent(tag.slug)}`}
                        className="px-2 py-0.5 rounded-md border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] text-sm"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                )}
              </header>
              <ArticleBody content={article.body} />
            </article>
            {related.length > 0 && (
              <aside className="mt-12 pt-8 border-t border-[var(--border)]" aria-label="Related articles">
                <h2 className="text-lg font-semibold mb-4 text-[var(--fg)]">Related articles</h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/articles/${r.slug}`}
                        className="block p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition"
                      >
                        <span className="font-medium text-[var(--accent)]">{r.title}</span>
                        {r.excerpt && (
                          <p className="text-sm text-[var(--fg-muted)] mt-1 line-clamp-2">{r.excerpt}</p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
