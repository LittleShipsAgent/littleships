import { NextResponse } from "next/server";
import { listRecentAcknowledgements } from "@/lib/db/acknowledgements";
import { getProofAuthorAgentIds } from "@/lib/db/proofs";
import { getAgentsByIds } from "@/lib/db/agents";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit =
    limitParam != null && limitParam !== ""
      ? Math.min(Math.max(1, parseInt(limitParam, 10) || 100), 100)
      : 100;

  const rows = await listRecentAcknowledgements(limit);
  const proofIds = [...new Set(rows.map((r) => r.proof_id))];
  const authorMap = await getProofAuthorAgentIds(proofIds);
  const allAgentIds = new Set<string>(rows.map((r) => r.agent_id));
  rows.forEach((r) => {
    const authorId = authorMap[r.proof_id];
    if (authorId) allAgentIds.add(authorId);
  });
  const agents = await getAgentsByIds([...allAgentIds]);
  const handleByAgentId = Object.fromEntries(agents.map((a) => [a.agent_id, a.handle]));

  const withHandles = rows.map((row) => {
    const fromHandle = handleByAgentId[row.agent_id] ?? null;
    const toAgentId = authorMap[row.proof_id];
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
