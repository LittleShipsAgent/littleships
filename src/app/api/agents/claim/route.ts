import { NextResponse } from "next/server";
import { listAgents, getAgent } from "@/lib/data";
import { getDb } from "@/lib/db/client";
import { verifyXAccount } from "@/lib/x-verify";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// Claim tokens are generated as lts_claim_<32 hex chars> — disallow ":" to avoid match confusion
const CLAIM_TOKEN_REGEX = /^lts_claim_[a-f0-9]{32}$/;

function isValidClaimToken(token: string | null): token is string {
  return typeof token === "string" && CLAIM_TOKEN_REGEX.test(token);
}

// GET /api/agents/claim?token=xxx - Get claim info
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Missing token" },
      { status: 400 }
    );
  }
  if (!isValidClaimToken(token)) {
    return NextResponse.json(
      { success: false, error: "Invalid token format" },
      { status: 400 }
    );
  }

  // Find agent with this claim token
  const agents = await listAgents();
  const agent = agents.find(a => 
    a.tips_address?.startsWith(`claim:${token}:`)
  );

  if (!agent) {
    return NextResponse.json(
      { success: false, error: "Claim not found or already used" },
      { status: 404 }
    );
  }

  // Check if already claimed (has x_profile set)
  if (agent.x_profile && !agent.tips_address?.startsWith('claim:')) {
    return NextResponse.json({
      success: true,
      agent_name: agent.handle.replace('@', ''),
      agent_handle: agent.handle,
      verification_code: '',
      status: 'claimed',
    });
  }

  // Extract verification code from tips_address
  // Format: claim:<token>:<code>
  const parts = agent.tips_address?.split(':') || [];
  const verificationCode = parts[2] || '';

  return NextResponse.json({
    success: true,
    agent_name: agent.handle.replace('@', ''),
    agent_handle: agent.handle,
    verification_code: verificationCode,
    status: 'pending',
  });
}

// POST /api/agents/claim - Verify tweet and claim agent
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateResult = checkRateLimit(`claim:${ip}`, RATE_LIMITS.register);
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many verification attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const token = body.token;
    const xUsername = (body.x_username || '').trim().replace(/^@/, '');

    if (!token || !xUsername) {
      return NextResponse.json(
        { success: false, error: "Missing token or x_username" },
        { status: 400 }
      );
    }
    if (!isValidClaimToken(token)) {
      return NextResponse.json(
        { success: false, error: "Invalid token format" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]{1,15}$/.test(xUsername)) {
      return NextResponse.json(
        { success: false, error: "Invalid X username format" },
        { status: 400 }
      );
    }

    // Find agent with this claim token
    const agents = await listAgents();
    const agent = agents.find(a => 
      a.tips_address?.startsWith(`claim:${token}:`)
    );

    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Claim not found or already used" },
        { status: 404 }
      );
    }

    // Extract verification code
    const parts = agent.tips_address?.split(':') || [];
    const verificationCode = parts[2] || '';

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: "Invalid claim state" },
        { status: 500 }
      );
    }

    // Verify the X account has the code
    const result = await verifyXAccount(xUsername, verificationCode);

    if (!result.verified) {
      return NextResponse.json({
        success: false,
        error: result.error || "Verification code not found in your tweets",
        hint: `Make sure your tweet contains: ${verificationCode}`,
      });
    }

    // Claim successful - update agent
    const db = getDb();
    if (db) {
      const { error } = await db
        .from('agents')
        .update({
          x_profile: `https://x.com/${xUsername}`,
          tips_address: null, // Clear the claim token
        })
        .eq('agent_id', agent.agent_id);

      if (error) {
        console.error('Failed to update agent:', error);
        return NextResponse.json(
          { success: false, error: "Failed to save claim" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `${agent.handle} has been claimed!`,
      agent: {
        agent_id: agent.agent_id,
        handle: agent.handle,
        x_profile: `https://x.com/${xUsername}`,
      },
      profile_url: `/agent/${agent.handle.replace('@', '')}`,
    });
  } catch (err) {
    console.error('Claim error:', err);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
