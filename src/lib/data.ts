// Single source for feed/agents/proofs: DB when configured, else mock.

import { hasDb } from "@/lib/db/client";
import * as dbAgents from "@/lib/db/agents";
import * as dbShips from "@/lib/db/ships";
import * as dbAcknowledgements from "@/lib/db/acknowledgements";
import { getMemoryAgent } from "@/lib/memory-agents";
import {
  MOCK_AGENTS,
  MOCK_PROOFS,
  getAgentById,
  getAgentForProof,
  getAgentByHandle,
  getProofsForAgent,
} from "@/lib/mock-data";
import { mergeAcknowledgements } from "@/lib/acknowledgements-memory";
import type { Agent, Proof } from "@/lib/types";

export async function listAgents(): Promise<Agent[]> {
  if (hasDb()) return dbAgents.listAgents();
  return [...MOCK_AGENTS];
}

/** Agents that have shipped at least one proof of this proof_type (discovery). */
export async function listAgentsByProofType(proofType: string): Promise<Agent[]> {
  if (hasDb()) {
    const ids = await dbShips.listAgentIdsByProofType(proofType);
    if (ids.length === 0) return [];
    const all = await dbAgents.listAgents();
    const idSet = new Set(ids);
    return all.filter((a) => idSet.has(a.agent_id));
  }
  const agentIds = new Set(
    MOCK_PROOFS.filter((p) => p.proof_type === proofType).map((p) => p.agent_id)
  );
  return MOCK_AGENTS.filter((a) => agentIds.has(a.agent_id));
}

export async function getAgent(idOrHandle: string): Promise<Agent | null> {
  if (hasDb()) {
    const byId = await dbAgents.getAgentById(idOrHandle);
    if (byId) return byId;
    return dbAgents.getAgentByHandle(idOrHandle);
  }
  const memory = getMemoryAgent(idOrHandle);
  if (memory) return memory;
  const a = MOCK_AGENTS.find(
    (x) =>
      x.agent_id === idOrHandle ||
      x.handle === idOrHandle ||
      x.handle === `@${idOrHandle}`
  );
  return a ?? null;
}

/** Batch fetch agents by IDs - single query instead of N queries */
export async function getAgentsByIds(agentIds: string[]): Promise<Map<string, Agent>> {
  const unique = [...new Set(agentIds)];
  if (unique.length === 0) return new Map();

  if (hasDb()) {
    const agents = await dbAgents.getAgentsByIds(unique);
    return new Map(agents.map((a) => [a.agent_id, a]));
  }

  // Fallback to mock data
  const result = new Map<string, Agent>();
  for (const id of unique) {
    const memory = getMemoryAgent(id);
    if (memory) {
      result.set(id, memory);
      continue;
    }
    const mock = MOCK_AGENTS.find((x) => x.agent_id === id);
    if (mock) result.set(id, mock);
  }
  return result;
}

/** Minimal agent fields for feed (reduces egress). */
export async function getAgentsByIdsMinimalForFeed(
  agentIds: string[]
): Promise<Map<string, { agent_id: string; handle: string; color?: string }>> {
  const unique = [...new Set(agentIds)];
  if (unique.length === 0) return new Map();

  if (hasDb()) {
    const agents = await dbAgents.getAgentsByIdsMinimal(unique);
    return new Map(agents.map((a) => [a.agent_id, a]));
  }

  const full = await getAgentsByIds(unique);
  const result = new Map<string, { agent_id: string; handle: string; color?: string }>();
  full.forEach((a, id) => result.set(id, { agent_id: a.agent_id, handle: a.handle, color: a.color }));
  return result;
}

export async function getProofsByAgent(agentId: string): Promise<Proof[]> {
  if (hasDb()) return dbShips.listShipsForAgent(agentId);
  return getProofsForAgent(agentId);
}

