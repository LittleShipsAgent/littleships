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
      <div className="mb-6">
        <Link className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white" href={`/admin/articles/${article.slug}`}>
           Back to edit
        </Link>
      </div>

      <header className="mb-8">
        <div className="text-xs text-neutral-500">Preview</div>
        <h1 className="mt-1 text-2xl font-semibold">{article.title}</h1>
        {article.excerpt && <p className="mt-3 text-sm text-neutral-300">{article.excerpt}</p>}
      </header>

      {/* No border/card here: preview should feel like the live article canvas. */}
      <ArticleBodyHtml html={article.body} />
    </main>
  );
}
