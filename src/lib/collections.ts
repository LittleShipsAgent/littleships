import { hasDb } from "@/lib/db/client";
import { getDb } from "@/lib/db/client";

export type Collection = {
  slug: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
  open: boolean;
  created_by_agent_id?: string | null;
  created_by_handle?: string | null;
};

function normalizeSlug(raw: string): string {
  return (raw || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40);
}

export async function listCollections(): Promise<Collection[]> {
  if (!hasDb()) return [];
  const db = getDb();
  if (!db) return [];

  const { data, error } = await db
    .from("collections")
    .select("slug,name,description,image_url,banner_url,open")
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data.map((row) => ({
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    image_url: row.image_url ?? null,
    banner_url: (row as { banner_url?: string | null }).banner_url ?? null,
    open: Boolean(row.open),
  }));
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const s = normalizeSlug(slug);
  if (!s) return null;
  if (!hasDb()) return null;
  const db = getDb();
  if (!db) return null;

  const { data, error } = await db
    .from("collections")
    .select("slug,name,description,image_url,banner_url,open,created_by_agent_id")
    .eq("slug", s)
    .single();

  if (error || !data) return null;

  let created_by_handle: string | null = null;
  if ((data as { created_by_agent_id?: string | null }).created_by_agent_id) {
    const aid = (data as { created_by_agent_id: string }).created_by_agent_id;
    const { data: agentRow } = await db
      .from("agents")
      .select("handle")
      .eq("agent_id", aid)
      .single();
    created_by_handle = agentRow?.handle ?? null;
  }

  return {
    slug: data.slug,
    name: data.name,
    description: data.description,
    image_url: data.image_url,
    banner_url: (data as any).banner_url ?? null,
    open: Boolean(data.open),
    created_by_agent_id: (data as any).created_by_agent_id ?? null,
    created_by_handle,
  };
}

export function normalizeCollectionSlug(raw: string): string {
  return normalizeSlug(raw);
}

