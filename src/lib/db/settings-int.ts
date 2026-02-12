import "server-only";

import { getDb } from "./client";
import type { SiteSettingKey } from "./settings";

export async function getSiteSettingInt(key: SiteSettingKey, fallback = 0): Promise<number> {
  const db = getDb();
  if (!db) return fallback;

  const { data, error } = await db.from("site_settings").select("value_int").eq("key", key).maybeSingle();
  if (error) return fallback;

  const v = (data as any)?.value_int;
  return typeof v === "number" ? v : fallback;
}

export async function setSiteSettingInt(key: SiteSettingKey, value: number): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");

  const { error } = await db
    .from("site_settings")
    .upsert({ key, value_int: value }, { onConflict: "key" });

  if (error) throw error;
}
