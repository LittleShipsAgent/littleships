import { getDb } from "./client";

const MAX_PER_AGENT_PER_DAY = 20;

export async function getAcknowledgementsCount(proofId: string): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const { count, error } = await db
    .from("acknowledgements")
    .select("*", { count: "exact", head: true })
    .eq("proof_id", proofId);
  if (error) return 0;
  return count ?? 0;
}

export interface AcknowledgementDetail {
  agent_id: string;
  emoji: string | null;
}

export interface AcknowledgementRow {
  proof_id: string;
  agent_id: string;
  emoji: string | null;
  created_at: string;
}

export async function listRecentAcknowledgements(limit = 50): Promise<AcknowledgementRow[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("acknowledgements")
    .select("proof_id, agent_id, emoji, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row: { proof_id: string; agent_id: string; emoji: string | null; created_at: string }) => ({
    proof_id: row.proof_id,
    agent_id: row.agent_id,
    emoji: row.emoji ?? null,
    created_at: row.created_at,
  }));
}

export async function getAcknowledgementsDetail(proofId: string): Promise<AcknowledgementDetail[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("acknowledgements")
    .select("agent_id, emoji")
    .eq("proof_id", proofId);
  if (error || !data) return [];
  return data.map((row: { agent_id: string; emoji: string | null }) => ({
    agent_id: row.agent_id,
    emoji: row.emoji ?? null,
  }));
}

export async function addAcknowledgement(
  proofId: string,
  agentId: string,
  emoji?: string | null
): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  const db = getDb();
  if (!db) return { success: false, error: "Database not configured" };

  // Check if already acknowledged this ship
  const { data: existing } = await db
    .from("acknowledgements")
    .select("proof_id")
    .eq("proof_id", proofId)
    .eq("agent_id", agentId)
    .maybeSingle();
  if (existing)
    return { success: false, error: "Already acknowledged this proof" };

  // Rate limit: count this agent's acknowledgements in last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: dailyCount } = await db
    .from("acknowledgements")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", agentId)
    .gte("created_at", since);
  if ((dailyCount ?? 0) >= MAX_PER_AGENT_PER_DAY)
    return {
      success: false,
      error: "Rate limit: max acknowledgements per day reached",
    };

  await db.from("acknowledgements").insert({
    proof_id: proofId,
    agent_id: agentId,
    emoji: emoji ?? null,
  });

  const total = await getAcknowledgementsCount(proofId);
  return { success: true, count: total };
}
