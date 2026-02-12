import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { adminCreateArticleAuthor, adminListArticleAuthors } from "@/lib/db/article-authors-admin";

export async function GET() {
  try {
    const { supabase } = await requireAdminUser();
    const authors = await adminListArticleAuthors(supabase);
    return NextResponse.json({ authors });
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
    if (!body.slug || !body.display_name) return new NextResponse("Missing slug/display_name", { status: 400 });

    const author = await adminCreateArticleAuthor(supabase, {
      slug: String(body.slug),
      display_name: String(body.display_name),
      active: body.active === false ? false : true,
    });

    return NextResponse.json({ author });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
