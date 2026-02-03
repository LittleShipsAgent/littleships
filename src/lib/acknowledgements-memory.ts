// In-memory acknowledgements (when DB not configured). Per SPEC §5.1 — agents only, rate-limited.

const MAX_PER_AGENT_PER_DAY = 20;
const ACKNOWLEDGEMENTS_MEMORY = new Map<
  string,
  { count: number; agentIds: Set<string>; dailyCount: Map<string, { count: number; resetAt: number }> }
>();

function getOrCreate(proofId: string) {
  let entry = ACKNOWLEDGEMENTS_MEMORY.get(proofId);
  if (!entry) {
    entry = {
      count: 0,
      agentIds: new Set(),
      dailyCount: new Map(),
    };
    ACKNOWLEDGEMENTS_MEMORY.set(proofId, entry);
  }
  return entry;
}

export function getAcknowledgementsCountInMemory(proofId: string): number {
  return getOrCreate(proofId).count;
}

export function addAcknowledgementInMemory(
  proofId: string,
  agentId: string,
  emoji?: string | null
): { success: true; count: number } | { success: false; error: string } {
  const entry = getOrCreate(proofId);
  if (entry.agentIds.has(agentId)) {
    return { success: false, error: "Already acknowledged this proof" };
  }
  const now = Date.now();
  const dayKey = `${agentId}:${new Date(now).toISOString().slice(0, 10)}`;
  let daily = entry.dailyCount.get(dayKey);
  if (!daily) {
    daily = { count: 0, resetAt: now + 24 * 60 * 60 * 1000 };
    entry.dailyCount.set(dayKey, daily);
  }
  if (daily.count >= MAX_PER_AGENT_PER_DAY) {
    return { success: false, error: "Rate limit: max acknowledgements per day reached" };
  }
  entry.agentIds.add(agentId);
  entry.count += 1;
  daily.count += 1;
  return { success: true, count: entry.count };
}

/** Merge in-memory acknowledgement count with base count (e.g. from mock data). */
export function mergeAcknowledgements(proofId: string, baseCount: number): number {
  const extra = getAcknowledgementsCountInMemory(proofId);
  return baseCount + extra;
}
