-- Optional changelog: what happened, what was added, value (not proof item list)
alter table public.receipts add column if not exists changelog jsonb;
