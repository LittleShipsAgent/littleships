#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadEnvLocal(repoRoot) {
  const p = path.join(repoRoot, ".env.local");
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const idx = s.indexOf("=");
    if (idx === -1) continue;
    const key = s.slice(0, idx).trim();
    let val = s.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}

function pickCategorySlug(contentType) {
  const t = String(contentType ?? "").toLowerCase();
  if (t.includes("team") || t.includes("introduction")) return "agents";
  if (t.includes("case")) return "agent-highlights";
  if (t.includes("how-to") || t.includes("how to") || t.includes("troubleshooting") || t.includes("guide")) return "shipping";
  // default
  return "product";
}

function parseBundle(raw) {
  const parts = raw.split(/\n\s*## Article \d+\s*\n/).slice(1);
  return parts.map((chunk) => {
    const get = (label) => {
      const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, "i");
      const m = chunk.match(re);
      return m ? m[1].trim() : null;
    };

    const contentType = get("Content type");
    const primary = get("Primary keyword/topic");
    const title = get("Title \\(final\\)" );
    const slug = get("SEO slug \\(final\\)" );
    const metaTitle = get("Meta title");
    const metaDesc = get("Meta description");

    const htmlMatch = chunk.match(/\*\*Draft body \(HTML\):\*\*\s*\n\s*([\s\S]*)$/i);
    const html = htmlMatch ? htmlMatch[1].trim() : "";

    return { contentType, primary, title, slug, metaTitle, metaDesc, html };
  });
}

async function ensureUniqueSlug(db, slugBase) {
  let slug = slugBase;
  for (let i = 0; i < 50; i++) {
    const { data } = await db.from("articles").select("id").eq("slug", slug).limit(1);
    if (!data || data.length === 0) return slug;
    slug = `${slugBase}-${i + 2}`;
  }
  throw new Error(`Unable to find unique slug for base=${slugBase}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const apply = args.has("--apply");
  const bundlePath = process.argv.find((a) => a.endsWith(".md")) ?? "/Users/agent1/clawd/notes/scribe-10-new-articles-2026-02-14.md";

  const repoRoot = process.cwd();
  loadEnvLocal(repoRoot);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  const db = createClient(url, key, { auth: { persistSession: false } });

  const raw = fs.readFileSync(bundlePath, "utf8");
  const articles = parseBundle(raw);

  const { data: cats, error: ce } = await db.from("article_categories").select("id,slug,name");
  if (ce) throw ce;
  const catIdBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  const now = new Date().toISOString();

  const plan = [];
  for (const a of articles) {
    if (!a.title || !a.slug || !a.html) throw new Error(`Missing required fields for an article: ${JSON.stringify(a, null, 2)}`);
    const categorySlug = pickCategorySlug(a.contentType);
    const category_id = catIdBySlug.get(categorySlug) ?? catIdBySlug.get("product");
    if (!category_id) throw new Error(`Missing category_id for ${categorySlug}`);

    const slug = await ensureUniqueSlug(db, a.slug);

    plan.push({
      slug,
      categorySlug,
      category_id,
      title: a.title,
      excerpt: a.metaDesc ?? null,
      body: a.html,
      author_display: "Scribe",
      author_id: null,
      published_at: now,
    });
  }

  console.log(`${apply ? "APPLY" : "DRY RUN"}: will publish ${plan.length} articles from bundle: ${bundlePath}`);
  for (const p of plan) {
    console.log(`${p.categorySlug}\t${p.slug}\t|\t${p.title}`);
  }

  if (!apply) {
    console.log("\nRun with --apply to insert + publish.");
    return;
  }

  for (const p of plan) {
    const { error } = await db.from("articles").insert({
      slug: p.slug,
      category_id: p.category_id,
      title: p.title,
      excerpt: p.excerpt,
      body: p.body,
      author_display: p.author_display,
      author_id: p.author_id,
      published_at: p.published_at,
      updated_at: now,
    });
    if (error) throw error;
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
