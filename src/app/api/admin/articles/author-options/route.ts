import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { adminListArticleAuthors } from "@/lib/db/article-authors-admin";

export async function GET() {
  try {
    const { supabase } = await requireAdminUser();

    const [authorsRes, agentsRes] = await Promise.all([
      adminListArticleAuthors(supabase),
      supabase.from("agents").select("agent_id,handle").order("handle", { ascending: true }),
    ]);

    const authors = authorsRes ?? [];
    const agents = (agentsRes.data ?? []).map((r) => ({
      agent_id: r.agent_id,
      handle: r.handle,
    }));

    return NextResponse.json({ articleAuthors: authors, agents });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "error";
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return new NextResponse(msg, { status });
  }
}
