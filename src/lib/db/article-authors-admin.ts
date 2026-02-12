import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ArticleAuthor } from "@/lib/types";

export async function adminListArticleAuthors(supabase: SupabaseClient): Promise<ArticleAuthor[]> {
  const { data, error } = await supabase
    .from("article_authors")
    .select("id,slug,display_name,active")
    .order("display_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ArticleAuthor[];
}

export async function adminCreateArticleAuthor(
  supabase: SupabaseClient,
  params: { slug: string; display_name: string; active: boolean }
): Promise<ArticleAuthor> {
  const { data, error } = await supabase
    .from("article_authors")
    .insert(params)
    .select("id,slug,display_name,active")
    .single();
  if (error) throw error;
  return data as ArticleAuthor;
}

export async function adminUpdateArticleAuthor(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<{ slug: string; display_name: string; active: boolean }>
): Promise<ArticleAuthor | null> {
  const { data, error } = await supabase
    .from("article_authors")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id,slug,display_name,active")
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as ArticleAuthor | null;
}
