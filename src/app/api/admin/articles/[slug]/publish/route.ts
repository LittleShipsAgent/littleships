import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { adminUpdateArticle } from "@/lib/db/articles-admin";

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { supabase } = await requireAdminUser();
    const { slug } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { when?: string };

    const when = body.when ? new Date(body.when).toISOString() : new Date().toISOString();
    const updated = await adminUpdateArticle(supabase, slug, { published_at: when });

    if (!updated) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json({ article: updated });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
