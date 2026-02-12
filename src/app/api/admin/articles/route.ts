import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { adminCreateArticle, adminListArticles } from "@/lib/db/articles-admin";

export async function GET() {
  try {
    const { supabase } = await requireAdminUser();
    const articles = await adminListArticles(supabase);
    return NextResponse.json({ articles });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}

export async function POST(req: Request) {
  try {
    const { supabase } = await requireAdminUser();
    const body = (await req.json().catch(() => ({}))) as any;

    if (!body.slug || !body.title || !body.category_id) {
      return new NextResponse("Missing slug/title/category_id", { status: 400 });
    }

    const created = await adminCreateArticle(supabase, {
      slug: String(body.slug),
      category_id: String(body.category_id),
      title: String(body.title),
      excerpt: body.excerpt ? String(body.excerpt) : null,
      body: body.body ? String(body.body) : "",
      author_id: body.author_id ? String(body.author_id) : null,
      author_display: body.author_display ? String(body.author_display) : null,
      published_at: body.published_at ? String(body.published_at) : null,
    });

    return NextResponse.json({ article: created });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
