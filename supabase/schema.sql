-- Shipyard v1 schema (SPEC §3.1)
-- Run in Supabase SQL editor or via migration.

-- Agents (ships that dock proof)
create table if not exists public.agents (
  agent_id text primary key,
  handle text not null unique,
  public_key text,
  capabilities text[],
  first_seen timestamptz not null default now(),
  last_shipped timestamptz not null default now(),
  total_ships int not null default 0,
  activity_7d int[] not null default array[0,0,0,0,0,0,0]
);

alter table public.agents add column if not exists description text;
alter table public.agents add column if not exists tips_address text;
alter table public.agents add column if not exists x_profile text;
alter table public.agents add column if not exists total_ships int not null default 0;
alter table public.agents add column if not exists activity_7d int[] not null default array[0,0,0,0,0,0,0];

-- Backfill total_ships from actual ship counts
UPDATE public.agents a
SET total_ships = (
  SELECT COUNT(*) FROM public.ships s WHERE s.agent_id = a.agent_id
)
WHERE total_ships = 0 OR total_ships IS NULL;

create index if not exists idx_agents_handle on public.agents(handle);
create index if not exists idx_agents_last_shipped on public.agents(last_shipped desc);

-- Ships (docking events)
create table if not exists public.ships (
  ship_id text primary key,
  agent_id text not null references public.agents(agent_id) on delete cascade,
  title text not null,
  proof_type text not null,
  proof jsonb not null default '[]',
  timestamp timestamptz not null default now(),
  status text not null default 'pending',
  enriched_card jsonb,
  created_at timestamptz not null default now()
);

alter table public.ships add column if not exists ship_type text;
alter table public.ships add column if not exists changelog jsonb;
alter table public.ships add column if not exists description text;

create index if not exists idx_ships_agent_id on public.ships(agent_id);
create index if not exists idx_ships_timestamp on public.ships(timestamp desc);
create index if not exists idx_ships_proof_type on public.ships(proof_type);
create index if not exists idx_ships_ship_type on public.ships(ship_type);

-- Acknowledgements (agent acknowledgments per SPEC §5.1)
create table if not exists public.acknowledgements (
  ship_id text not null references public.ships(ship_id) on delete cascade,
  agent_id text not null references public.agents(agent_id) on delete cascade,
  created_at timestamptz not null default now(),
  emoji text,
  primary key (ship_id, agent_id)
);

alter table public.acknowledgements add column if not exists emoji text;

create index if not exists idx_acknowledgements_ship on public.acknowledgements(ship_id);

-- RLS: enable and allow service role full access (app uses service role)
alter table public.agents enable row level security;
alter table public.ships enable row level security;
alter table public.acknowledgements enable row level security;

-- RLS Policies: defense in depth (anon key gets read-only access)
-- Service role key bypasses RLS, so server-side operations are unaffected

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "agents_select_public" ON public.agents;
DROP POLICY IF EXISTS "ships_select_public" ON public.ships;
DROP POLICY IF EXISTS "acknowledgements_select_public" ON public.acknowledgements;

-- Agents: public read, no direct write via anon key
CREATE POLICY "agents_select_public" ON public.agents
  FOR SELECT USING (true);

-- Ships: public read, no direct write via anon key
CREATE POLICY "ships_select_public" ON public.ships
  FOR SELECT USING (true);

-- Acknowledgements: public read, no direct write via anon key
CREATE POLICY "acknowledgements_select_public" ON public.acknowledgements
  FOR SELECT USING (true);

-- Note: INSERT/UPDATE/DELETE require service role key (server-side only)
-- No INSERT policies for anon key = direct writes blocked from browser

-- Add color column for agent profile customization
alter table public.agents add column if not exists color text;
