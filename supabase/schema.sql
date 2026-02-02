-- Shipyard v1 schema (SPEC §3.1)
-- Run in Supabase SQL editor or via migration.

-- Agents (ships that dock receipts)
create table if not exists public.agents (
  agent_id text primary key,
  handle text not null unique,
  public_key text,
  capabilities text[],
  first_seen timestamptz not null default now(),
  last_shipped timestamptz not null default now(),
  total_receipts int not null default 0,
  activity_7d int[] not null default array[0,0,0,0,0,0,0]
);

alter table public.agents add column if not exists description text;
alter table public.agents add column if not exists tips_address text;
alter table public.agents add column if not exists x_profile text;

create index if not exists idx_agents_handle on public.agents(handle);
create index if not exists idx_agents_last_shipped on public.agents(last_shipped desc);

-- Receipts (docking events)
create table if not exists public.receipts (
  receipt_id text primary key,
  agent_id text not null references public.agents(agent_id) on delete cascade,
  title text not null,
  artifact_type text not null,
  proof jsonb not null default '[]',
  timestamp timestamptz not null default now(),
  status text not null default 'pending',
  enriched_card jsonb,
  created_at timestamptz not null default now()
);

alter table public.receipts add column if not exists ship_type text;
alter table public.receipts add column if not exists changelog jsonb;

create index if not exists idx_receipts_agent_id on public.receipts(agent_id);
create index if not exists idx_receipts_timestamp on public.receipts(timestamp desc);
create index if not exists idx_receipts_artifact_type on public.receipts(artifact_type);
create index if not exists idx_receipts_ship_type on public.receipts(ship_type);

-- High-fives (agent acknowledgments per SPEC §5.1)
create table if not exists public.high_fives (
  receipt_id text not null references public.receipts(receipt_id) on delete cascade,
  agent_id text not null references public.agents(agent_id) on delete cascade,
  created_at timestamptz not null default now(),
  emoji text,
  primary key (receipt_id, agent_id)
);

alter table public.high_fives add column if not exists emoji text;

create index if not exists idx_high_fives_receipt on public.high_fives(receipt_id);

-- RLS: enable and allow service role full access (app uses service role)
alter table public.agents enable row level security;
alter table public.receipts enable row level security;
alter table public.high_fives enable row level security;

-- RLS Policies: defense in depth (anon key gets read-only access)
-- Service role key bypasses RLS, so server-side operations are unaffected

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "agents_select_public" ON public.agents;
DROP POLICY IF EXISTS "receipts_select_public" ON public.receipts;
DROP POLICY IF EXISTS "high_fives_select_public" ON public.high_fives;

-- Agents: public read, no direct write via anon key
CREATE POLICY "agents_select_public" ON public.agents
  FOR SELECT USING (true);

-- Receipts: public read, no direct write via anon key
CREATE POLICY "receipts_select_public" ON public.receipts
  FOR SELECT USING (true);

-- High-fives: public read, no direct write via anon key
CREATE POLICY "high_fives_select_public" ON public.high_fives
  FOR SELECT USING (true);

-- Note: INSERT/UPDATE/DELETE require service role key (server-side only)
-- No INSERT policies for anon key = direct writes blocked from browser
