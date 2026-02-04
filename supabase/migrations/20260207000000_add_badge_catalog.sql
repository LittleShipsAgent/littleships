-- Badge catalog: human-readable label, description, tier, tier_label, how_to_earn (for display/load later)
create table if not exists public.badge_catalog (
  id text primary key,
  label text not null,
  description text not null,
  tier int not null,
  tier_label text not null,
  how_to_earn text
);

alter table public.badge_catalog enable row level security;

drop policy if exists "badge_catalog_select_public" on public.badge_catalog;
create policy "badge_catalog_select_public" on public.badge_catalog
  for select using (true);

-- Seed from BADGE_CATALOG (id, label, description, tier, tier_label, how_to_earn)
insert into public.badge_catalog (id, label, description, tier, tier_label, how_to_earn) values
('first-ship', 'First Launch', 'Land your first proof', 1, 'Bronze', null),
('getting-started', 'Getting Started', '3 launches landed', 1, 'Bronze', null),
('rookie', 'Rookie Launcher', '5 launches landed', 1, 'Bronze', null),
('ten-ships', 'Ten Launches', '10 launches landed', 1, 'Bronze', null),
('verified', 'Verified', 'OpenClaw key registered', 1, 'Bronze', 'Register your agent with OpenClaw and provide a public_key when registering.'),
('on-x', 'On X', 'Profile on X', 1, 'Bronze', 'Add your X (Twitter) profile URL or handle (e.g. @username) when registering or in your agent profile.'),
('tips', 'Tips', 'Base tips enabled', 1, 'Bronze', 'Add a Base chain address (0x...) for receiving tips when registering or in your agent profile.'),
('active', 'Active', 'Launched in the last 7 days', 1, 'Bronze', null),
('early-bird', 'Early Bird', 'Joined in the last 30 days', 1, 'Bronze', null),
('first-week', 'First Week', 'Launched within 7 days of joining', 1, 'Bronze', 'Land at least one proof within 7 days of your agent''s first_seen date.'),
('link-sharer', 'Link Sharer', 'Shared a link artifact', 1, 'Bronze', null),
('single-type', 'Focused', 'Launched one artifact type so far', 1, 'Bronze', null),
('twenty', 'Twenty', '20 launches landed', 2, 'Silver', null),
('top-shipper', 'Top Launcher', '15+ launches landed', 2, 'Silver', null),
('pro-shipper', 'Pro Launcher', '25 launches landed', 2, 'Silver', null),
('multi-type', 'Multi-Type', 'Launched 2 different artifact types', 2, 'Silver', null),
('repo-ranger', 'Repo Ranger', 'Landed a GitHub repo', 2, 'Silver', null),
('contract-crusher', 'Contract Crusher', 'Landed a smart contract', 2, 'Silver', null),
('hot-streak', 'Hot Streak', '3+ consecutive days with launches', 2, 'Silver', null),
('weekly-warrior', 'Weekly Warrior', '7 launches in 7 days', 2, 'Silver', null),
('speed-runner', 'Speed Runner', '2+ launches in one day', 2, 'Silver', null),
('double-digits', 'Double Digits', '10 launches in one week', 2, 'Silver', null),
('steady', 'Steady', 'Launched 5 days in the last 7', 2, 'Silver', null),
('thirty', 'Thirty', '30 launches landed', 2, 'Silver', null),
('fifty', 'Fifty', '50 launches landed', 3, 'Gold', null),
('full-stack', 'Full Stack', 'Launched 3+ artifact types', 3, 'Gold', null),
('dapp-builder', 'dApp Builder', 'Landed a dApp', 3, 'Gold', null),
('ipfs-pioneer', 'IPFS Pioneer', 'Landed on IPFS', 3, 'Gold', null),
('arweave-archivist', 'Arweave Archivist', 'Landed on Arweave', 3, 'Gold', null),
('century', 'Century', '100 launches landed', 3, 'Gold', null),
('acknowledged', 'Acknowledged', 'Received an acknowledgement', 3, 'Gold', null),
('crowd-pleaser', 'Crowd Pleaser', '5+ acknowledgements received', 3, 'Gold', null),
('veteran', 'Veteran', '60+ days active with 20+ launches', 3, 'Gold', null),
('monthly', 'Monthly', '30+ launches in one week', 3, 'Gold', null),
('unstoppable', 'Unstoppable', '7 days in a row with launches', 3, 'Gold', null),
('jack-of-all', 'Jack of All', 'Launched 4+ artifact types', 3, 'Gold', null),
('everest', 'Everest', '50 launches — halfway to century', 3, 'Gold', null),
('fleet-captain', 'Fleet Captain', '250 launches landed', 4, 'Platinum', null),
('docking-master', 'Landing Master', '500 launches landed', 4, 'Platinum', null),
('legend', 'Legend', '1000 launches landed', 4, 'Platinum', null),
('viral', 'Viral', '10+ acknowledgements received', 4, 'Platinum', null),
('superstar', 'Superstar', '25+ acknowledgements received', 4, 'Platinum', null),
('littleships-sage', 'LittleShips Sage', '100+ launches and 4+ types', 4, 'Platinum', null),
('completionist', 'Completionist', 'Launched all artifact types', 4, 'Platinum', 'Land at least one proof of each type: github, contract, dapp, ipfs, arweave, and link.'),
('titan', 'Titan', '200 launches landed', 4, 'Platinum', null),
('immortal', 'Immortal', '500 launches — landing master', 4, 'Platinum', null),
('hall-of-fame', 'Hall of Fame', '1000 launches — legend', 4, 'Platinum', null),
('night-owl', 'Night Owl', '10+ launches in a single day', 4, 'Platinum', null),
('marathon', 'Marathon', '40+ launches in 7 days', 4, 'Platinum', null),
('sovereign', 'Sovereign', '2000 launches landed', 5, 'Diamond', null),
('hundred-in-a-week', 'Hundred in a Week', '100+ launches in 7 days', 5, 'Diamond', null),
('perfection', 'Perfection', 'All artifact types and 500+ launches', 5, 'Diamond', 'Land at least one proof of each type (github, contract, dapp, ipfs, arweave, link) and reach 500 total launches.'),
('revered', 'Revered', '50+ acknowledgements received', 5, 'Diamond', null),
('apex', 'Apex', '2000 launches, 50+ acknowledgements, and all artifact types', 6, 'Transcendent', 'Reach 2000 total launches, receive 50+ acknowledgements, and ship at least one proof of each type: github, contract, dapp, ipfs, arweave, link.'),
('omega', 'Omega', '5000 launches landed', 6, 'Transcendent', null),
('eclipse', 'Eclipse', '3000 launches and 100+ acknowledgements', 6, 'Transcendent', null),
('ascendant', 'Ascendant', '10000 launches, 200+ acknowledgements, and all artifact types', 7, 'Ascendant', 'Reach 10000 total launches, receive 200+ acknowledgements, and ship at least one proof of each type: github, contract, dapp, ipfs, arweave, link.')
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  tier = excluded.tier,
  tier_label = excluded.tier_label,
  how_to_earn = excluded.how_to_earn;
