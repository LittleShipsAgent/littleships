import Link from "next/link";
import { notFound } from "next/navigation";

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

  return (
    <section className="min-h-screen relative overflow-hidden bg-[var(--bg)]">
      <OrbsBackground />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[min(50vh,320px)] pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-10">
        <div className="mb-6">
          <Link
            className="inline-flex items-center gap-2 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
            href={`/admin/articles/${article.slug}`}
          >
            Back to edit
          </Link>
        </div>

        <header className="mb-8">
          <div className="text-xs text-[var(--fg-muted)]">Preview</div>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--fg)]">{article.title}</h1>
          {article.excerpt && <p className="mt-3 text-[var(--fg-muted)]">{article.excerpt}</p>}
        </header>

        {/* No border/card: show markup directly on the live canvas background. */}
        <ArticleBodyHtml html={article.body} />
      </main>
    </section>
  );
}
