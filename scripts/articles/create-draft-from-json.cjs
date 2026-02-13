#!/usr/bin/env node
/*
  Create (or optionally publish) an Article directly in the DB using the service role key.

  Why: DB-first content ops. Avoid markdown/commits for article content.

  Usage:
    node scripts/articles/create-draft-from-json.cjs --json /path/to/article.json
    node scripts/articles/create-draft-from-json.cjs --json /path/to/article.json --publish
    node scripts/articles/create-draft-from-json.cjs --json /path/to/article.json --category product

  Expected JSON shape (minimal):
    {
      "title": "...",
      "slug": "kebab-case",
      "excerpt": "...",
      "bodyHtml": "<p>..</p>"
    }

  Also accepts the @scribe handoff format:
    {
      "recommended": {"title":"...","slug":"..."},
      "excerpt": "...",
      "bodyHtml": "..."
    }
*/

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function parseArgs(argv) {
  const out = { json: null, publish: false, category: null, authorDisplay: "LittleShips" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") out.json = argv[++i];
    else if (a === "--publish") out.publish = true;
    else if (a === "--category") out.category = argv[++i];
    else if (a === "--author-display") out.authorDisplay = argv[++i];
    else if (a === "-h" || a === "--help") out.help = true;
    else throw new Error(`Unknown arg: ${a}`);
  }
  return out;
}

function loadDotEnvLocal(p) {
  if (!fs.existsSync(p)) return;
  const txt = fs.readFileSync(p, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function coerceFromJson(json) {
  const title = json?.title ?? json?.recommended?.title;
  const slug = json?.slug ?? json?.recommended?.slug;
  const excerpt = json?.excerpt ?? null;
  const bodyHtml = json?.bodyHtml ?? json?.body ?? "";
  if (!title || !slug) throw new Error("JSON missing title/slug (or recommended.title/recommended.slug)");
  return { title: String(title), slug: String(slug), excerpt: excerpt ? String(excerpt) : null, bodyHtml: String(bodyHtml) };
}

(async () => {
  const args = parseArgs(process.argv);
  if (args.help || !args.json) {
    console.log("Usage: node scripts/articles/create-draft-from-json.cjs --json <path> [--publish] [--category <slug>] [--author-display <name>]");
    process.exit(args.help ? 0 : 1);
  }

  // Load .env.local so this works without a separate env loader.
  loadDotEnvLocal(path.join(process.cwd(), ".env.local"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (check .env.local)");

  const raw = JSON.parse(fs.readFileSync(args.json, "utf8"));
  const articleIn = coerceFromJson(raw);

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: cats, error: catErr } = await supabase
    .from("article_categories")
    .select("id, slug, name")
    .order("name", { ascending: true });
  if (catErr) throw catErr;
  if (!cats || cats.length === 0) throw new Error("No article_categories found");

  let category = null;
  if (args.category) {
    category = cats.find((c) => c.slug === args.category);
    if (!category) throw new Error(`Unknown category slug: ${args.category}`);
  } else {
    const preferredSlugs = ["product", "updates", "announcements", "news"];
    category = cats.find((c) => preferredSlugs.includes(c.slug)) || cats[0];
  }

  // Ensure unique slug
  let finalSlug = articleIn.slug;
  const { data: existing, error: existErr } = await supabase
    .from("articles")
    .select("id, slug")
    .eq("slug", finalSlug)
    .maybeSingle();
  if (existErr) throw existErr;
  if (existing?.id) {
    finalSlug = `${finalSlug}-${Date.now().toString().slice(-6)}`;
  }

  const now = new Date().toISOString();
  const publishedAt = args.publish ? now : null;

  const { data: article, error: insErr } = await supabase
    .from("articles")
    .insert({
      slug: finalSlug,
      category_id: category.id,
      title: articleIn.title,
      excerpt: articleIn.excerpt,
      body: articleIn.bodyHtml,
      author_display: args.authorDisplay || null,
      published_at: publishedAt,
      updated_at: now,
    })
    .select("id, slug, title, published_at")
    .single();
  if (insErr) throw insErr;

  console.log(
    JSON.stringify(
      {
        ok: true,
        article,
        category,
        urlPath: `/articles/${article.slug}`,
      },
      null,
      2
    )
  );
})().catch((e) => {
  console.error(e?.stack || String(e));
  process.exit(1);
});
