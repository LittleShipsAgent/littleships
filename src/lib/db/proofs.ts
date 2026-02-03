import { getDb } from "./client";
import type { Proof, Artifact, EnrichedCard } from "@/lib/types";

function rowToProof(row: {
  proof_id: string;
  agent_id: string;
  title: string;
  artifact_type: string;
  ship_type?: string | null;
  proof: unknown;
  timestamp: string;
  status: string;
  enriched_card: unknown;
  changelog?: unknown;
  description?: string | null;
}): Proof {
  return {
    proof_id: row.proof_id,
    agent_id: row.agent_id,
    title: row.title,
    ship_type: row.ship_type ?? undefined,
    artifact_type: row.artifact_type as Proof["artifact_type"],
    proof: (Array.isArray(row.proof) ? row.proof : []) as Artifact[],
    timestamp: row.timestamp,
    status: row.status as Proof["status"],
    enriched_card: row.enriched_card as EnrichedCard | undefined,
    changelog: Array.isArray(row.changelog) ? (row.changelog as string[]) : undefined,
    description: row.description ?? undefined,
  };
}

export async function getProofById(proofId: string): Promise<Proof | null> {
  const db = getDb();
  if (!db) return null;
  const { data, error } = await db
    .from("proofs")
    .select("*")
    .eq("proof_id", proofId)
    .single();
  if (error || !data) return null;
  return rowToProof(data);
}

export async function listProofsForFeed(limit = 100, cursor?: string): Promise<Proof[]> {
  const db = getDb();
  if (!db) return [];
  let query = db
    .from("proofs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (cursor) {
    query = query.lt("timestamp", cursor);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(rowToProof);
}

export async function listProofsForAgent(agentId: string): Promise<Proof[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("proofs")
    .select("*")
    .eq("agent_id", agentId)
    .order("timestamp", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToProof);
}

/** Agent IDs that have at least one proof of this artifact_type (for discovery). */
export async function listAgentIdsByArtifactType(artifactType: string): Promise<string[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("proofs")
    .select("agent_id")
    .eq("artifact_type", artifactType);
  if (error || !data) return [];
  return [...new Set(data.map((r) => r.agent_id))];
}

export async function insertProof(proof: Proof): Promise<Proof> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");
  const row = {
    proof_id: proof.proof_id,
    agent_id: proof.agent_id,
    title: proof.title,
    ship_type: proof.ship_type ?? null,
    artifact_type: proof.artifact_type,
    proof: proof.proof,
    timestamp: proof.timestamp,
    status: proof.status,
    enriched_card: proof.enriched_card ?? null,
    changelog: proof.changelog ?? null,
    description: proof.description ?? null,
  };
  const { data, error } = await db.from("proofs").insert(row).select().single();
  if (error) throw error;
  return rowToProof(data);
}
