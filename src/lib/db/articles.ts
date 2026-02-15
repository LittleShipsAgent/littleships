import { getDb } from "./client";
import type { Article, ArticleCategory, ArticleTag } from "@/lib/types";

function rowToCategory(row: { id: string; slug: string; name: string; description?: string | null }): ArticleCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
  };
}

function rowToTag(row: { id: string; slug: string; name: string }): ArticleTag {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
  };
}

function rowToArticle(row: {
  id: string;
  slug: string;
  category_id: string;
  title: string;
  excerpt: string | null;
  body: string;
  author_display: string | null;
  author_id?: string | null;
  author?: { id: string; slug: string; display_name: string; active: boolean } | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: { id: string; slug: string; name: string; description?: string | null } | null;
  tags?: { id: string; slug: string; name: string }[] | null;
}): Article {
  return {
    id: row.id,
    slug: row.slug,
    category_id: row.category_id,
    category: row.category ? rowToCategory(row.category) : undefined,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    author_display: row.author_display,
    author_id: row.author_id ?? null,
    author: row.author
      ? {
          id: row.author.id,
          slug: row.author.slug,
          display_name: row.author.display_name,
          active: row.author.active,
        }
      : undefined,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: Array.isArray(row.tags) ? row.tags.map(rowToTag) : undefined,
  };
}

/** Count published articles with same filters as listArticles. */
export async function countArticles(options?: {
  categorySlug?: string;
  tagSlug?: string;
}): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const now = new Date().toISOString();

  let query = db
    .from("articles")
    .select("id", { count: "exact", head: true })
    .not("published_at", "is", null)
    .lte("published_at", now);

  if (options?.categorySlug) {
    const { data: catRows } = await db.from("article_categories").select("id").eq("slug", options.categorySlug).limit(1);
    const categoryId = catRows?.[0]?.id;
    if (categoryId) query = query.eq("category_id", categoryId);
  }

  if (options?.tagSlug) {
    const { data: tagRows } = await db.from("tags").select("id").eq("slug", options.tagSlug).limit(1);
    const tagId = tagRows?.[0]?.id;
    if (tagId) {
      const { data: articleIds } = await db.from("article_tags").select("article_id").eq("tag_id", tagId);
      const ids = articleIds?.map((r) => r.article_id) ?? [];
      if (ids.length === 0) return 0;
      query = query.in("id", ids);
    }
  }

  const { count, error } = await query;
  if (error) return 0;
  return typeof count === "number" ? count : 0;
}

/** List published articles, optionally filtered by category or tag. Only returns rows where published_at is set and in the past. */
export async function listArticles(options?: {
  categorySlug?: string;
  tagSlug?: string;
  limit?: number;
  offset?: number;
}): Promise<Article[]> {
  const db = getDb();
  if (!db) return [];
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;
  const now = new Date().toISOString();

  let query = db
    .from("articles")
    .select(
      `
      id, slug, category_id, title, excerpt, body, author_display, published_at, created_at, updated_at,
      article_categories(id, slug, name, description),
      article_authors(id, slug, display_name, active),
      article_tags(tags(id, slug, name))
    `
    )
    .not("published_at", "is", null)
    .lte("published_at", now)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.categorySlug) {
    const { data: catRows } = await db.from("article_categories").select("id").eq("slug", options.categorySlug).limit(1);
    const categoryId = catRows?.[0]?.id;
    if (categoryId) query = query.eq("category_id", categoryId);
  }

  if (options?.tagSlug) {
    const { data: tagRows } = await db.from("tags").select("id").eq("slug", options.tagSlug).limit(1);
    const tagId = tagRows?.[0]?.id;
    if (tagId) {
      const { data: articleIds } = await db.from("article_tags").select("article_id").eq("tag_id", tagId);
      const ids = articleIds?.map((r) => r.article_id) ?? [];
      if (ids.length === 0) return [];
      query = query.in("id", ids);
    }
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => {
    const at = (row.article_tags as unknown as { tags: { id: string; slug: string; name: string } }[] | null) ?? [];
    const tags = at.map((x) => x.tags);
    return rowToArticle({
      ...row,
      category: row.article_categories as Article["category"],
      author: row.article_authors as any,
      tags,
    } as Parameters<typeof rowToArticle>[0]);
  });
}

