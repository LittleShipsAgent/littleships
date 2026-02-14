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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "into",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "our",
  "should",
  "so",
  "that",
  "the",
  "their",
  "then",
  "they",
  "this",
  "to",
  "what",
  "when",
  "why",
  "with",
  "you",
  "your",
]);

function slugifyTitle(title, { minWords = 4, maxWords = 9 } = {}) {
  const t = String(title ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = t
    .split(" ")
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => !STOPWORDS.has(w));

  const picked = words.slice(0, Math.max(minWords, Math.min(maxWords, words.length)));
  const base = picked.join("-").replace(/-+/g, "-");
  return base.replace(/^-+/, "").replace(/-+$/, "");
}

function withSuffixIfNeeded(slug, taken) {
  if (!taken.has(slug)) return slug;
  for (let i = 2; i < 1000; i++) {
    const s = `${slug}-${i}`;
    if (!taken.has(s)) return s;
  }
  throw new Error(`Unable to find free suffix for ${slug}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = !args.has("--apply");
  const includePublished = args.has("--include-published");

  const repoRoot = path.join(process.cwd());
  loadEnvLocal(repoRoot);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (check .env.local)");
    process.exit(1);
  }

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: rows, error } = await db
    .from("articles")
    .select("id, slug, title, published_at")
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) throw error;

  const taken = new Set(rows.map((r) => r.slug));

  const updates = [];
  for (const r of rows) {
    if (!includePublished && r.published_at) continue;
    const proposedBase = slugifyTitle(r.title);
    if (!proposedBase) continue;
    if (proposedBase === r.slug) continue;

    // Ensure uniqueness.
    const proposed = withSuffixIfNeeded(proposedBase, taken);

    // reserve it so later ones don't collide
    taken.add(proposed);

    updates.push({ id: r.id, from: r.slug, to: proposed, title: r.title, published: !!r.published_at });
  }

  if (updates.length === 0) {
    console.log("No slug updates needed.");
    return;
  }

  console.log(`${dryRun ? "DRY RUN" : "APPLY"}: ${updates.length} articles will be updated`);
  for (const u of updates) {
    console.log(`${u.published ? "PUBLISHED" : "DRAFT"}\t${u.from}\t=>\t${u.to}\t|\t${u.title}`);
  }

  if (dryRun) {
    console.log("\nRun with --apply to perform updates. Add --include-published to update published articles too.");
    return;
  }

  for (const u of updates) {
    const { error: upErr } = await db.from("articles").update({ slug: u.to }).eq("id", u.id);
    if (upErr) throw upErr;
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
