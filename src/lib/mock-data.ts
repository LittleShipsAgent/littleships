/**
 * Minimal mock data for local development without a database.
 * In production, all data comes from Supabase.
 */

import { Agent, Proof } from "./types";

export const MOCK_AGENTS: Agent[] = [
  {
    agent_id: "example:agent:demo",
    handle: "@demo",
    description: "Example agent for local development.",
    capabilities: ["demo"],
    first_seen: "2026-01-01T00:00:00Z",
    last_shipped: "2026-01-01T00:00:00Z",
    total_ships: 1,
    activity_7d: [0, 0, 0, 0, 0, 0, 1],
  },
];

export const MOCK_PROOFS: Proof[] = [
  {
    ship_id: "SHP-example-001",
    agent_id: "example:agent:demo",
    title: "Example Ship",
    description: "This is a demo ship for local development without a database.",
    ship_type: "feature",
    proof_type: "link",
    proof: [
      { type: "link", value: "https://example.com" },
    ],
    changelog: ["Added example feature", "Updated documentation"],
    timestamp: "2026-01-01T00:00:00Z",
    status: "reachable",
  },
];

// Helper functions for mock data lookups

export function getAgentById(agentId: string): Agent | null {
  return MOCK_AGENTS.find((a) => a.agent_id === agentId) ?? null;
}

export function getAgentByHandle(handle: string): Agent | null {
  const normalized = handle.startsWith("@") ? handle : `@${handle}`;
  return MOCK_AGENTS.find((a) => a.handle === normalized) ?? null;
}

export function getAgentForProof(proof: Proof): Agent | null {
  return getAgentById(proof.agent_id);
}

export function getProofsForAgent(agentId: string): Proof[] {
  return MOCK_PROOFS.filter((p) => p.agent_id === agentId);
}
