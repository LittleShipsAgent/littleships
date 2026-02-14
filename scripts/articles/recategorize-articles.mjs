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

function pickCategorySlug(article) {
  const title = String(article.title ?? "").toLowerCase();
  const slug = String(article.slug ?? "").toLowerCase();
  const text = `${title} ${slug}`;

  // Agents / people/agent intros
  if (text.includes("meet @") || text.startsWith("meet ") || slug.startsWith("meet-") || slug.startsWith("introducing-") || title.startsWith("Meet @") || title.startsWith("Introducing @")) {
    return "agents";
  }

  // Agent highlights / spotlight / case study-ish wins
  if (text.includes("case study") || text.includes("spotlight") || text.includes("highlights") || slug.startsWith("case-study-")) {
    return "agent-highlights";
  }

  // Shipping: how-to, integration, CLI, API usage, CI/CD, verification steps
  const shippingSignals = [
    "how to",
    "quickstart",
    "guide",
    "tutorial",
    "step-by-step",
    "install",
    "setup",
    "register",
    "ship",
    "shipping",
    "/api/",
    "api ",
    "endpoint",
    "cli",
    "ci/cd",
    "cicd",
    "integration",
    "verify",
    "verification",
    "troubleshooting",
    "debug",
    "error",
    "rollback",
    "monitoring",
    "incident",
    "ops",
    "operations",
  ];
  if (shippingSignals.some((s) => text.includes(s))) return "shipping";

  // Everything else defaults to Product (concepts, primitives, policies)
  return "product";
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = !args.has("--apply");

  const repoRoot = process.cwd();
  loadEnvLocal(repoRoot);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: cats, error: ce } = await db.from("article_categories").select("id,slug,name");
  if (ce) throw ce;
  const catIdBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  for (const needed of ["product", "shipping", "agents", "agent-highlights"]) {
    if (!catIdBySlug.has(needed)) throw new Error(`Missing category: ${needed}`);
  }

  const { data: rows, error } = await db
    .from("articles")
    .select("id,slug,title,category_id,published_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) throw error;

  const slugByCatId = new Map(cats.map((c) => [c.id, c.slug]));

  const changes = [];
  for (const a of rows) {
    const currentSlug = slugByCatId.get(a.category_id) ?? "unknown";
    const nextSlug = pickCategorySlug(a);
    if (currentSlug !== nextSlug) {
      changes.push({ id: a.id, slug: a.slug, title: a.title, published: !!a.published_at, from: currentSlug, to: nextSlug });
    }
  }

  console.log(`${dryRun ? "DRY RUN" : "APPLY"}: ${changes.length} recategorizations proposed (scanned last 500 articles by updated_at).`);
  for (const c of changes.slice(0, 80)) {
    console.log(`${c.published ? "PUBLISHED" : "DRAFT"}\t${c.from} -> ${c.to}\t${c.slug}\t|\t${c.title}`);
  }
  if (changes.length > 80) console.log(`... (${changes.length - 80} more)`);

  if (dryRun) {
    console.log("\nRun with --apply to perform updates.");
    return;
  }

  for (const c of changes) {
    const category_id = catIdBySlug.get(c.to);
    const { error: ue } = await db.from("articles").update({ category_id }).eq("id", c.id);
    if (ue) throw ue;
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
