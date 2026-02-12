import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article } from "@/lib/types";

// NOTE: These helpers intentionally use a user-session Supabase client so RLS applies.

export async function adminListArticles(supabase: SupabaseClient): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("id,slug,category_id,title,excerpt,body,author_display,author_id,published_at,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function adminGetArticle(supabase: SupabaseClient, slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("id,slug,category_id,title,excerpt,body,author_display,author_id,published_at,created_at,updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Article | null;
}

export async function adminCreateArticle(
  supabase: SupabaseClient,
  params: {
    slug: string;
    category_id: string;
    title: string;
    excerpt: string | null;
    body: string;
    author_display: string | null;
    author_id?: string | null;
    published_at: string | null;
  }
): Promise<Article> {
  const { data, error } = await supabase
    .from("articles")
    .insert({
      slug: params.slug,
      category_id: params.category_id,
      title: params.title,
      excerpt: params.excerpt,
      body: params.body,
      author_display: params.author_display,
      author_id: params.author_id ?? null,
      published_at: params.published_at,
    })
    .select("id,slug,category_id,title,excerpt,body,author_display,author_id,published_at,created_at,updated_at")
    .single();

  if (error) throw error;
  return data as Article;
}

export async function adminUpdateArticle(
  supabase: SupabaseClient,
  slug: string,
  patch: Partial<{
    slug: string;
    category_id: string;
    title: string;
    excerpt: string | null;
    body: string;
    author_display: string | null;
    author_id: string | null;
    published_at: string | null;
  }>
): Promise<Article | null> {
  const { data: existing } = await supabase.from("articles").select("id").eq("slug", slug).maybeSingle();
  if (!existing) return null;

  const { data, error } = await supabase
    .from("articles")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select("id,slug,category_id,title,excerpt,body,author_display,author_id,published_at,created_at,updated_at")
    .single();

  if (error) throw error;
  return data as Article;
}
