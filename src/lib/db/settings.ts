import "server-only";

import { getDb } from "./client";

export type SiteSettingKey = "sponsors_enabled";

export async function getSiteSettingBool(key: SiteSettingKey, fallback = false): Promise<boolean> {
  const db = getDb();
  if (!db) return fallback;

  const { data, error } = await db.from("site_settings").select("value_bool").eq("key", key).maybeSingle();
  if (error) return fallback;

  return data?.value_bool ?? fallback;
}

export async function setSiteSettingBool(key: SiteSettingKey, value: boolean): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");

  const { error } = await db
    .from("site_settings")
    .upsert({ key, value_bool: value }, { onConflict: "key" });

  if (error) throw error;
}
