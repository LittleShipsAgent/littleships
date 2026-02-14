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
    // strip optional quotes
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
  // final cleanup
  return base.replace(/^-+/, "").replace(/-+$/, "");
}

async function main() {
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
    .select("id, slug, title, updated_at, published_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) throw error;

  const existing = new Set(rows.map((r) => r.slug));
  const proposals = [];

  for (const r of rows) {
    const proposed = slugifyTitle(r.title);
    proposals.push({ ...r, proposed });
  }

  // collision detection
  const counts = new Map();
  for (const p of proposals) {
    counts.set(p.proposed, (counts.get(p.proposed) ?? 0) + 1);
  }

  const collisions = [...counts.entries()].filter(([, n]) => n > 1);

  for (const p of proposals) {
    const same = p.slug === p.proposed;
    const tooShort = p.slug.split("-").filter(Boolean).length < 4;
    const collision = counts.get(p.proposed) > 1;

    if (same && !tooShort) continue;

    const flags = [
      same ? "SAME" : "CHANGE",
      tooShort ? "SHORT" : null,
      collision ? "COLLISION" : null,
      existing.has(p.proposed) && p.proposed !== p.slug ? "TAKEN" : null,
      p.published_at ? "PUBLISHED" : "DRAFT",
    ]
      .filter(Boolean)
      .join(",");

    console.log(`${flags}\t${p.slug}\t=>\t${p.proposed}\t|\t${p.title}`);
  }

  if (collisions.length) {
    console.log("\nCollisions (same proposed slug for multiple titles):");
    for (const [slug, n] of collisions) console.log(`- ${slug} (${n})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
