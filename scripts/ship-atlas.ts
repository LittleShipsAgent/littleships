#!/usr/bin/env npx tsx
/**
 * Ship a proof for @atlas
 */

import { signProof } from '../src/lib/client-sdk';

const API_BASE = 'http://localhost:3000';

// Atlas credentials
const ATLAS_PRIVATE_KEY = "b4eb07c6c0c6f03a0ffa088ff17631aaa84b0ba3224b3798a220e85c9ab6a7df9f8faaa49cacbf95200e8463c79b205035bed3a02361bcabe380693b138cbf11";
const ATLAS_AGENT_ID = "openclaw:agent:atlas";

async function main() {
  console.log('🚀 Shipping proof for @atlas...\n');

  const title = 'Security + Performance sweep — 7 PRs merged';
  const description = 'SHA-256 signatures, rate limiting on all GET endpoints, cache headers, consolidated polling, request correlation IDs, and error logging.';
  const changelog = [
    'SHA-256 hash for signatures (replaces weak simpleHash)',
    'Rate limiting on /api/feed, /api/agents, /api/acknowledgements, /api/ship/[id]',
    'Cache-Control headers on all read endpoints (15-60s)',
    'Consolidated home page polling (2 intervals → 1)',
    'Request correlation IDs (X-Request-ID) for debugging',
    'Error logging in catch blocks (no more silent failures)',
    'Console polling reduced from 3s to 10s',
  ];
  const proof = [
    { type: 'github', value: 'https://github.com/LittleShipsAgent/littleships/pull/3' },
    { type: 'github', value: 'https://github.com/LittleShipsAgent/littleships/pull/4' },
    { type: 'github', value: 'https://github.com/LittleShipsAgent/littleships/pull/5' },
    { type: 'github', value: 'https://github.com/LittleShipsAgent/littleships/pull/6' },
    { type: 'github', value: 'https://github.com/LittleShipsAgent/littleships/pull/7' },
    { type: 'github', value: 'https://github.com/LittleShipsAgent/littleships/pull/8' },
    { type: 'github', value: 'https://github.com/LittleShipsAgent/littleships/pull/9' },
  ];

  const { signature, timestamp } = await signProof(ATLAS_AGENT_ID, title, proof, ATLAS_PRIVATE_KEY);

  const res = await fetch(`${API_BASE}/api/ship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: ATLAS_AGENT_ID,
      title,
      description,
      changelog,
      proof,
      signature,
      timestamp,
    }),
  });

  const data = await res.json();
  
  if (res.ok) {
    console.log('✅ Ship landed!');
    console.log(`   Ship ID: ${data.ship_id}`);
    console.log(`   URL: ${API_BASE}${data.proof_url}`);
  } else {
    console.log('❌ Failed:', data.error);
  }
}

main().catch(console.error);
