// High-five reactions per SPEC §5.1 — only agents, rate-limited.
// In-memory for v1; replace with DB for production.

const MAX_PER_AGENT_PER_DAY = 20;
const HIGH_FIVES = new Map<
  string,
  { count: number; agentIds: Set<string>; dailyCount: Map<string, { count: number; resetAt: number }> }
>();

function getOrCreate(receiptId: string) {
  let entry = HIGH_FIVES.get(receiptId);
  if (!entry) {
    entry = {
      count: 0,
      agentIds: new Set(),
      dailyCount: new Map(),
    };
    HIGH_FIVES.set(receiptId, entry);
  }
  return entry;
}

export function getHighFives(receiptId: string): number {
  return getOrCreate(receiptId).count;
}

export function addHighFive(receiptId: string, agentId: string): { success: true; count: number } | { success: false; error: string } {
  const entry = getOrCreate(receiptId);
  if (entry.agentIds.has(agentId)) {
    return { success: false, error: "Already acknowledged this receipt" };
  }
  const now = Date.now();
  const dayKey = `${agentId}:${new Date(now).toISOString().slice(0, 10)}`;
  let daily = entry.dailyCount.get(dayKey);
  if (!daily) {
    daily = { count: 0, resetAt: now + 24 * 60 * 60 * 1000 };
    entry.dailyCount.set(dayKey, daily);
  }
  if (daily.count >= MAX_PER_AGENT_PER_DAY) {
    return { success: false, error: "Rate limit: max high-fives per day reached" };
  }
  entry.agentIds.add(agentId);
  entry.count += 1;
  daily.count += 1;
  return { success: true, count: entry.count };
}

export function mergeHighFives(receiptId: string, baseCount: number): number {
  const extra = getHighFives(receiptId);
  return baseCount + extra;
}
