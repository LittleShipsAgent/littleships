import { NextResponse } from "next/server";
import { generateVerificationCode, verifyXAccount } from "@/lib/x-verify";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// In-memory store for pending verifications (in production, use Redis or DB)
const pendingVerifications = new Map<string, {
  code: string;
  handle: string;
  xUsername: string;
  createdAt: number;
}>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  for (const [key, value] of pendingVerifications.entries()) {
    if (now - value.createdAt > maxAge) {
      pendingVerifications.delete(key);
    }
  }
}, 5 * 60 * 1000);

// POST /api/verify - Start verification (generate code)
// GET /api/verify?handle=...&x=... - Check verification status
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateResult = checkRateLimit(`verify:${ip}`, RATE_LIMITS.register);
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many verification attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const handle = (body.handle || '').trim().toLowerCase().replace(/^@/, '');
    const xUsername = (body.x_username || '').trim().replace(/^@/, '');

    if (!handle || !/^[a-z0-9_-]{2,32}$/.test(handle)) {
      return NextResponse.json(
        { error: "Invalid handle format" },
        { status: 400 }
      );
    }

    if (!xUsername || !/^[a-zA-Z0-9_]{1,15}$/.test(xUsername)) {
      return NextResponse.json(
        { error: "Invalid X username format" },
        { status: 400 }
      );
    }

    // Generate verification code
    const code = generateVerificationCode(handle);
    const key = `${handle}:${xUsername.toLowerCase()}`;
    
    pendingVerifications.set(key, {
      code,
      handle,
      xUsername,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      code,
      instructions: [
        `Post this code to X (tweet or add to bio):`,
        code,
        `Then click "Verify" to complete registration.`,
      ],
      expires_in: 1800, // 30 minutes
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const handle = (url.searchParams.get('handle') || '').trim().toLowerCase().replace(/^@/, '');
  const xUsername = (url.searchParams.get('x') || '').trim().replace(/^@/, '');

  if (!handle || !xUsername) {
    return NextResponse.json(
      { error: "Missing handle or x parameter" },
      { status: 400 }
    );
  }

  const key = `${handle}:${xUsername.toLowerCase()}`;
  const pending = pendingVerifications.get(key);

  if (!pending) {
    return NextResponse.json(
      { error: "No pending verification found. Start verification first." },
      { status: 404 }
    );
  }

  // Check if expired (30 minutes)
  if (Date.now() - pending.createdAt > 30 * 60 * 1000) {
    pendingVerifications.delete(key);
    return NextResponse.json(
      { error: "Verification expired. Please start again." },
      { status: 410 }
    );
  }

  // Check X profile for the code
  const result = await verifyXAccount(xUsername, pending.code);

  if (result.verified) {
    // Don't delete yet - let the registration endpoint consume it
    return NextResponse.json({
      verified: true,
      method: result.method,
      message: `Verified via ${result.method}!`,
    });
  }

  return NextResponse.json({
    verified: false,
    error: result.error || "Verification code not found",
    code: pending.code, // Remind them of the code
    hint: "Make sure the code is visible in your X bio or a recent tweet.",
  });
}

// NOTE: Keep this route handler module limited to HTTP method exports.
