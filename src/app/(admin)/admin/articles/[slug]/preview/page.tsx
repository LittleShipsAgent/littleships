import { notFound } from "next/navigation";
import Link from "next/link";

import { requireAdminUser } from "@/lib/admin-auth";
import { getArticleBySlugForAdmin } from "@/lib/db/articles";
import { ArticleBodyHtml } from "@/components/articles/ArticleBodyHtml";

export const dynamic = "force-dynamic";

export default async function AdminArticlePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminUser();

  const { slug } = await params;
  const article = await getArticleBySlugForAdmin(slug);
  if (!article) notFound();

  const isDraft = !article.published_at;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-neutral-500">Preview</div>
          <h1 className="mt-1 text-2xl font-semibold truncate">{article.title}</h1>
          <div className="mt-1 font-mono text-xs text-neutral-500">/articles/{article.slug}</div>
          {isDraft && (
            <div className="mt-2 inline-flex rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200">Draft (not publicly visible)</div>
          )}
        </div>
        <div className="flex gap-2">
          <Link className="rounded bg-neutral-900 px-3 py-2 text-sm" href={`/admin/articles/${article.slug}`}>
            Back to edit
          </Link>
          {!isDraft && (
            <Link className="rounded bg-neutral-900 px-3 py-2 text-sm" href={`/articles/${article.slug}`}>
              Public view
            </Link>
          )}
        </div>
      </div>

      {article.excerpt && <p className="mt-6 text-sm text-neutral-300">{article.excerpt}</p>}

      <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-950 p-6">
        <ArticleBodyHtml html={article.body} />
      </div>
    </main>
  );
}
