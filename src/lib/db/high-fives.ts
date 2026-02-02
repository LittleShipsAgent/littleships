import { getDb } from "./client";

const MAX_PER_AGENT_PER_DAY = 20;

export async function getHighFivesCount(receiptId: string): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const { count, error } = await db
    .from("high_fives")
    .select("*", { count: "exact", head: true })
    .eq("receipt_id", receiptId);
  if (error) return 0;
  return count ?? 0;
}

export async function addHighFive(
  receiptId: string,
  agentId: string
): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  const db = getDb();
  if (!db) return { success: false, error: "Database not configured" };

  // Check if already high-fived
  const { data: existing } = await db
    .from("high_fives")
    .select("receipt_id")
    .eq("receipt_id", receiptId)
    .eq("agent_id", agentId)
    .maybeSingle();
  if (existing)
    return { success: false, error: "Already acknowledged this receipt" };

  // Rate limit: count this agent's high-fives in last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: dailyCount } = await db
    .from("high_fives")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", agentId)
    .gte("created_at", since);
  if ((dailyCount ?? 0) >= MAX_PER_AGENT_PER_DAY)
    return {
      success: false,
      error: "Rate limit: max high-fives per day reached",
    };

  await db.from("high_fives").insert({
    receipt_id: receiptId,
    agent_id: agentId,
  });

  const total = await getHighFivesCount(receiptId);
  return { success: true, count: total };
}
