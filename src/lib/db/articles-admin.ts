import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article } from "@/lib/types";

// NOTE: These helpers intentionally use a user-session Supabase client so RLS applies.

/** Escape LIKE special chars (%, _) in user input to avoid pattern injection. */
function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export type ArticleStatusFilter = "all" | "draft" | "scheduled" | "published";

function applyStatusFilter<T>(query: T, status: ArticleStatusFilter): T {
  const now = new Date().toISOString();
  if (status === "draft") return (query as any).is("published_at", null) as T;
  if (status === "scheduled") return (query as any).not("published_at", "is", null).gt("published_at", now) as T;
  if (status === "published") return (query as any).not("published_at", "is", null).lte("published_at", now) as T;
  return query;
}

export async function adminCountArticles(
  supabase: SupabaseClient,
  options?: { search?: string; status?: ArticleStatusFilter }
): Promise<number> {
  let query = supabase.from("articles").select("id", { count: "exact", head: true });
  query = applyStatusFilter(query, options?.status ?? "all");
  const q = (options?.search ?? "").trim();
  if (q) {
    const esc = escapeLike(q);
    query = query.or(`title.ilike.%${esc}%,slug.ilike.%${esc}%`);
  }
  const { count, error } = await query;
  if (error) throw error;
  return typeof count === "number" ? count : 0;
}

export async function adminListArticles(
  supabase: SupabaseClient,
  options?: { limit?: number; offset?: number; search?: string; status?: ArticleStatusFilter }
): Promise<Article[]> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  let query = supabase
    .from("articles")
    .select("id,slug,category_id,title,excerpt,body,author_display,author_id,published_at,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  query = applyStatusFilter(query, options?.status ?? "all");
  const q = (options?.search ?? "").trim();
  if (q) {
    const esc = escapeLike(q);
    query = query.or(`title.ilike.%${esc}%,slug.ilike.%${esc}%`);
  }

  const { data, error } = await query;
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

export async function adminDeleteArticle(supabase: SupabaseClient, slug: string): Promise<boolean> {
  const { data: existing, error: findErr } = await supabase.from("articles").select("id").eq("slug", slug).maybeSingle();
  if (findErr) throw findErr;
  if (!existing?.id) return false;

  // Delete tags join rows first (if present)
  try {
    await supabase.from("article_tags").delete().eq("article_id", existing.id);
  } catch {
    // ignore
  }

  const { error } = await supabase.from("articles").delete().eq("id", existing.id);
  if (error) throw error;
  return true;
}
