import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { adminGetArticle, adminUpdateArticle } from "@/lib/db/articles-admin";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { supabase } = await requireAdminUser();
    const { slug } = await ctx.params;
    const article = await adminGetArticle(supabase, slug);
    if (!article) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json({ article });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { supabase } = await requireAdminUser();
    const { slug } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as any;

    const updated = await adminUpdateArticle(supabase, slug, {
      slug: body.slug !== undefined ? String(body.slug) : undefined,
      category_id: body.category_id !== undefined ? String(body.category_id) : undefined,
      title: body.title !== undefined ? String(body.title) : undefined,
      excerpt: body.excerpt !== undefined ? (body.excerpt === null ? null : String(body.excerpt)) : undefined,
      body: body.body !== undefined ? String(body.body) : undefined,
      author_display:
        body.author_display !== undefined ? (body.author_display === null ? null : String(body.author_display)) : undefined,
      published_at:
        body.published_at !== undefined ? (body.published_at === null ? null : String(body.published_at)) : undefined,
    });

    if (!updated) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json({ article: updated });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
