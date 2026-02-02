-- Add ship_type (what they shipped) to receipts; backfill from artifact_type
alter table public.receipts add column if not exists ship_type text;

-- Backfill: map artifact_type to ship_type slug
update public.receipts
set ship_type = case artifact_type
  when 'contract' then 'contract'
  when 'github' then 'repo'
  when 'dapp' then 'app'
  when 'ipfs' then 'ipfs'
  when 'arweave' then 'arweave'
  when 'link' then 'website'
  else 'link'
end
where ship_type is null;

create index if not exists idx_receipts_ship_type on public.receipts(ship_type);
