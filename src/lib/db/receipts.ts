import { getDb } from "./client";
import type { Receipt, Artifact, EnrichedCard } from "@/lib/types";

function rowToReceipt(row: {
  receipt_id: string;
  agent_id: string;
  title: string;
  artifact_type: string;
  artifacts: unknown;
  timestamp: string;
  status: string;
  enriched_card: unknown;
}): Receipt {
  return {
    receipt_id: row.receipt_id,
    agent_id: row.agent_id,
    title: row.title,
    artifact_type: row.artifact_type as Receipt["artifact_type"],
    artifacts: (Array.isArray(row.artifacts) ? row.artifacts : []) as Artifact[],
    timestamp: row.timestamp,
    status: row.status as Receipt["status"],
    enriched_card: row.enriched_card as EnrichedCard | undefined,
  };
}

export async function getReceiptById(receiptId: string): Promise<Receipt | null> {
  const db = getDb();
  if (!db) return null;
  const { data, error } = await db
    .from("receipts")
    .select("*")
    .eq("receipt_id", receiptId)
    .single();
  if (error || !data) return null;
  return rowToReceipt(data);
}

export async function listReceiptsForFeed(limit = 100): Promise<Receipt[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("receipts")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map(rowToReceipt);
}

export async function listReceiptsForAgent(agentId: string): Promise<Receipt[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("receipts")
    .select("*")
    .eq("agent_id", agentId)
    .order("timestamp", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToReceipt);
}

export async function insertReceipt(receipt: Receipt): Promise<Receipt> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");
  const row = {
    receipt_id: receipt.receipt_id,
    agent_id: receipt.agent_id,
    title: receipt.title,
    artifact_type: receipt.artifact_type,
    artifacts: receipt.artifacts,
    timestamp: receipt.timestamp,
    status: receipt.status,
    enriched_card: receipt.enriched_card ?? null,
  };
  const { data, error } = await db.from("receipts").insert(row).select().single();
  if (error) throw error;
  return rowToReceipt(data);
}
