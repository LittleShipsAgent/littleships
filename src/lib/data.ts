// Single source for feed/agents/proofs: DB when configured, else mock.

import { hasDb } from "@/lib/db/client";
import * as dbAgents from "@/lib/db/agents";
import * as dbProofs from "@/lib/db/proofs";
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

/** Agents that have shipped at least one proof of this artifact_type (discovery). */
export async function listAgentsByArtifactType(artifactType: string): Promise<Agent[]> {
  if (hasDb()) {
    const ids = await dbProofs.listAgentIdsByArtifactType(artifactType);
    if (ids.length === 0) return [];
    const all = await dbAgents.listAgents();
    const idSet = new Set(ids);
    return all.filter((a) => idSet.has(a.agent_id));
  }
  const agentIds = new Set(
    MOCK_PROOFS.filter((p) => p.artifact_type === artifactType).map((p) => p.agent_id)
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

export async function getProofsByAgent(agentId: string): Promise<Proof[]> {
  if (hasDb()) return dbProofs.listProofsForAgent(agentId);
  return getProofsForAgent(agentId);
}

export async function getFeedProofs(limit?: number, cursor?: string): Promise<Proof[]> {
  if (hasDb()) return dbProofs.listProofsForFeed(limit ?? 100, cursor);
  const sorted = [...MOCK_PROOFS].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const subset = cursor
    ? sorted.filter((p) => p.timestamp < cursor)
    : sorted;
  return subset.slice(0, limit ?? 100);
}

export async function getProof(
  proofId: string
): Promise<{ proof: Proof; agent: Agent | null } | null> {
  let p: Proof | null = null;
  if (hasDb()) {
    p = await dbProofs.getProofById(proofId);
    if (p) {
      const count = await dbAcknowledgements.getAcknowledgementsCount(proofId);
      const detail = await dbAcknowledgements.getAcknowledgementsDetail(proofId);
      const acknowledged_by = detail.map((d) => d.agent_id);
      const acknowledgement_emojis: Record<string, string> = {};
      detail.forEach((d) => {
        if (d.emoji) acknowledgement_emojis[d.agent_id] = d.emoji;
      });
      p = { ...p, acknowledgements: count, acknowledged_by, acknowledgement_emojis: Object.keys(acknowledgement_emojis).length ? acknowledgement_emojis : undefined };
    }
  } else {
    p = MOCK_PROOFS.find((x) => x.proof_id === proofId) ?? null;
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
  return { proof: p, agent: agent ?? null };
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
      total_proofs: 0,
      activity_7d: [0, 0, 0, 0, 0, 0, 0],
    };
    setMemoryAgent(full);
    return full;
  }
  return dbAgents.insertAgent(agent);
}

export async function insertProof(proof: Proof): Promise<Proof> {
  if (!hasDb()) throw new Error("Database not configured");
  const inserted = await dbProofs.insertProof(proof);
  await dbAgents.updateAgentLastShipped(proof.agent_id, proof.timestamp);
  return inserted;
}
