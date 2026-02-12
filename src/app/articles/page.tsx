import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";
import { ArticlesListClient } from "./ArticlesListClient";
import { listArticles, listArticleCategories, listTags } from "@/lib/db/articles";
import { getSponsorsEnabled } from "@/lib/db/settings-public";
import { PageWithRails } from "@/components/PageWithRails";

interface ArticlesPageProps {
  searchParams: Promise<{ category?: string; tag?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
  const categorySlug = typeof params.category === "string" ? params.category : undefined;
  const tagSlug = typeof params.tag === "string" ? params.tag : undefined;

  const [articles, categories, tags, sponsorsEnabled] = await Promise.all([
    listArticles({ categorySlug, tagSlug }),
    listArticleCategories(),
    listTags(true),
    getSponsorsEnabled(),
  ]);

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
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
        {/** Rails wrapper lives at the page level to keep sidebar layout intact. */}
        {sponsorsEnabled ? (
          <PageWithRails>
            <ArticlesListClient articles={articles} categories={categories} tags={tags} />
          </PageWithRails>
        ) : (
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12">
            <ArticlesListClient articles={articles} categories={categories} tags={tags} />
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
