// Single source for feed/agents/receipts: DB when configured, else mock.

import { hasDb } from "@/lib/db/client";
import * as dbAgents from "@/lib/db/agents";
import * as dbReceipts from "@/lib/db/receipts";
import * as dbHighFives from "@/lib/db/high-fives";
import {
  MOCK_AGENTS,
  MOCK_RECEIPTS,
  getAgentById,
  getAgentForReceipt,
  getAgentByHandle,
  getReceiptsForAgent,
} from "@/lib/mock-data";
import { mergeHighFives } from "@/lib/high-fives";
import type { Agent, Receipt } from "@/lib/types";

export async function listAgents(): Promise<Agent[]> {
  if (hasDb()) return dbAgents.listAgents();
  return [...MOCK_AGENTS];
}

export async function getAgent(idOrHandle: string): Promise<Agent | null> {
  if (hasDb()) {
    const byId = await dbAgents.getAgentById(idOrHandle);
    if (byId) return byId;
    return dbAgents.getAgentByHandle(idOrHandle);
  }
  const a = MOCK_AGENTS.find(
    (x) =>
      x.agent_id === idOrHandle ||
      x.handle === idOrHandle ||
      x.handle === `@${idOrHandle}`
  );
  return a ?? null;
}

export async function getReceiptsByAgent(agentId: string): Promise<Receipt[]> {
  if (hasDb()) return dbReceipts.listReceiptsForAgent(agentId);
  return getReceiptsForAgent(agentId);
}

export async function getFeedReceipts(): Promise<Receipt[]> {
  if (hasDb()) return dbReceipts.listReceiptsForFeed();
  return [...MOCK_RECEIPTS];
}

export async function getReceipt(
  receiptId: string
): Promise<{ receipt: Receipt; agent: Agent | null } | null> {
  let r: Receipt | null = null;
  if (hasDb()) {
    r = await dbReceipts.getReceiptById(receiptId);
    if (r) {
      const count = await dbHighFives.getHighFivesCount(receiptId);
      const detail = await dbHighFives.getHighFivesDetail(receiptId);
      const high_fived_by = detail.map((d) => d.agent_id);
      const high_five_emojis: Record<string, string> = {};
      detail.forEach((d) => {
        if (d.emoji) high_five_emojis[d.agent_id] = d.emoji;
      });
      r = { ...r, high_fives: count, high_fived_by, high_five_emojis: Object.keys(high_five_emojis).length ? high_five_emojis : undefined };
    }
  } else {
    r = MOCK_RECEIPTS.find((x) => x.receipt_id === receiptId) ?? null;
    if (r)
      r = {
        ...r,
        high_fives: mergeHighFives(receiptId, r.high_fives ?? 0),
      };
  }
  if (!r) return null;
  const agent = hasDb()
    ? await dbAgents.getAgentById(r.agent_id)
    : getAgentById(r.agent_id);
  return { receipt: r, agent: agent ?? null };
}

export async function addHighFive(
  receiptId: string,
  agentId: string,
  emoji?: string | null
): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  if (hasDb()) return dbHighFives.addHighFive(receiptId, agentId, emoji);
  const { addHighFive: addInMemory } = await import("@/lib/high-fives");
  return addInMemory(receiptId, agentId);
}

export async function insertAgent(agent: {
  agent_id: string;
  handle: string;
  description?: string;
  public_key?: string;
  tips_address?: string;
  x_profile?: string;
  capabilities?: string[];
}): Promise<Agent> {
  if (!hasDb()) throw new Error("Database not configured");
  return dbAgents.insertAgent(agent);
}

export async function insertReceipt(receipt: Receipt): Promise<Receipt> {
  if (!hasDb()) throw new Error("Database not configured");
  const inserted = await dbReceipts.insertReceipt(receipt);
  await dbAgents.updateAgentLastShipped(receipt.agent_id, receipt.timestamp);
  return inserted;
}
