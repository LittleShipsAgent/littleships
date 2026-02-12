import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminArticleCategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function adminListArticleCategories(supabase: SupabaseClient): Promise<AdminArticleCategoryRow[]> {
  const { data, error } = await supabase
    .from("article_categories")
    .select("id, slug, name, description")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AdminArticleCategoryRow[];
}

export async function adminCreateArticleCategory(
  supabase: SupabaseClient,
  params: { slug: string; name: string; description?: string | null }
): Promise<AdminArticleCategoryRow> {
  const { data, error } = await supabase
    .from("article_categories")
    .insert({ slug: params.slug, name: params.name, description: params.description ?? null })
    .select("id, slug, name, description")
    .single();
  if (error || !data) throw error ?? new Error("Failed to create category");
  return data as AdminArticleCategoryRow;
}

export async function adminUpdateArticleCategory(
  supabase: SupabaseClient,
  id: string,
  patch: { slug?: string; name?: string; description?: string | null }
): Promise<AdminArticleCategoryRow | null> {
  const updates: Record<string, any> = {};
  if (patch.slug !== undefined) updates.slug = patch.slug;
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.description !== undefined) updates.description = patch.description;

  const { data, error } = await supabase
    .from("article_categories")
    .update(updates)
    .eq("id", id)
    .select("id, slug, name, description")
    .single();

  if (error) {
    // If row missing, supabase usually returns error details; treat as not found.
    return null;
  }
  return (data ?? null) as any;
}
