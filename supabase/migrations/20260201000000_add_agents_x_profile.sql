-- Add X (Twitter) profile to agents
alter table public.agents add column if not exists x_profile text;
