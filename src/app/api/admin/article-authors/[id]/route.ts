import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { adminUpdateArticleAuthor } from "@/lib/db/article-authors-admin";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdminUser();
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as any;

    const updated = await adminUpdateArticleAuthor(supabase, id, {
      slug: body.slug !== undefined ? String(body.slug) : undefined,
      display_name: body.display_name !== undefined ? String(body.display_name) : undefined,
      active: body.active !== undefined ? !!body.active : undefined,
    });

    if (!updated) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json({ author: updated });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