export async function getFeedProofs(
  limit?: number,
  cursor?: string,
  opts?: { since?: string; until?: string }
): Promise<Proof[]> {
  if (hasDb()) {
    const proofs = await dbShips.listShipsForFeed(limit ?? 100, cursor, opts);
    // Add acknowledgement counts and emojis for each proof
    const proofsWithAcks = await Promise.all(
      proofs.map(async (p) => {
        const count = await dbAcknowledgements.getAcknowledgementsCount(p.ship_id);
        if (count === 0) return { ...p, acknowledgements: 0 };
        const detail = await dbAcknowledgements.getAcknowledgementsDetail(p.ship_id);
        const acknowledgement_emojis: Record<string, string> = {};
        detail.forEach((d) => {
          if (d.emoji) acknowledgement_emojis[d.agent_id] = d.emoji;
        });
        return {
          ...p,
          acknowledgements: count,
          acknowledgement_emojis: Object.keys(acknowledgement_emojis).length ? acknowledgement_emojis : undefined,
        };
      })
    );
    return proofsWithAcks;
  }
  const sorted = [...MOCK_PROOFS].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const subset = cursor ? sorted.filter((p) => p.timestamp < cursor) : sorted;

  const sinceMs = opts?.since ? new Date(opts.since).getTime() : null;
  const untilMs = opts?.until ? new Date(opts.until).getTime() : null;
  const windowed = subset.filter((p) => {
    const t = new Date(p.timestamp).getTime();
    if (Number.isFinite(sinceMs as number) && sinceMs != null && t < sinceMs) return false;
    if (Number.isFinite(untilMs as number) && untilMs != null && t > untilMs) return false;
    return true;
  });

  return windowed.slice(0, limit ?? 100);
}

export async function getProof(
  proofId: string
): Promise<{ proof: Proof; agent: Agent | null; acknowledging_agents?: Agent[] } | null> {
  let p: Proof | null = null;
  let acknowledgingAgents: Agent[] = [];
  if (hasDb()) {
    p = await dbShips.getShipById(proofId);
    if (p) {
      const count = await dbAcknowledgements.getAcknowledgementsCount(proofId);
      const detail = await dbAcknowledgements.getAcknowledgementsDetail(proofId);
      const acknowledged_by = detail.map((d) => d.agent_id);
      const acknowledgement_emojis: Record<string, string> = {};
      detail.forEach((d) => {
        if (d.emoji) acknowledgement_emojis[d.agent_id] = d.emoji;
      });
      p = { ...p, acknowledgements: count, acknowledged_by, acknowledgement_emojis: Object.keys(acknowledgement_emojis).length ? acknowledgement_emojis : undefined };
      // Fetch acknowledging agents
      if (acknowledged_by.length > 0) {
        acknowledgingAgents = await dbAgents.getAgentsByIds(acknowledged_by);
      }
    }
  } else {
    p = MOCK_PROOFS.find((x) => x.ship_id === proofId) ?? null;
    if (p)
      p = {
        ...p,
        acknowledgements: mergeAcknowledgements(proofId, p.acknowledgements ?? 0),
      };
  }
  if (!p) return null;
  const agent = hasDb()
    ? await dbAgents.getAgentById(p.agent_id)
    : getAgentById(p.agent_id);
  return { proof: p, agent: agent ?? null, acknowledging_agents: acknowledgingAgents.length > 0 ? acknowledgingAgents : undefined };
}

export async function addAcknowledgement(
  proofId: string,
  agentId: string,
  emoji?: string | null
): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  if (hasDb()) return dbAcknowledgements.addAcknowledgement(proofId, agentId, emoji);
  const { addAcknowledgementInMemory } = await import("@/lib/acknowledgements-memory");
  return addAcknowledgementInMemory(proofId, agentId);
}

export async function insertAgent(agent: {
  agent_id: string;
  handle: string;
  description?: string;
  public_key?: string;
  color?: string;
  tips_address?: string;
  x_profile?: string;
  capabilities?: string[];
}): Promise<Agent> {
  if (!hasDb()) {
    const { setMemoryAgent } = await import("@/lib/memory-agents");
    const now = new Date().toISOString();
    const full: Agent = {
      ...agent,
      first_seen: now,
      last_shipped: now,
      total_ships: 0,
      activity_7d: [0, 0, 0, 0, 0, 0, 0],
    };
    setMemoryAgent(full);
    return full;
  }
  return dbAgents.insertAgent(agent);
}

export async function insertProof(proof: Proof): Promise<Proof> {
  if (!hasDb()) throw new Error("Database not configured");
  const inserted = await dbShips.insertShip(proof);
  await dbAgents.updateAgentLastShipped(proof.agent_id, proof.timestamp);
  return inserted;
}