/** Get a single published article by slug, with category and tags. Returns null if not found or not published. */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const db = getDb();
  if (!db) return null;
  const now = new Date().toISOString();

  const { data, error } = await db
    .from("articles")
    .select(
      `
      id, slug, category_id, title, excerpt, body, author_display, published_at, created_at, updated_at,
      article_categories(id, slug, name, description),
      article_authors(id, slug, display_name, active),
      article_tags(tags(id, slug, name))
    `
    )
    .eq("slug", slug)
    .not("published_at", "is", null)
    .lte("published_at", now)
    .single();

  if (error || !data) return null;

  const at = (data.article_tags as unknown as { tags: ArticleTag }[] | null) ?? [];
  const tags = at.map((x) => x.tags);
  return rowToArticle({
    ...data,
    category: data.article_categories as unknown as Article["category"],
    tags,
  } as Parameters<typeof rowToArticle>[0]);
}

/** Get article by slug for admin/OG (includes drafts). */
export async function getArticleBySlugForAdmin(slug: string): Promise<Article | null> {
  const db = getDb();
  if (!db) return null;

  const { data, error } = await db
    .from("articles")
    .select(
      `
      id, slug, category_id, title, excerpt, body, author_display, published_at, created_at, updated_at,
      article_categories(id, slug, name, description),
      article_authors(id, slug, display_name, active),
      article_tags(tags(id, slug, name))
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  const at = (data.article_tags as unknown as { tags: ArticleTag }[] | null) ?? [];
  const tags = at.map((x) => x.tags);
  return rowToArticle({
    ...data,
    category: data.article_categories as unknown as Article["category"],
    tags,
  } as Parameters<typeof rowToArticle>[0]);
}

export async function listArticleCategories(): Promise<ArticleCategory[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db.from("article_categories").select("id, slug, name, description").order("name");
  if (error || !data) return [];
  return data.map(rowToCategory);
}

/** List tags. Optionally only those that have at least one published article. */
export async function listTags(onlyWithPublished = true): Promise<ArticleTag[]> {
  const db = getDb();
  if (!db) return [];
  if (onlyWithPublished) {
    const now = new Date().toISOString();
    const { data: articleIds } = await db
      .from("articles")
      .select("id")
      .not("published_at", "is", null)
      .lte("published_at", now);
    const ids = articleIds?.map((r) => r.id) ?? [];
    if (ids.length === 0) return [];
    const { data: atRows } = await db.from("article_tags").select("tag_id").in("article_id", ids);
    const tagIds = [...new Set((atRows ?? []).map((r) => r.tag_id))];
    if (tagIds.length === 0) return [];
    const { data, error } = await db.from("tags").select("id, slug, name").in("id", tagIds).order("name");
    if (error || !data) return [];
    return data.map(rowToTag);
  }
  const { data, error } = await db.from("tags").select("id, slug, name").order("name");
  if (error || !data) return [];
  return data.map(rowToTag);
}

/** Related articles: same category, exclude current, by published_at desc, limit. */
export async function getRelatedArticles(articleId: string, categoryId: string, limit = 4): Promise<Article[]> {
  const db = getDb();
  if (!db) return [];
  const now = new Date().toISOString();

  const { data, error } = await db
    .from("articles")
    .select(
      `
      id, slug, category_id, title, excerpt, body, author_display, published_at, created_at, updated_at,
      article_categories(id, slug, name, description),
      article_authors(id, slug, display_name, active),
      article_tags(tags(id, slug, name))
    `
    )
    .eq("category_id", categoryId)
    .neq("id", articleId)
    .not("published_at", "is", null)
    .lte("published_at", now)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => {
    const at = (row.article_tags as { tags: { id: string; slug: string; name: string } }[] | null) ?? [];
    const tags = at.map((x) => x.tags);
    return rowToArticle({
      ...row,
      category: row.article_categories as unknown as Article["category"],
      tags,
    } as Parameters<typeof rowToArticle>[0]);
  });
}

/** List all published article slugs for sitemap. */
export async function listArticleSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const db = getDb();
  if (!db) return [];
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("articles")
    .select("slug, updated_at")
    .not("published_at", "is", null)
    .lte("published_at", now)
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data;
}

/** List all articles for admin (including drafts). */
export async function listArticlesForAdmin(): Promise<Article[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("articles")
    .select(
      `
      id, slug, category_id, title, excerpt, body, author_display, published_at, created_at, updated_at,
      article_categories(id, slug, name, description),
      article_authors(id, slug, display_name, active),
      article_tags(tags(id, slug, name))
    `
    )
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row: Record<string, unknown>) => {
    const at = (row.article_tags as { tags: { id: string; slug: string; name: string } }[] | null) ?? [];
    const tags = at.map((x) => x.tags);
    return rowToArticle({
      ...row,
      category: row.article_categories as unknown as Article["category"],
      tags,
    } as Parameters<typeof rowToArticle>[0]);
  });
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSlug(slug: string): boolean {
  return slug.length >= 2 && slug.length <= 100 && SLUG_REGEX.test(slug);
}

/** Create article and assign tags. Returns created article or throws. */
export async function createArticle(params: {
  slug: string;
  category_id: string;
  title: string;
  excerpt: string | null;
  body: string;
  author_display: string | null;
  published_at: string | null;
  tag_ids: string[];
}): Promise<Article> {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  if (!validateSlug(params.slug)) throw new Error("Invalid slug");
  const now = new Date().toISOString();
  const { data: article, error: articleError } = await db
    .from("articles")
    .insert({
      slug: params.slug,
      category_id: params.category_id,
      title: params.title,
      excerpt: params.excerpt || null,
      body: params.body,
      author_display: params.author_display || null,
      published_at: params.published_at || null,
      updated_at: now,
    })
    .select(
      `
      id, slug, category_id, title, excerpt, body, author_display, published_at, created_at, updated_at,
      article_categories(id, slug, name, description),
      article_authors(id, slug, display_name, active),
      article_tags(tags(id, slug, name))
    `
    )
    .single();
  if (articleError || !article) throw articleError ?? new Error("Failed to create article");
  let tags: ArticleTag[] = [];
  if (params.tag_ids.length > 0) {
    await db.from("article_tags").insert(
      params.tag_ids.map((tag_id) => ({ article_id: article.id, tag_id }))
    );
    const { data: tagRows } = await db.from("tags").select("id, slug, name").in("id", params.tag_ids);
    tags = (tagRows ?? []).map(rowToTag);
  }
  return rowToArticle({
    ...article,
    category: article.article_categories as unknown as Article["category"],
    tags,
  } as Parameters<typeof rowToArticle>[0]);
}

/** Update article and replace tags. */
export async function updateArticle(
  slug: string,
  params: {
    slug?: string;
    category_id?: string;
    title?: string;
    excerpt?: string | null;
    body?: string;
    author_display?: string | null;
    published_at?: string | null;
    tag_ids?: string[];
  }
): Promise<Article | null> {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const newSlug = params.slug ?? slug;
  if (!validateSlug(newSlug)) throw new Error("Invalid slug");

  const { data: existing } = await db.from("articles").select("id").eq("slug", slug).single();
  if (!existing) return null;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (params.slug !== undefined) updates.slug = params.slug;
  if (params.category_id !== undefined) updates.category_id = params.category_id;
  if (params.title !== undefined) updates.title = params.title;
  if (params.excerpt !== undefined) updates.excerpt = params.excerpt;
  if (params.body !== undefined) updates.body = params.body;
  if (params.author_display !== undefined) updates.author_display = params.author_display;
  if (params.published_at !== undefined) updates.published_at = params.published_at;

  const { error: updateError } = await db.from("articles").update(updates).eq("id", existing.id);
  if (updateError) throw updateError;

  if (params.tag_ids !== undefined) {
    await db.from("article_tags").delete().eq("article_id", existing.id);
    if (params.tag_ids.length > 0) {
      await db.from("article_tags").insert(
        params.tag_ids.map((tag_id) => ({ article_id: existing.id, tag_id }))
      );
    }
  }

  return getArticleBySlugForAdmin(newSlug);
}
