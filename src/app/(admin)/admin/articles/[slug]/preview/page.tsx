import Link from "next/link";
import { notFound } from "next/navigation";

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
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-neutral-500">Preview (draft styling check)</div>
          <h1 className="mt-1 text-2xl font-semibold truncate">{article.title}</h1>
          {article.excerpt && <p className="mt-3 text-sm text-neutral-300">{article.excerpt}</p>}
        </div>
        <div className="flex gap-2">
          <Link className="rounded bg-neutral-900 px-3 py-2 text-sm" href={`/admin/articles/${article.slug}`}>
            Back to edit
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-950 p-6">
        <ArticleBodyHtml html={article.body} />
      </div>
    </main>
  );
}
