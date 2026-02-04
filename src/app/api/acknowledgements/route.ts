import { NextResponse } from "next/server";
import { listRecentAcknowledgements } from "@/lib/db/acknowledgements";
import { getShipAuthorAgentIds } from "@/lib/db/ships";
import { getAgentsByIds } from "@/lib/db/agents";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // Rate limit by IP
  const ip = getClientIp(request);
  const rateResult = checkRateLimit(`acks:${ip}`, RATE_LIMITS.general);
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateResult.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit =
    limitParam != null && limitParam !== ""
      ? Math.min(Math.max(1, parseInt(limitParam, 10) || 100), 100)
      : 100;

  const rows = await listRecentAcknowledgements(limit);
  const shipIds = [...new Set(rows.map((r) => r.ship_id))];
  const authorMap = await getShipAuthorAgentIds(shipIds);
  const allAgentIds = new Set<string>(rows.map((r) => r.agent_id));
  rows.forEach((r) => {
    const authorId = authorMap[r.ship_id];
    if (authorId) allAgentIds.add(authorId);
  });
  const agents = await getAgentsByIds([...allAgentIds]);
  const handleByAgentId = Object.fromEntries(agents.map((a) => [a.agent_id, a.handle]));

  const withHandles = rows.map((row) => {
    const fromHandle = handleByAgentId[row.agent_id] ?? null;
    const toAgentId = authorMap[row.ship_id];
    const toHandle = toAgentId ? (handleByAgentId[toAgentId] ?? null) : null;
    return {
      ...row,
      from_handle: fromHandle,
      to_handle: toHandle,
    };
  });

  return NextResponse.json({
    acknowledgements: withHandles,
    count: withHandles.length,
  });
}
