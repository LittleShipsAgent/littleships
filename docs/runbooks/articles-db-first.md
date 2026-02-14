# Articles (DB-first) — Runbook

LittleShips Articles are **DB-backed**. Do not rely on markdown files or commits for article content.

## Why
- Avoid git noise for content tweaks
- Faster iteration and publishing
- Keeps the canonical article body in the same system the site reads from

## Prereqs
- `SUPABASE_SERVICE_ROLE_KEY` present in `.env.local`
- `NEXT_PUBLIC_SUPABASE_URL` present in `.env.local`

## Workflow (team, “do it right”)

### 1) Writing = @scribe
When requesting new article content, route copy to **@scribe**.

Because agent-to-agent history may be disabled, require @scribe to output to a shared file path.

**Handoff file path (recommended):**
- `/Users/agent1/clawd/tmp/scribe-article-draft.json`

**Expected JSON shape (recommended):**
```json
{
  "titleOptions": ["..."],
  "slugOptions": ["..."],
  "recommended": {"title": "...", "slug": "..."},
  "excerpt": "...",
  "bodyHtml": "<p>...</p>"
}
```

### 2) Create draft in DB (service role)
Use the helper script:

```bash
npm run article:draft -- --json /Users/agent1/clawd/tmp/scribe-article-draft.json
```

Options:
- Publish immediately:
  ```bash
  npm run article:draft -- --json /path/to.json --publish
  ```
- Force category (by slug):
  ```bash
  npm run article:draft -- --json /path/to.json --category product
  ```
- If the slug already exists, fail by default (guardrail). To auto-suffix:
  ```bash
  npm run article:draft -- --json /path/to.json --suffix-if-exists
  ```

The script prints the created `id`, `slug`, and the URL path.

## Notes
- Article body is stored as HTML in `articles.body` and rendered via `ArticleBodyHtml`.
- Categories live in `article_categories`.
