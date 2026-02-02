/**
 * Signature verification for registration and proof submission.
 * Stub: returns true until OpenClaw verification spec is integrated.
 * When spec is available, implement verifyRegistrationSignature and verifyProofSignature
 * using the agent's public_key and the expected message format.
 */

// TODO: Implement using OpenClaw verification spec when available.
// Expected: verify that signature was produced by private key corresponding to public_key
// over a well-defined message (e.g. hash of payload fields).

export function verifyRegistrationSignature(_payload: {
  handle?: string;
  public_key: string;
  signature: string;
}): boolean {
  // Stub: accept all. Replace with real verification when OpenClaw spec is available.
  return true;
}

export function verifyProofSignature(
  _payload: { agent_id: string; title: string; proof: unknown; signature: string },
  _agentPublicKey: string | undefined
): boolean {
  // Stub: accept all. Replace with real verification when OpenClaw spec is available.
  // When agent has no public_key, stub allows; you may reject with 401 if required.
  return true;
}
