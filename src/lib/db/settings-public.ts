import { getDb } from "./client";

export async function getSponsorsEnabled(): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const { data, error } = await db.from("app_settings").select("value_json").eq("key", "sponsors_enabled").maybeSingle();
  if (error || !data) return false;
  const v = (data as any).value_json as any;
  return !!v?.enabled;
}
