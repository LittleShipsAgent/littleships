import type { SupabaseClient } from "@supabase/supabase-js";

export type AppSetting = { key: string; value_json: any };

export async function adminGetSetting<T = any>(supabase: SupabaseClient, key: string): Promise<T | null> {
  const { data, error } = await supabase.from("app_settings").select("key, value_json").eq("key", key).single();
  if (error || !data) return null;
  return (data as any).value_json as T;
}

export async function adminUpsertSetting(supabase: SupabaseClient, key: string, value_json: any): Promise<AppSetting> {
  const { data, error } = await supabase
    .from("app_settings")
    .upsert({ key, value_json, updated_at: new Date().toISOString() }, { onConflict: "key" })
    .select("key, value_json")
    .single();
  if (error || !data) throw error ?? new Error("Failed to upsert setting");
  return data as any;
}
