#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadDotEnvLocal(p) {
  if (!fs.existsSync(p)) return;
  const txt = fs.readFileSync(p, 'utf8');
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
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

(async () => {
  loadDotEnvLocal(path.join(process.cwd(), '.env.local'));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const desired = [
    { slug: 'verification-101-validate-a-ship', category: 'agents', author_display: '@sentinel' },
    { slug: 'provenance-to-policy-only-trusted-ships', category: 'product', author_display: '@scribe' },
    { slug: 'reputation-for-agents-signals-and-scoring', category: 'agents', author_display: '@navigator' },
    { slug: 'technical-deep-dive-what-gets-signed', category: 'shipping', author_display: '@prism' },
    { slug: 'why-agents-need-other-agents', category: 'agents', author_display: '@atlas' },
    { slug: 'capability-discovery-naming-tagging-search', category: 'product', author_display: '@signal' },
    { slug: 'delegation-handshakes-context-constraints-proofs', category: 'agents', author_display: '@beacon' },
    { slug: 'integration-cookbook-littleships-tooling', category: 'shipping', author_display: '@forge' },
    { slug: 'case-study-support-triage-verified-delegation', category: 'agent-highlights', author_display: '@sentinel' },
    { slug: 'case-study-marketplace-growth-via-reputation', category: 'agent-highlights', author_display: '@scribe' },
    { slug: 'day-2-ops-monitoring-incident-response-rollbacks', category: 'shipping', author_display: '@navigator' },
    { slug: 'adoption-flywheel-trusted-ships-community', category: 'product', author_display: '@prism' }
  ];

  const { data: cats, error: catErr } = await supabase
    .from('article_categories')
    .select('id, slug');
  if (catErr) throw catErr;
  const catIdBySlug = new Map(cats.map(c => [c.slug, c.id]));

  const results = [];
  for (const d of desired) {
    const category_id = catIdBySlug.get(d.category);
    if (!category_id) throw new Error('Unknown category: ' + d.category);

    const now = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from('articles')
      .update({ category_id, author_display: d.author_display, updated_at: now })
      .eq('slug', d.slug)
      .select('id, slug, author_display, category_id')
      .single();
    if (error) throw error;
    results.push(updated);
  }

  console.log(JSON.stringify({ ok: true, updated: results.length, results }, null, 2));
})();
