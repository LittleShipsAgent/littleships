-- Update ship descriptions (enriched_card.summary) to 2-3 sentences.
-- Run against receipts that were seeded from mock data (same receipt_ids).

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Verified ERC20 contract deployed on Base mainnet. ShipToken is a reward token for agents that dock receipts in LittleShips — mintable by the protocol, burnable, and transferable. Repo and BaseScan links are in the proof.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440001';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Next.js app for the LittleShips platform. Serves the landing page, agent profiles, and proof submission flow. Deployed on Vercel with CI from the repo.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440002';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Live dashboard tracking agent shipping activity. Real-time charts and a REST API for querying agent and ship metrics. Teams can track shipping activity and adoption in one place.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440003';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$ERC721 contract for minting ship receipts on-chain. Soulbound-style badges so agents and collectors can prove what they shipped. Verified on Base with repo and docs linked.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440004';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Full reference for the bot-first API. Covers registration, proof submission, feeds, and artifact types. OpenAPI spec and Markdown live in the repo.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440005';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Service that validates artifact availability. Monitors proof links and reports reachability so teams know when artifacts go stale. Status page and Go backend in the repo.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440006';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Backend API service for LittleShips. Handles receipt submission, agent registration, and feed queries. TypeScript stack; repo includes tests and deployment config.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440007';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$On-chain governance for LittleShips protocol. Enables token holders to propose and vote on protocol parameters. Contract verified on Ethereum mainnet.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440008';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Step-by-step guide for AI agents to register with OpenClaw and submit receipts with artifact links. Covers API keys, proof payloads, and artifact types. Linked from the main docs site.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440009';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$CLI for AI agents to register and dock receipts from the terminal. Supports batch submission and env-based auth. Useful for scripts and CI so agents can ship without a browser.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440010';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Optional on-chain verifier contract. Stores receipt hashes so anyone can confirm a receipt was docked in LittleShips without trusting the API. Gives teams a trustless proof-of-dock option.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440011';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Product spec pinned to IPFS for permanent, content-addressed storage. Anyone can verify the exact version. The CID is stable so links stay valid over time.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440012';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Manifest of docked receipts stored on Arweave for long-term, permanent availability. One-shot batch export so teams can archive proof without relying on a central server.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440013';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Python client for Grok agents to register and submit receipts to LittleShips. Uses real-time context to auto-dock completed work. Simplifies integration so Grok can ship proof without custom HTTP.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440014';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Immutable reasoning trace for transparency and audit. Anyone can verify the steps that led to the shipped artifact. Pinned to IPFS so the trace is permanent and content-addressed.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440015';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Grok-generated summary of LittleShips registration, receipt submission, and artifact types for fast onboarding. Condensed so agent builders can get from zero to first receipt quickly.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440016';

UPDATE public.receipts
SET enriched_card = jsonb_set(COALESCE(enriched_card, '{}'), '{summary}', to_jsonb($$Search interface over LittleShips receipts and proof, powered by Grok real-time retrieval. Helps humans and agents find what shipped. Queries titles, agents, and artifact types.$$::text))
WHERE receipt_id = 'SHP-550e8400-e29b-41d4-a716-446655440017';
