import { getDb } from "./client";
import type { Agent } from "@/lib/types";

/** Compute 7-day activity counts from receipts: [day6ago, day5ago, ..., today] (UTC). */
export async function computeActivity7d(agentId: string): Promise<number[]> {
  const db = getDb();
  if (!db) return [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  const isoFrom = sevenDaysAgo.toISOString();
  const { data: receipts } = await db
    .from("receipts")
    .select("timestamp")
    .eq("agent_id", agentId)
    .gte("timestamp", isoFrom);
  const counts = [0, 0, 0, 0, 0, 0, 0];
  if (!receipts?.length) return counts;
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  for (const r of receipts) {
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
  public_key: string | null;
  tips_address?: string | null;
  x_profile?: string | null;
  capabilities: string[] | null;
  first_seen: string;
  last_shipped: string;
  total_receipts: number;
  activity_7d: number[] | null;
}): Agent {
  return {
    agent_id: row.agent_id,
    handle: row.handle,
    description: row.description ?? undefined,
    public_key: row.public_key ?? undefined,
    tips_address: row.tips_address ?? undefined,
    x_profile: row.x_profile ?? undefined,
    capabilities: row.capabilities ?? undefined,
    first_seen: row.first_seen,
    last_shipped: row.last_shipped,
    total_receipts: row.total_receipts,
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
  return rowToAgent(data);
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
  return rowToAgent(data);
}

export async function listAgents(): Promise<Agent[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("agents")
    .select("*")
    .order("last_shipped", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToAgent);
}

export async function insertAgent(agent: {
  agent_id: string;
  handle: string;
  description?: string;
  public_key?: string;
  tips_address?: string;
  x_profile?: string;
  capabilities?: string[];
  first_seen?: string;
  last_shipped?: string;
  total_receipts?: number;
  activity_7d?: number[];
}): Promise<Agent> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");
  const now = new Date().toISOString();
  const row = {
    agent_id: agent.agent_id,
    handle: agent.handle,
    description: agent.description ?? null,
    public_key: agent.public_key ?? null,
    tips_address: agent.tips_address ?? null,
    x_profile: agent.x_profile ?? null,
    capabilities: agent.capabilities ?? null,
    first_seen: agent.first_seen ?? now,
    last_shipped: agent.last_shipped ?? now,
    total_receipts: agent.total_receipts ?? 0,
    activity_7d: agent.activity_7d ?? [0, 0, 0, 0, 0, 0, 0],
  };
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
    .select("total_receipts")
    .eq("agent_id", agentId)
    .single();
  const activity_7d = await computeActivity7d(agentId);
  await db
    .from("agents")
    .update({
      last_shipped: timestamp,
      total_receipts: (agent?.total_receipts ?? 0) + 1,
      activity_7d,
    })
    .eq("agent_id", agentId);
}
