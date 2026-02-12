import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { adminUpdateArticleCategory } from "@/lib/db/article-categories-admin";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdminUser();
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as any;

    const updated = await adminUpdateArticleCategory(supabase, id, {
      slug: body.slug !== undefined ? String(body.slug) : undefined,
      name: body.name !== undefined ? String(body.name) : undefined,
      description: body.description !== undefined ? (body.description === null ? null : String(body.description)) : undefined,
    });

    if (!updated) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json({ category: updated });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
