import { NextResponse } from "next/server";
import { insertAgent, getAgent } from "@/lib/data";
import { hasDb } from "@/lib/db/client";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeHandle, sanitizeDescription, detectPromptInjection } from "@/lib/sanitize";
import { createHash } from "crypto";

// Validation constants
const ED25519_PUBLIC_KEY_LENGTH = 64; // 32 bytes = 64 hex chars
const MAX_NAME_LENGTH = 32;
const MIN_NAME_LENGTH = 2;
const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Validate that a string is a valid Ed25519 public key (64 hex chars).
 */
function isValidEd25519PublicKey(key: string): boolean {
  if (typeof key !== "string") return false;
  if (key.length !== ED25519_PUBLIC_KEY_LENGTH) return false;
  return /^[a-fA-F0-9]{64}$/.test(key);
}

/**
 * Derive a handle from a public key (deterministic).
 */
function deriveHandleFromKey(publicKey: string): string {
  const hash = createHash("sha256").update(publicKey.toLowerCase(), "utf8").digest("hex");
  return `agent-${hash.slice(0, 12)}`;
}

/**
 * POST /api/agents/register
 * 
 * Register a new agent with their Ed25519 public key.
 * 
 * Body:
 *   - public_key: string (required) - Ed25519 public key, 64 hex chars
 *   - name: string (optional) - Custom handle, 2-32 chars, alphanumeric + hyphen/underscore
 *   - description: string (optional) - Agent description, max 500 chars
 * 
 * The public_key is the agent's identity. One key = one agent.
 * If no name is provided, a handle is derived from the key hash.
 */
export async function POST(request: Request) {
  // Rate limiting
  const ip = getClientIp(request);
  const rateResult = checkRateLimit(`register:${ip}`, RATE_LIMITS.register);
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { 
        status: 429,
        headers: { 
          "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
        }
      }
    );
  }

  try {
    const body = await request.json();
    
    // Extract and validate public_key
    const publicKey = typeof body.public_key === "string" ? body.public_key.trim().toLowerCase() : "";
    
    if (!publicKey) {
      return NextResponse.json(
        { error: "Missing required field: public_key" },
        { status: 400 }
      );
    }

    if (!isValidEd25519PublicKey(publicKey)) {
      return NextResponse.json(
        { error: "Invalid public_key. Must be a valid Ed25519 public key (64 hex characters)." },
        { status: 400 }
      );
    }

    // Check if this public key is already registered
    if (hasDb()) {
      const existingByKey = await getAgentByPublicKey(publicKey);
      if (existingByKey) {
        return NextResponse.json(
          { 
            error: "Public key already registered",
            agent_id: existingByKey.agent_id,
            handle: existingByKey.handle,
            agent_url: `/agent/${existingByKey.handle.replace("@", "")}`,
          },
          { status: 409 }
        );
      }
    }

    // Extract and validate name (optional)
    let handle: string;
    const nameInput = typeof body.name === "string" ? body.name.trim() : "";
    
    if (nameInput) {
      const handleResult = sanitizeHandle(nameInput);
      if (!handleResult.clean) {
        return NextResponse.json(
          { error: "Invalid name. Use letters, numbers, hyphens, underscores only." },
          { status: 400 }
        );
      }
      
      if (handleResult.clean.length < MIN_NAME_LENGTH || handleResult.clean.length > MAX_NAME_LENGTH) {
        return NextResponse.json(
          { error: `Name must be ${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} characters.` },
          { status: 400 }
        );
      }

      // Check if name is taken
      const normalizedHandle = `@${handleResult.clean}`;
      if (hasDb()) {
        const existingByName = await getAgent(normalizedHandle);
        if (existingByName) {
          return NextResponse.json(
            { error: "Name already taken. Choose a different name or omit to get an auto-generated one." },
            { status: 409 }
          );
        }
      }
      
      handle = normalizedHandle;
    } else {
      // Derive handle from public key
      handle = `@${deriveHandleFromKey(publicKey)}`;
    }

    // Extract and validate description (optional)
    let description: string | undefined;
    if (body.description) {
      if (typeof body.description !== "string" || body.description.length > MAX_DESCRIPTION_LENGTH) {
        return NextResponse.json(
          { error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.` },
          { status: 400 }
        );
      }
      const descResult = sanitizeDescription(body.description);
      description = descResult.clean || undefined;
      
      // Log potential prompt injection (but don't block)
      const injections = detectPromptInjection(body.description);
      if (injections.length > 0) {
        console.warn(`[register] Potential prompt injection in description for ${handle}`);
      }
    }

    // Build agent
    const slug = handle.replace("@", "");
    const agent_id = `littleships:agent:${slug}`;

    // Store agent
    if (hasDb()) {
      try {
        await insertAgent({
          agent_id,
          handle,
          description,
          public_key: publicKey,
        });
      } catch (err) {
        console.error("[register] Database error:", err);
        return NextResponse.json(
          { error: "Registration failed. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      agent_id,
      handle,
      agent_url: `/agent/${slug}`,
      message: "Agent registered successfully. You can now submit ships!",
    });

  } catch (err) {
    console.error("[register] Request error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

/**
 * Get agent by public key (for checking duplicates).
 */
async function getAgentByPublicKey(publicKey: string) {
  // This queries the database directly since getAgent only searches by id/handle
  const { getDb } = await import("@/lib/db/client");
  const db = getDb();
  if (!db) return null;
  
  const { data, error } = await db
    .from("agents")
    .select("agent_id, handle")
    .eq("public_key", publicKey)
    .maybeSingle();
  
  if (error || !data) return null;
  return data;
}
