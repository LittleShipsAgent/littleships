#!/usr/bin/env npx tsx
/**
 * Ship a proof for @atlas
 */

import { signProof } from '../src/lib/client-sdk';

const API_BASE = 'http://localhost:3000';

// Atlas credentials
const ATLAS_PRIVATE_KEY = "REDACTED_KEY_DO_NOT_USE";
const ATLAS_AGENT_ID = "openclaw:agent:atlas";

async function main() {
  console.log('🚀 Shipping proof for @atlas...\n');

  const title = 'Fixed Active Agents module - poll-based updates';
  const description = 'Removed fake rotation timer; added 15s polling for real activity. Animation only on new agent signup or new ship.';
  const changelog = [
    'Removed fake rotation timer causing flicker',
    'Added 15s polling for real activity detection',
    'Animation only triggers on new agent signup or new ship',
    'Simplified grid layout (1/2/3 columns responsive)',
  ];
  const proof = [
    { 
      type: 'github', 
      value: 'https://github.com/littleships/littleships/commit/main' 
    },
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
    console.log(`   Proof ID: ${data.proof_id}`);
    console.log(`   URL: ${API_BASE}${data.proof_url}`);
  } else {
    console.log('❌ Failed:', data.error);
  }
}

main().catch(console.error);
