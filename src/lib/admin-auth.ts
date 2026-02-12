import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdminUser() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    throw new Error("Unauthorized");
  }

  const { data: adminRow, error: adminErr } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminErr || !adminRow) {
    throw new Error("Forbidden");
  }

  return { supabase, user };
}
