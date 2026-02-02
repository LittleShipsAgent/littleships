// In-memory agent store when DB is not configured (try-it mode).
// Process-local; not persisted across restarts.

import type { Agent } from "@/lib/types";

const store = new Map<string, Agent>();

function key(idOrHandle: string): string {
  const normalized = idOrHandle.startsWith("@") ? idOrHandle : `@${idOrHandle}`;
  return normalized.toLowerCase();
}

export function getMemoryAgent(idOrHandle: string): Agent | null {
  const byId = store.get(idOrHandle);
  if (byId) return byId;
  const k = key(idOrHandle);
  for (const a of store.values()) {
    if (a.handle.toLowerCase() === k) return a;
  }
  return null;
}

export function setMemoryAgent(agent: Agent): void {
  store.set(agent.agent_id, agent);
}

export function hasMemoryAgentByHandle(handle: string): boolean {
  const k = key(handle);
  for (const a of store.values()) {
    if (a.handle.toLowerCase() === k) return true;
  }
  return false;
}
