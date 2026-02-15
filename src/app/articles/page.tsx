import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";
import { ArticlesListClient } from "./ArticlesListClient";
import { listArticles, countArticles, listArticleCategories, listTags } from "@/lib/db/articles";

const ARTICLES_PER_PAGE = 12;

interface ArticlesPageProps {
  searchParams: Promise<{ category?: string; tag?: string; page?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
  const categorySlug = typeof params.category === "string" ? params.category : undefined;
  const tagSlug = typeof params.tag === "string" ? params.tag : undefined;
  const page = Math.max(1, parseInt(String(params.page), 10) || 1);
  const offset = (page - 1) * ARTICLES_PER_PAGE;

  const [articles, total, categories, tags] = await Promise.all([
    listArticles({ categorySlug, tagSlug, limit: ARTICLES_PER_PAGE, offset }),
    countArticles({ categorySlug, tagSlug }),
    listArticleCategories(),
    listTags(true),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />
      <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12">
          <ArticlesListClient
            articles={articles}
            categories={categories}
            tags={tags}
            totalArticles={total}
            currentPage={currentPage}
            totalPages={totalPages}
            articlesPerPage={ARTICLES_PER_PAGE}
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}
