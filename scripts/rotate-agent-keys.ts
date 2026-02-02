#!/usr/bin/env npx tsx
/**
 * Generate and update real Ed25519 keys for existing agents.
 * 
 * Run with: npx tsx scripts/rotate-agent-keys.ts
 * 
 * ⚠️  SAVE THE OUTPUT! Private keys are shown once and cannot be recovered.
 */

import { createClient } from '@supabase/supabase-js';
import { generateKeyPair } from '../src/lib/client-sdk';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Run with: source .env.local && npx tsx scripts/rotate-agent-keys.ts');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('🔐 Rotating Agent Keys to Real Ed25519\n');
  console.log('=' .repeat(70));
  console.log('⚠️  SAVE THIS OUTPUT! Private keys are shown ONCE and cannot be recovered.');
  console.log('=' .repeat(70));
  console.log();

  // Fetch all agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('agent_id, handle, public_key')
    .order('handle');

  if (error) {
    console.error('❌ Failed to fetch agents:', error.message);
    process.exit(1);
  }

  if (!agents || agents.length === 0) {
    console.log('No agents found.');
    return;
  }

  console.log(`Found ${agents.length} agents.\n`);

  const results: Array<{
    handle: string;
    agent_id: string;
    publicKey: string;
    privateKey: string;
  }> = [];

  for (const agent of agents) {
    // Check if already has a real key (64 hex chars)
    const hasRealKey = /^[a-f0-9]{64}$/i.test(agent.public_key || '');
    
    if (hasRealKey) {
      console.log(`⏭️  ${agent.handle} - already has real key, skipping`);
      continue;
    }

    console.log(`🔄 ${agent.handle} - generating new keypair...`);
    
    const { publicKey, privateKey } = await generateKeyPair();

    // Update in database
    const { error: updateError } = await supabase
      .from('agents')
      .update({ public_key: publicKey })
      .eq('agent_id', agent.agent_id);

    if (updateError) {
      console.error(`   ❌ Failed to update: ${updateError.message}`);
      continue;
    }

    console.log(`   ✅ Updated with new public key`);
    
    results.push({
      handle: agent.handle,
      agent_id: agent.agent_id,
      publicKey,
      privateKey,
    });
  }

  if (results.length === 0) {
    console.log('\n✅ All agents already have real keys.');
    return;
  }

  // Output the keys
  console.log('\n');
  console.log('=' .repeat(70));
  console.log('🔑 NEW AGENT KEYS - SAVE THESE SECURELY!');
  console.log('=' .repeat(70));
  console.log();

  for (const r of results) {
    console.log(`### ${r.handle}`);
    console.log(`Agent ID:    ${r.agent_id}`);
    console.log(`Public Key:  ${r.publicKey}`);
    console.log(`Private Key: ${r.privateKey}`);
    console.log();
  }

  // Also output as JSON for easy storage
  console.log('=' .repeat(70));
  console.log('📋 JSON FORMAT (for .env or secrets manager):');
  console.log('=' .repeat(70));
  console.log();
  
  const envFormat = results.map(r => {
    const envName = r.handle.replace('@', '').toUpperCase();
    return `${envName}_PRIVATE_KEY="${r.privateKey}"`;
  }).join('\n');
  
  console.log(envFormat);
  console.log();

  console.log('=' .repeat(70));
  console.log(`✅ Updated ${results.length} agents with new Ed25519 keys.`);
  console.log('⚠️  Store the private keys securely! They cannot be recovered.');
  console.log('=' .repeat(70));
}

main().catch(console.error);
