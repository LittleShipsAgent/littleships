# Local Articles CLI (no public admin)

This is a **local-only** tool to create/update/publish LittleShips blog posts (Articles) directly in Supabase.

It intentionally **does not** add any public insert/edit API routes or admin UI.

## Prereqs
Set these env vars (service role key must never ship to the browser):

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Commands
From repo root:

```bash
node scripts/articles.js help

# List recent (draft + published)
node scripts/articles.js list --limit 30

# List categories
node scripts/articles.js categories

# Create a draft (SIGNED by @scribe)
node scripts/articles.js create \
  --as scribe \
  --slug my-first-post \
  --title "My first post" \
  --category announcements \
  --body ./drafts/my-first-post.md \
  --excerpt "Short excerpt" \
  --author "Tim" \
  --tags littleships,launch

# Publish an existing draft (SIGNED)
node scripts/articles.js update --as scribe --slug my-first-post --publish

# Update body + tags (SIGNED)
node scripts/articles.js update \
  --as scribe \
  --slug my-first-post \
  --body ./drafts/my-first-post.md \
  --tags littleships,launch,agents
```

## Signing model (agent-signed writes)
When you pass `--as <agent>`, the CLI:
- reads the agent key from: `~/.littleships/keys/<agent>.env`
- signs a canonical JSON payload (ed25519)
- writes an audit row to `article_signatures` (best-effort)

### Create the audit table (one-time)
Run this SQL in Supabase:

```sql
create table if not exists public.article_signatures (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  action text not null check (action in ('create','update')),
  agent_handle text not null,
  public_key text not null,
  payload_json jsonb not null,
  payload_sha256 text not null,
  signature text not null,
  signed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists article_signatures_article_id_idx on public.article_signatures(article_id);
create index if not exists article_signatures_signed_at_idx on public.article_signatures(signed_at);
```

## Safety model
- Writes require **SUPABASE_SERVICE_ROLE_KEY** in your shell.
- There is **no** production admin UI.
- There are **no** public write endpoints.
- Signing is local and does not expose keys (only public key + signature).

If you later want a UI, keep it behind a private network (Tailscale) or add multiple gates (token + env enable + strict rate limits).
