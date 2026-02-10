#!/usr/bin/env node
/**
 * Local-only Articles CLI for LittleShips.
 *
 * Goal: create/update/publish articles WITHOUT exposing any public write endpoints.
 * Auth: uses SUPABASE_SERVICE_ROLE_KEY from your local environment.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/articles.js help
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const nacl = require("tweetnacl");

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function env(name) {
  const v = process.env[name];
  if (!v) die(`Missing env var: ${name}`);
  return v;
}

function getDb() {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  const flags = {};
  const args = [];
  for (let i = 0; i < rest.length; i++) {
    const t = rest[i];
    if (t.startsWith("--")) {
      const k = t.slice(2);
      const next = rest[i + 1];
      if (!next || next.startsWith("--")) {
        flags[k] = true;
      } else {
        flags[k] = next;
        i++;
      }
    } else {
      args.push(t);
    }
  }
  return { cmd, args, flags };
}

function readFileMaybe(p) {
  if (!p) return null;
  const abs = path.resolve(process.cwd(), p);
  return fs.readFileSync(abs, "utf8");
}

function readKeyEnv(agentHandle) {
  // agentHandle can be "scribe" or "@scribe"
  const handle = String(agentHandle || "").replace(/^@/, "").trim();
  if (!handle) return null;
  const keyPath = path.join(os.homedir(), ".littleships", "keys", `${handle}.env`);
  if (!fs.existsSync(keyPath)) return null;
  const raw = fs.readFileSync(keyPath, "utf8");

  // Parse KEY=VALUE lines (very simple .env parser)
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf("=");
    if (idx === -1) continue;
    const k = t.slice(0, idx).trim();
    const v = t.slice(idx + 1).trim();
    out[k] = v;
  }
  return out;
}

function hexToU8(hex) {
  if (typeof hex !== "string" || !/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
    throw new Error("Invalid hex");
  }
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

function stableStringify(obj) {
  // Deterministic JSON stringify (sorted keys)
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

function sha256Hex(s) {
  return crypto.createHash("sha256").update(String(s)).digest("hex");
}

function signPayload({ as, payload }) {
  const envs = readKeyEnv(as);
  if (!envs) throw new Error(`No key file found for @${String(as).replace(/^@/, "")}`);

  // Expect HELIX_PRIVATE_KEY / HELIX_PUBLIC_KEY style vars. We'll pick the first *_PRIVATE_KEY and *_PUBLIC_KEY.
  const privKeyVar = Object.keys(envs).find((k) => k.endsWith("_PRIVATE_KEY"));
  const pubKeyVar = Object.keys(envs).find((k) => k.endsWith("_PUBLIC_KEY"));
  if (!privKeyVar || !pubKeyVar) throw new Error(`Key file for @${as} missing *_PRIVATE_KEY/*_PUBLIC_KEY`);

  const privHex = envs[privKeyVar];
  const pubHex = envs[pubKeyVar];

  const msg = stableStringify(payload);
  const digestHex = sha256Hex(msg);

  const priv32 = hexToU8(privHex);
  // LittleShips agent keys are 32-byte ed25519 seeds.
  const kp = nacl.sign.keyPair.fromSeed(priv32);
  const sig = nacl.sign.detached(hexToU8(digestHex), kp.secretKey);
  const sigHex = Buffer.from(sig).toString("hex");

  return {
    agent_handle: `@${String(as).replace(/^@/, "")}`,
    public_key: pubHex,
    payload_json: payload,
    payload_sha256: digestHex,
    signature: sigHex,
    signed_at: new Date().toISOString(),
  };
}

async function writeSignatureRow(db, row) {
  // Best-effort: if table doesn't exist, don't fail the primary operation.
  const { error } = await db.from("article_signatures").insert(row);
  if (error) {
    console.error(`(warn) could not write article signature (article_signatures): ${error.message}`);
  }
}

function validateSlug(slug) {
  return typeof slug === "string" && slug.length >= 2 && slug.length <= 100 && SLUG_REGEX.test(slug);
}

async function ensureCategoryId(db, category) {
  if (!category) die("--category is required (category slug)");
  const { data, error } = await db.from("article_categories").select("id,slug").eq("slug", category).limit(1);
  if (error) die(`Failed to look up category: ${error.message}`);
  const row = data?.[0];
  if (!row) die(`Category not found: ${category}`);
  return row.id;
}

async function ensureTagIds(db, tagSlugs) {
  const slugs = (tagSlugs || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (slugs.length === 0) return [];

  // Fetch existing
  const { data: existing, error } = await db.from("tags").select("id,slug").in("slug", slugs);
  if (error) die(`Failed to list tags: ${error.message}`);

  const existingBySlug = new Map((existing || []).map((t) => [t.slug, t.id]));
  const missing = slugs.filter((s) => !existingBySlug.has(s));

  if (missing.length > 0) {
    // Create missing tags (name = Title Case fallback)
    const rows = missing.map((slug) => ({
      slug,
      name: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }));
    const { data: created, error: createErr } = await db.from("tags").insert(rows).select("id,slug");
    if (createErr) die(`Failed to create tags: ${createErr.message}`);
    for (const t of created || []) existingBySlug.set(t.slug, t.id);
  }

  return slugs.map((s) => existingBySlug.get(s)).filter(Boolean);
}

async function cmdList(db, flags) {
  const limit = flags.limit ? Number(flags.limit) : 25;
  const { data, error } = await db
    .from("articles")
    .select("slug,title,published_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) die(error.message);
  for (const a of data || []) {
    const state = a.published_at ? "published" : "draft";
    console.log(`${state}\t${a.slug}\t${a.title}`);
  }
}

async function cmdCreate(db, flags) {
  const slug = flags.slug;
  if (!validateSlug(slug)) die(`Invalid --slug: ${slug}`);

  const title = flags.title;
  if (!title) die("--title is required");

  const excerpt = flags.excerpt ?? null;
  const author = flags.author ?? null;
  const body = flags.body ? readFileMaybe(flags.body) : null;
  if (!body) die("--body is required (path to markdown/text file)");

  const categoryId = await ensureCategoryId(db, flags.category);
  const tagIds = await ensureTagIds(db, flags.tags);

  const publishedAt = flags.publish ? new Date().toISOString() : null;

  const now = new Date().toISOString();
  const { data: article, error: articleError } = await db
    .from("articles")
    .insert({
      slug,
      category_id: categoryId,
      title,
      excerpt,
      body,
      author_display: author,
      published_at: publishedAt,
      updated_at: now,
    })
    .select("id,slug")
    .single();

  if (articleError || !article) die(articleError?.message ?? "Failed to create article");

  if (tagIds.length > 0) {
    const rows = tagIds.map((tag_id) => ({ article_id: article.id, tag_id }));
    const { error: tagErr } = await db.from("article_tags").insert(rows);
    if (tagErr) die(`Failed to attach tags: ${tagErr.message}`);
  }

  // Optional agent signature audit log
  if (flags.as && !flags.noSign) {
    try {
      const sig = signPayload({
        as: flags.as,
        payload: {
          kind: "article.create",
          slug,
          title,
          excerpt,
          author_display: author,
          category_id: categoryId,
          tag_ids: tagIds,
          body_sha256: sha256Hex(body),
          published_at: publishedAt,
          article_id: article.id,
          ts: now,
        },
      });
      await writeSignatureRow(db, {
        article_id: article.id,
        action: "create",
        agent_handle: sig.agent_handle,
        public_key: sig.public_key,
        payload_json: sig.payload_json,
        payload_sha256: sig.payload_sha256,
        signature: sig.signature,
        signed_at: sig.signed_at,
      });
      console.log(`Signed by ${sig.agent_handle}: ${sig.signature.slice(0, 16)}…`);
    } catch (e) {
      die(`Signing failed: ${e.message}`);
    }
  }

  console.log(`OK created: ${article.slug}${publishedAt ? " (published)" : " (draft)"}`);
}

async function cmdUpdate(db, flags) {
  const slug = flags.slug;
  if (!slug) die("--slug is required");

  const { data: existing, error: existingErr } = await db
    .from("articles")
    .select("id, slug, category_id, title, excerpt, body, author_display, published_at")
    .eq("slug", slug)
    .single();
  if (existingErr || !existing) die(`Article not found: ${slug}`);

  const ts = new Date().toISOString();
  const updates = { updated_at: ts };

  if (flags.newSlug !== undefined) {
    if (!validateSlug(flags.newSlug)) die(`Invalid --newSlug: ${flags.newSlug}`);
    updates.slug = flags.newSlug;
  }
  if (flags.title !== undefined) updates.title = flags.title;
  if (flags.excerpt !== undefined) updates.excerpt = flags.excerpt;
  if (flags.author !== undefined) updates.author_display = flags.author;
  if (flags.body !== undefined) updates.body = readFileMaybe(flags.body);
  if (flags.category !== undefined) updates.category_id = await ensureCategoryId(db, flags.category);

  if (flags.publish) updates.published_at = ts;
  if (flags.unpublish) updates.published_at = null;

  const { error: updateErr } = await db.from("articles").update(updates).eq("id", existing.id);
  if (updateErr) die(updateErr.message);

  let tagIds = null;
  if (flags.tags !== undefined) {
    // Replace tags
    await db.from("article_tags").delete().eq("article_id", existing.id);
    tagIds = await ensureTagIds(db, flags.tags);
    if (tagIds.length > 0) {
      const rows = tagIds.map((tag_id) => ({ article_id: existing.id, tag_id }));
      const { error: tagErr } = await db.from("article_tags").insert(rows);
      if (tagErr) die(`Failed to attach tags: ${tagErr.message}`);
    }
  }

  // Optional agent signature audit log
  if (flags.as && !flags.noSign) {
    try {
      const nextSlug = updates.slug ?? existing.slug;
      const nextTitle = updates.title ?? existing.title;
      const nextExcerpt = updates.excerpt ?? existing.excerpt;
      const nextAuthor = updates.author_display ?? existing.author_display;
      const nextCategoryId = updates.category_id ?? existing.category_id;
      const nextPublishedAt = Object.prototype.hasOwnProperty.call(updates, "published_at")
        ? updates.published_at
        : existing.published_at;
      const nextBody = updates.body ?? existing.body;

      const sig = signPayload({
        as: flags.as,
        payload: {
          kind: "article.update",
          article_id: existing.id,
          slug: slug,
          next: {
            slug: nextSlug,
            title: nextTitle,
            excerpt: nextExcerpt,
            author_display: nextAuthor,
            category_id: nextCategoryId,
            tag_ids: tagIds ?? "(unchanged)",
            body_sha256: sha256Hex(nextBody),
            published_at: nextPublishedAt,
          },
          ts,
        },
      });

      await writeSignatureRow(db, {
        article_id: existing.id,
        action: "update",
        agent_handle: sig.agent_handle,
        public_key: sig.public_key,
        payload_json: sig.payload_json,
        payload_sha256: sig.payload_sha256,
        signature: sig.signature,
        signed_at: sig.signed_at,
      });
      console.log(`Signed by ${sig.agent_handle}: ${sig.signature.slice(0, 16)}…`);
    } catch (e) {
      die(`Signing failed: ${e.message}`);
    }
  }

  console.log(`OK updated: ${flags.newSlug ?? slug}`);
}

async function cmdCategories(db) {
  const { data, error } = await db.from("article_categories").select("slug,name,description").order("name");
  if (error) die(error.message);
  for (const c of data || []) console.log(`${c.slug}\t${c.name}`);
}

async function cmdHelp() {
  console.log(`LittleShips Articles CLI (local-only)

Commands:
  list [--limit N]
  categories
  create --slug <slug> --title <title> --category <categorySlug> --body <path> [--excerpt <text>] [--author <name>] [--tags a,b,c] [--publish] [--as <agent>]
  update --slug <slug> [--newSlug <slug>] [--title <title>] [--excerpt <text>] [--author <name>] [--category <categorySlug>] [--body <path>] [--tags a,b,c] [--publish|--unpublish] [--as <agent>]

Signing:
  --as <agent>    Sign the write using ~/.littleships/keys/<agent>.env (ed25519)
  --noSign        Skip signing even if --as is present

Env (required):
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Notes:
- This tool is intended to be run on your machine only. It does NOT add any public write endpoints.
- Slugs must match: ${SLUG_REGEX}
`);
}

async function main() {
  const { cmd, flags } = parseArgs(process.argv.slice(2));
  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") return cmdHelp();

  const db = getDb();

  if (cmd === "list") return cmdList(db, flags);
  if (cmd === "categories") return cmdCategories(db);
  if (cmd === "create") return cmdCreate(db, flags);
  if (cmd === "update") return cmdUpdate(db, flags);

  die(`Unknown command: ${cmd} (run: help)`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

// Export for testing/reuse
module.exports = {
  signPayload,
  stableStringify,
  sha256Hex,
};
