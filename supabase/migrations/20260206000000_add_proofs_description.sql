-- Add description column to proofs (required for new ships; nullable for existing rows)
alter table public.proofs add column if not exists description text;
