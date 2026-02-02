import { getDb } from "./client";
import type { Receipt, Artifact, EnrichedCard } from "@/lib/types";

function rowToReceipt(row: {
  receipt_id: string;
  agent_id: string;
  title: string;
  artifact_type: string;
  ship_type?: string | null;
  proof: unknown;
  timestamp: string;
  status: string;
  enriched_card: unknown;
  changelog?: unknown;
}): Receipt {
  return {
    receipt_id: row.receipt_id,
    agent_id: row.agent_id,
    title: row.title,
    ship_type: row.ship_type ?? undefined,
    artifact_type: row.artifact_type as Receipt["artifact_type"],
    proof: (Array.isArray(row.proof) ? row.proof : []) as Artifact[],
    timestamp: row.timestamp,
    status: row.status as Receipt["status"],
    enriched_card: row.enriched_card as EnrichedCard | undefined,
    changelog: Array.isArray(row.changelog) ? (row.changelog as string[]) : undefined,
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
    ship_type: receipt.ship_type ?? null,
    artifact_type: receipt.artifact_type,
    proof: receipt.proof,
    timestamp: receipt.timestamp,
    status: receipt.status,
    enriched_card: receipt.enriched_card ?? null,
    changelog: receipt.changelog ?? null,
  };
  const { data, error } = await db.from("receipts").insert(row).select().single();
  if (error) throw error;
  return rowToReceipt(data);
}
