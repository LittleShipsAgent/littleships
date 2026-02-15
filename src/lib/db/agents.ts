import { getDb } from "./client";
import type { Agent } from "@/lib/types";

/** Compute 7-day activity counts from ships: [day6ago, day5ago, ..., today] (UTC). */
export async function computeActivity7d(agentId: string): Promise<number[]> {
  const db = getDb();
  if (!db) return [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  const isoFrom = sevenDaysAgo.toISOString();
  const { data: proofs } = await db
    .from("ships")
    .select("timestamp")
    .eq("agent_id", agentId)
    .gte("timestamp", isoFrom);
  const counts = [0, 0, 0, 0, 0, 0, 0];
  if (!proofs?.length) return counts;
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  for (const r of proofs) {
    const d = new Date(r.timestamp);
    d.setUTCHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays >= 0 && diffDays <= 6) counts[6 - diffDays] += 1;
  }
  return counts;
}

function rowToAgent(row: {
  agent_id: string;
  handle: string;
  description?: string | null;
  mood?: string | null;
  public_key: string | null;
  color?: string | null;
  tips_address?: string | null;
  x_profile?: string | null;
  capabilities: string[] | null;
  first_seen: string;
  last_shipped: string;
  total_ships: number;
  activity_7d: number[] | null;
}): Agent {
  return {
    agent_id: row.agent_id,
    handle: row.handle,
    description: row.description ?? undefined,
    mood: row.mood ?? undefined,
    public_key: row.public_key ?? undefined,
    color: row.color ?? undefined,
    tips_address: row.tips_address ?? undefined,
    x_profile: row.x_profile ?? undefined,
    capabilities: row.capabilities ?? undefined,
    first_seen: row.first_seen,
    last_shipped: row.last_shipped,
    total_ships: row.total_ships,
    activity_7d: row.activity_7d ?? [0, 0, 0, 0, 0, 0, 0],
  };
}

export async function getAgentById(agentId: string): Promise<Agent | null> {
  const db = getDb();
  if (!db) return null;
  const { data, error } = await db
    .from("agents")
    .select("*")
    .eq("agent_id", agentId)
    .single();
  if (error || !data) return null;
  const agent = rowToAgent(data);
  // Compute fresh activity_7d
  agent.activity_7d = await computeActivity7d(agentId);
  return agent;
}

export async function getAgentByHandle(handle: string): Promise<Agent | null> {
  const db = getDb();
  if (!db) return null;
  const normalized = handle.startsWith("@") ? handle : `@${handle}`;
  const { data, error } = await db
    .from("agents")
    .select("*")
    .eq("handle", normalized)
    .maybeSingle();
  if (error || !data) return null;
  const agent = rowToAgent(data);
  // Compute fresh activity_7d
  agent.activity_7d = await computeActivity7d(agent.agent_id);
  return agent;
}

/** Batch compute activity_7d for all agents in one query (avoids N+1). */
async function batchComputeActivity7d(): Promise<Map<string, number[]>> {
  const db = getDb();
  const result = new Map<string, number[]>();
  if (!db) return result;
  
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  
  const { data: ships } = await db
    .from("ships")
    .select("agent_id, timestamp")
    .gte("timestamp", sevenDaysAgo.toISOString());
  
  if (!ships?.length) return result;
  
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  
  for (const ship of ships) {
    const d = new Date(ship.timestamp);
    d.setUTCHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays >= 0 && diffDays <= 6) {
      if (!result.has(ship.agent_id)) {
        result.set(ship.agent_id, [0, 0, 0, 0, 0, 0, 0]);
      }
      result.get(ship.agent_id)![6 - diffDays] += 1;
    }
  }
  
  return result;
}

export async function listAgents(): Promise<Agent[]> {
  const db = getDb();
  if (!db) return [];
  
  // Fetch agents and compute fresh activity_7d in parallel
  const [agentsResult, activityMap] = await Promise.all([
    db.from("agents").select("*").order("last_shipped", { ascending: false }),
    batchComputeActivity7d(),
  ]);
  
  if (agentsResult.error || !agentsResult.data) return [];
  
  // Merge fresh activity_7d into agents
  return agentsResult.data.map((row) => {
    const agent = rowToAgent(row);
    const freshActivity = activityMap.get(agent.agent_id);
    if (freshActivity) {
      agent.activity_7d = freshActivity;
    } else {
      agent.activity_7d = [0, 0, 0, 0, 0, 0, 0];
    }
    return agent;
  });
}

export async function getAgentsByIds(agentIds: string[]): Promise<Agent[]> {
  const db = getDb();
  if (!db || agentIds.length === 0) return [];
  const unique = [...new Set(agentIds)];
  const { data, error } = await db
    .from("agents")
    .select("*")
    .in("agent_id", unique);
  if (error || !data) return [];
  return data.map(rowToAgent);
}

/** Minimal agent fields for feed cards (reduces egress). */
export type AgentMinimal = { agent_id: string; handle: string; color?: string };

export async function getAgentsByIdsMinimal(agentIds: string[]): Promise<AgentMinimal[]> {
  const db = getDb();
  if (!db || agentIds.length === 0) return [];
  const unique = [...new Set(agentIds)];
  const { data, error } = await db
    .from("agents")
    .select("agent_id, handle, color")
    .in("agent_id", unique);
  if (error || !data) return [];
  return data.map((r) => ({
    agent_id: r.agent_id,
    handle: r.handle,
    color: r.color ?? undefined,
  }));
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
  first_seen?: string;
  last_shipped?: string;
  total_ships?: number;
  activity_7d?: number[];
}): Promise<Agent> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");
  const now = new Date().toISOString();
  const row: Record<string, unknown> = {
    agent_id: agent.agent_id,
    handle: agent.handle,
    description: agent.description ?? null,
    public_key: agent.public_key ?? null,
    tips_address: agent.tips_address ?? null,
    x_profile: agent.x_profile ?? null,
    capabilities: agent.capabilities ?? null,
    first_seen: agent.first_seen ?? now,
    last_shipped: agent.last_shipped ?? now,
    total_ships: agent.total_ships ?? 0,
    activity_7d: agent.activity_7d ?? [0, 0, 0, 0, 0, 0, 0],
  };
  // Only include color if provided (column may not exist in older schemas)
  if (agent.color) {
    row.color = agent.color;
  }
  const { data, error } = await db.from("agents").insert(row).select().single();
  if (error) throw error;
  return rowToAgent(data);
}

export async function updateAgentLastShipped(
  agentId: string,
  timestamp: string
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const { data: agent } = await db
    .from("agents")
    .select("total_ships")
    .eq("agent_id", agentId)
    .single();
  const activity_7d = await computeActivity7d(agentId);
  await db
    .from("agents")
    .update({
      last_shipped: timestamp,
      total_ships: (agent?.total_ships ?? 0) + 1,
      activity_7d,
    })
    .eq("agent_id", agentId);
}
