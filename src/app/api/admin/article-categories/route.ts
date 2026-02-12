import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { adminCreateArticleCategory, adminListArticleCategories } from "@/lib/db/article-categories-admin";

export async function GET() {
  try {
    const { supabase } = await requireAdminUser();
    const categories = await adminListArticleCategories(supabase);
    return NextResponse.json({ categories });
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
    if (!body.slug || !body.name) return new NextResponse("Missing slug/name", { status: 400 });

    const category = await adminCreateArticleCategory(supabase, {
      slug: String(body.slug),
      name: String(body.name),
      description: body.description ? String(body.description) : null,
    });

    return NextResponse.json({ category });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
