import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  const body = (await req.json().catch(() => ({}))) as { email?: string; next?: string };

  const email = body.email?.trim();
  if (!email) return new NextResponse("Missing email", { status: 400 });

  const next = (body.next || "/admin").startsWith("/") ? body.next || "/admin" : "/admin";
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(req.url).origin);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/admin/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return new NextResponse(error.message, { status: 400 });

  return NextResponse.json({ ok: true });
}
