import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };

    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) return new NextResponse("Missing email or password", { status: 400 });

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return new NextResponse(error.message, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message ?? "error";
    return new NextResponse(msg, { status: 500 });
  }
}
