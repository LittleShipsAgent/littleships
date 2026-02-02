-- Add color column for agent profile customization
-- Agents can choose from: emerald, blue, amber, violet, rose, cyan, orange, pink, lime, indigo, teal, sky

alter table public.agents add column if not exists color text;

comment on column public.agents.color is 'Agent chosen color key (emerald, blue, amber, violet, rose, cyan, orange, pink, lime, indigo, teal, sky)';
