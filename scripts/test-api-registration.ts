#!/usr/bin/env npx tsx
/**
 * Test actual API registration with signature verification.
 * Run with: npx tsx scripts/test-api-registration.ts
 */

import { generateKeyPair, signRegistration } from '../src/lib/client-sdk';

const API_BASE = 'http://localhost:3000';

async function main() {
  console.log('🚀 Testing API Registration with Signatures\n');

  // Generate keypair
  console.log('1. Generating keypair...');
  const { publicKey, privateKey } = await generateKeyPair();
  console.log(`   Public Key: ${publicKey.slice(0, 32)}...\n`);

  // Create unique handle
  const handle = `testbot${Date.now() % 100000}`;
  
  // Sign registration
  console.log('2. Signing registration...');
  const { signature, timestamp } = await signRegistration(handle, privateKey);
  console.log(`   Handle: ${handle}`);
  console.log(`   Timestamp: ${timestamp}\n`);

  // Test 1: Valid registration
  console.log('3. Testing VALID registration...');
  const validPayload = {
    handle,
    public_key: publicKey,
    signature,
    timestamp,
    description: 'Test bot for signature verification',
  };

  const validRes = await fetch(`${API_BASE}/api/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload),
  });
  const validData = await validRes.json();
  console.log(`   Status: ${validRes.status}`);
  console.log(`   Response: ${JSON.stringify(validData, null, 2)}`);
  console.log(`   Result: ${validRes.ok ? '✅ PASSED' : '❌ FAILED'}\n`);

  // Test 2: Invalid signature (wrong handle)
  console.log('4. Testing INVALID signature (wrong handle in payload)...');
  const invalidPayload = {
    handle: 'wronghandle',
    public_key: publicKey,
    signature, // signature was for different handle
    timestamp,
    description: 'Should fail',
  };

  const invalidRes = await fetch(`${API_BASE}/api/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidPayload),
  });
  const invalidData = await invalidRes.json();
  console.log(`   Status: ${invalidRes.status}`);
  console.log(`   Response: ${JSON.stringify(invalidData)}`);
  console.log(`   Result: ${invalidRes.status === 401 ? '✅ PASSED (correctly rejected)' : '❌ FAILED (should have been rejected)'}\n`);

  // Test 3: Expired timestamp
  console.log('5. Testing EXPIRED timestamp (6 minutes old)...');
  const oldTimestamp = Date.now() - 6 * 60 * 1000; // 6 minutes ago
  const oldHandle = `oldbot${Date.now() % 100000}`;
  const { publicKey: pk2, privateKey: sk2 } = await generateKeyPair();
  const { signature: oldSig } = await signRegistration(oldHandle, sk2);
  
  const expiredPayload = {
    handle: oldHandle,
    public_key: pk2,
    signature: oldSig,
    timestamp: oldTimestamp, // Using old timestamp but signature was made with current time
    description: 'Should fail - expired',
  };

  const expiredRes = await fetch(`${API_BASE}/api/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expiredPayload),
  });
  const expiredData = await expiredRes.json();
  console.log(`   Status: ${expiredRes.status}`);
  console.log(`   Response: ${JSON.stringify(expiredData)}`);
  console.log(`   Result: ${expiredRes.status === 401 ? '✅ PASSED (correctly rejected)' : '❌ FAILED (should have been rejected)'}\n`);

  // Summary
  console.log('📊 Summary:');
  console.log(`   Valid registration: ${validRes.ok ? '✅' : '❌'}`);
  console.log(`   Invalid signature rejected: ${invalidRes.status === 401 ? '✅' : '❌'}`);
  console.log(`   Expired timestamp rejected: ${expiredRes.status === 401 ? '✅' : '❌'}`);
}

main().catch(console.error);
