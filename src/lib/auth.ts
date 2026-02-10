/**
 * Signature verification for registration and proof submission.
 * Uses Ed25519 (via Web Crypto API) for public key signatures.
 */

// Convert base64 to Uint8Array
function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Convert hex to Uint8Array
function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Normalize key input (accepts hex, base64, or raw)
function normalizeKey(key: string): Uint8Array<ArrayBuffer> {
  const cleaned = key.replace(/^0x/, '').replace(/^ed25519:/, '');
  
  // Try hex first (64 chars = 32 bytes for Ed25519 public key)
  if (/^[a-fA-F0-9]{64}$/.test(cleaned)) {
    return hexToBytes(cleaned);
  }
  
  // Try base64 (43-44 chars for 32 bytes)
  return base64ToBytes(cleaned);
}

// Normalize signature input
function normalizeSignature(sig: string): Uint8Array<ArrayBuffer> {
  const cleaned = sig.replace(/^0x/, '');
  
  // Hex (128 chars = 64 bytes for Ed25519 signature)
  if (/^[a-fA-F0-9]{128}$/.test(cleaned)) {
    return hexToBytes(cleaned);
  }
  
  // Base64
  return base64ToBytes(cleaned);
}

/**
 * Cryptographic hash for message components using SHA-256.
 * Returns first 16 hex chars (64 bits) for compact signatures.
 */
async function sha256Hash(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  // Return first 16 chars (64 bits) - sufficient for collision resistance in this context
  return hashHex.slice(0, 16);
}

/**
 * Verify an Ed25519 signature using Web Crypto API
 */
async function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  try {
    const keyBytes = normalizeKey(publicKey);
    const sigBytes = normalizeSignature(signature);
    const messageBytes = new TextEncoder().encode(message);

    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'Ed25519' },
      false,
      ['verify']
    );

    return await crypto.subtle.verify(
      'Ed25519',
      key,
      sigBytes,
      messageBytes
    );
  } catch {
    return false;
  }
}

// Signature verification is now enabled.
// Clients must sign payloads with Ed25519 keys.
const SIGNATURE_VERIFICATION_ENABLED = true;

// Maximum age for timestamps (5 minutes)
const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;

/**
 * Verify registration signature.
 * Message format: "register:<handle>:<timestamp>"
 */
export async function verifyRegistrationSignature(payload: {
  handle?: string;
  public_key: string;
  signature: string;
  timestamp?: number;
}): Promise<boolean> {
  // If verification disabled, accept all (for backward compatibility)
  if (!SIGNATURE_VERIFICATION_ENABLED) {
    return true;
  }

  if (!payload.handle || !payload.public_key || !payload.signature) {
    return false;
  }

  // Validate timestamp if provided
  if (payload.timestamp) {
    const now = Date.now();
    if (Math.abs(now - payload.timestamp) > MAX_TIMESTAMP_AGE_MS) {
      return false;
    }
  }

  const handle = payload.handle.replace(/^@/, '');
  const message = `register:${handle}:${payload.timestamp || 0}`;
  
  return verifySignature(message, payload.signature, payload.public_key);
}

/**
 * Verify ship submission signature.
 * Backward compatible:
 * - v1: proof_hash = sha256(JSON.stringify(proof))
 * - v2: proof_hash = sha256(JSON.stringify({ proof, collections }))
 */
export async function verifyProofSignature(
  payload: { 
    agent_id: string; 
    title: string; 
    proof: unknown;
    collections?: unknown;
    signature: string;
    timestamp?: number;
  },
  agentPublicKey: string | undefined
): Promise<boolean> {
  // If verification disabled, accept all (for backward compatibility)
  if (!SIGNATURE_VERIFICATION_ENABLED) {
    return true;
  }

  if (!agentPublicKey) {
    return false;
  }

  if (!payload.signature) {
    return false;
  }

  // Validate timestamp if provided
  if (payload.timestamp) {
    const now = Date.now();
    if (Math.abs(now - payload.timestamp) > MAX_TIMESTAMP_AGE_MS) {
      return false;
    }
  }

  const titleHash = await sha256Hash(payload.title);

  const proofHashV1 = await sha256Hash(JSON.stringify(payload.proof));
  const messageV1 = `ship:${payload.agent_id}:${titleHash}:${proofHashV1}:${payload.timestamp || 0}`;

  // v2: include collections in the hashed payload so collection assignment can't be tampered post-signature.
  const proofHashV2 = await sha256Hash(
    JSON.stringify({ proof: payload.proof, collections: payload.collections ?? [] })
  );
  const messageV2 = `ship:${payload.agent_id}:${titleHash}:${proofHashV2}:${payload.timestamp || 0}`;

  // Accept either message (backward compatibility).
  const okV2 = await verifySignature(messageV2, payload.signature, agentPublicKey);
  if (okV2) return true;
  return verifySignature(messageV1, payload.signature, agentPublicKey);
}

/**
 * Verify acknowledgement signature.
 * Message format: "ack:<ship_id>:<agent_id>:<timestamp>"
 */
export async function verifyAcknowledgementSignature(
  payload: {
    ship_id: string;
    agent_id: string;
    signature: string;
    timestamp: number;
  },
  agentPublicKey: string
): Promise<boolean> {
  if (!SIGNATURE_VERIFICATION_ENABLED) {
    return true;
  }

  if (!payload.signature || payload.timestamp == null) {
    return false;
  }

  const now = Date.now();
  if (Math.abs(now - payload.timestamp) > MAX_TIMESTAMP_AGE_MS) {
    return false;
  }

  const message = `ack:${payload.ship_id}:${payload.agent_id}:${payload.timestamp}`;
  return verifySignature(message, payload.signature, agentPublicKey);
}

/**
 * Check if a timestamp is fresh (within allowed window)
 */
export function isTimestampFresh(timestamp: number | undefined): boolean {
  if (!timestamp) return true; // No timestamp = no check (backward compat)
  const now = Date.now();
  return Math.abs(now - timestamp) <= MAX_TIMESTAMP_AGE_MS;
}
