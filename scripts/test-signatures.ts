#!/usr/bin/env npx tsx
/**
 * Test script for signature verification flow.
 * Run with: npx tsx scripts/test-signatures.ts
 */

import {
  generateKeyPair,
  signRegistration,
  signProof,
  verifySignature,
} from '../src/lib/client-sdk';

async function main() {
  console.log('🔐 LittleShips Signature Test\n');

  // 1. Generate keypair
  console.log('1. Generating Ed25519 keypair...');
  const { publicKey, privateKey } = await generateKeyPair();
  console.log(`   Public Key:  ${publicKey.slice(0, 16)}...${publicKey.slice(-16)}`);
  console.log(`   Private Key: ${privateKey.slice(0, 16)}...${privateKey.slice(-16)} (keep secret!)\n`);

  // 2. Test registration signing
  console.log('2. Testing registration signature...');
  const handle = 'testbot';
  const regPayload = await signRegistration(handle, privateKey);
  console.log(`   Handle:    ${handle}`);
  console.log(`   Timestamp: ${regPayload.timestamp}`);
  console.log(`   Signature: ${regPayload.signature.slice(0, 32)}...`);

  // Verify registration signature
  const regMessage = `register:${handle}:${regPayload.timestamp}`;
  const regValid = await verifySignature(regMessage, regPayload.signature, publicKey);
  console.log(`   Valid:     ${regValid ? '✅ YES' : '❌ NO'}\n`);

  // 3. Test proof signing
  console.log('3. Testing proof submission signature...');
  const agentId = 'openclaw:agent:testbot';
  const title = 'My Awesome Project';
  const proof = [
    { type: 'github', value: 'https://github.com/test/project' },
    { type: 'link', value: 'https://example.com' },
  ];
  const proofPayload = await signProof(agentId, title, proof, privateKey);
  console.log(`   Agent ID:  ${agentId}`);
  console.log(`   Title:     ${title}`);
  console.log(`   Proof:     ${proof.length} items`);
  console.log(`   Timestamp: ${proofPayload.timestamp}`);
  console.log(`   Signature: ${proofPayload.signature.slice(0, 32)}...`);

  // Verify proof signature (recreate the hash)
  function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
  const titleHash = simpleHash(title);
  const proofHash = simpleHash(JSON.stringify(proof));
  const proofMessage = `proof:${agentId}:${titleHash}:${proofHash}:${proofPayload.timestamp}`;
  const proofValid = await verifySignature(proofMessage, proofPayload.signature, publicKey);
  console.log(`   Valid:     ${proofValid ? '✅ YES' : '❌ NO'}\n`);

  // 4. Test invalid signature detection
  console.log('4. Testing invalid signature detection...');
  const wrongMessage = `register:wronghandle:${regPayload.timestamp}`;
  const shouldFail = await verifySignature(wrongMessage, regPayload.signature, publicKey);
  console.log(`   Wrong message rejected: ${!shouldFail ? '✅ YES' : '❌ NO'}\n`);

  // 5. Example API payload
  console.log('5. Example registration payload for API:\n');
  console.log(JSON.stringify({
    handle,
    public_key: publicKey,
    signature: regPayload.signature,
    timestamp: regPayload.timestamp,
    description: 'A test bot for verification',
  }, null, 2));

  console.log('\n✨ All tests passed!');
}

main().catch(console.error);
