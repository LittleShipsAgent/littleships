import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { OrbsBackground } from "@/components/OrbsBackground";
import { ArticleBodyHtml } from "@/components/articles/ArticleBodyHtml";
import { requireAdminUser } from "@/lib/admin-auth";
import { getArticleBySlugForAdmin } from "@/lib/db/articles";

export const dynamic = "force-dynamic";

export default async function AdminArticlePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminUser();

  const { slug } = await params;
  const article = await getArticleBySlugForAdmin(slug);
  if (!article) notFound();

  const isDraft = !article.published_at;

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      {/* Admin preview banner */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-[var(--fg-muted)]">Admin preview</div>
            <div className="mt-0.5 font-mono text-xs text-[var(--fg-muted)] truncate">/articles/{article.slug}</div>
          </div>
          <div className="flex items-center gap-2">
            {isDraft && (
              <span className="inline-flex rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200">Draft (not public)</span>
            )}
            <Link className="rounded bg-[var(--card)] border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--card-hover)]" href={`/admin/articles/${article.slug}`}>
              Back to edit
            </Link>
            {!isDraft && (
              <Link className="rounded bg-[var(--card)] border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--card-hover)]" href={`/articles/${article.slug}`}>
                Public view
              </Link>
            )}
          </div>
        </div>
      </div>

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
          <article className="max-w-4xl">
            <header className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[var(--accent)]">{article.title}</h1>
              {article.excerpt && <p className="text-[var(--fg-muted)]">{article.excerpt}</p>}
            </header>

            <ArticleBodyHtml html={article.body} />
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}
