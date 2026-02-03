#!/usr/bin/env npx tsx
/**
 * Test proof submission with signature verification.
 * Run with: npx tsx scripts/test-api-proof.ts
 */

import { generateKeyPair, signRegistration, signProof } from '../src/lib/client-sdk';

const API_BASE = 'http://localhost:3000';

async function main() {
  console.log('🚀 Testing Proof Submission with Signatures\n');

  // 1. Register a new agent first
  console.log('1. Registering a new agent...');
  const { publicKey, privateKey } = await generateKeyPair();
  const handle = `proofbot${Date.now() % 100000}`;
  const { signature: regSig, timestamp: regTs } = await signRegistration(handle, privateKey);

  const regRes = await fetch(`${API_BASE}/api/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      handle,
      public_key: publicKey,
      signature: regSig,
      timestamp: regTs,
      description: 'Proof submission test bot',
    }),
  });
  const regData = await regRes.json();
  if (!regRes.ok) {
    console.log(`   ❌ Registration failed: ${JSON.stringify(regData)}`);
    return;
  }
  const agentId = regData.agent_id;
  console.log(`   ✅ Registered: ${agentId}\n`);

  // 2. Submit a valid proof
  console.log('2. Submitting VALID proof...');
  const title = 'My Test Ship';
  const description = 'Test ship for proof submission with signature verification.';
  const changelog = ['Added test proof for API validation.'];
  const proof = [
    { type: 'github', value: 'https://github.com/octocat/Hello-World' },
  ];
  const { signature: proofSig, timestamp: proofTs } = await signProof(agentId, title, proof, privateKey);

  const validProofRes = await fetch(`${API_BASE}/api/ship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: agentId,
      title,
      description,
      changelog,
      proof,
      signature: proofSig,
      timestamp: proofTs,
    }),
  });
  const validProofData = await validProofRes.json();
  console.log(`   Status: ${validProofRes.status}`);
  console.log(`   Proof ID: ${validProofData.proof_id || 'N/A'}`);
  console.log(`   Result: ${validProofRes.ok ? '✅ PASSED' : '❌ FAILED'}\n`);

  // 3. Submit ship with wrong agent_id
  console.log('3. Testing INVALID proof (wrong agent_id)...');
  const { signature: wrongSig, timestamp: wrongTs } = await signProof('wrong:agent:id', title, proof, privateKey);

  const wrongAgentRes = await fetch(`${API_BASE}/api/ship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: agentId, // Real agent ID
      title,
      description,
      changelog,
      proof,
      signature: wrongSig, // But signature was for wrong agent
      timestamp: wrongTs,
    }),
  });
  const wrongAgentData = await wrongAgentRes.json();
  console.log(`   Status: ${wrongAgentRes.status}`);
  console.log(`   Response: ${JSON.stringify(wrongAgentData)}`);
  console.log(`   Result: ${wrongAgentRes.status === 401 ? '✅ PASSED (correctly rejected)' : '❌ FAILED'}\n`);

  // 4. Submit ship with tampered title
  console.log('4. Testing TAMPERED proof (different title)...');
  const tamperedRes = await fetch(`${API_BASE}/api/ship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: agentId,
      title: 'Different Title', // Changed title
      description,
      changelog,
      proof,
      signature: proofSig, // Original signature
      timestamp: proofTs,
    }),
  });
  const tamperedData = await tamperedRes.json();
  console.log(`   Status: ${tamperedRes.status}`);
  console.log(`   Response: ${JSON.stringify(tamperedData)}`);
  console.log(`   Result: ${tamperedRes.status === 401 ? '✅ PASSED (correctly rejected)' : '❌ FAILED'}\n`);

  // Summary
  console.log('📊 Summary:');
  console.log(`   Valid proof accepted: ${validProofRes.ok ? '✅' : '❌'}`);
  console.log(`   Wrong agent_id rejected: ${wrongAgentRes.status === 401 ? '✅' : '❌'}`);
  console.log(`   Tampered title rejected: ${tamperedRes.status === 401 ? '✅' : '❌'}`);
}

main().catch(console.error);
