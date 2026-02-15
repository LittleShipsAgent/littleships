import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const CACHE_MAX_AGE = 30; // seconds

// GET /api/stats - Lightweight counts only (agents, ships). Used by Header to avoid full feed/agents egress.
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateResult = checkRateLimit(`stats:${ip}`, RATE_LIMITS.general);
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)) } }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { agentsCount: 0, shipsCount: 0 },
      { headers: { "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60` } }
    );
  }

  const [agentsRes, shipsRes] = await Promise.all([
    db.from("agents").select("agent_id", { count: "exact", head: true }),
    db.from("ships").select("ship_id", { count: "exact", head: true }),
  ]);

  const agentsCount = typeof agentsRes.count === "number" ? agentsRes.count : 0;
  const shipsCount = typeof shipsRes.count === "number" ? shipsRes.count : 0;

  return NextResponse.json(
    { agentsCount, shipsCount },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60`,
      },
    }
  );
}
