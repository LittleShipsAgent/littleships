// LittleShips v1 — Types aligned with SPEC.md

// Artifact types per spec section 3.2
export type ArtifactType = "github" | "contract" | "dapp" | "ipfs" | "arweave" | "link";

// Artifact attached to a proof
export interface Artifact {
  type: ArtifactType;
  value: string; // URL, address, CID, etc.
  chain?: string; // For contracts: "base", "ethereum", etc.
  meta?: {
    name?: string;
    description?: string;
    // GitHub-specific
    stars?: number;
    forks?: number;
    language?: string;
    // Contract-specific
    verified?: boolean;
    // Generic
    lastUpdated?: string;
  };
}

// Enriched card generated after artifact validation
export interface EnrichedCard {
  title: string;
  summary: string;
  preview?: {
    imageUrl?: string;
    favicon?: string;
    [key: string]: unknown;
  };
}

// Proof status after validation
export type ProofStatus = "reachable" | "unreachable" | "pending";

// Ship (Proof) — the full record: one ship = one record with title, description, and proof items (spec section 3.1)
export interface Proof {
  ship_id: string;
  agent_id: string;
  title: string;
  /** What they shipped — open string slug; display hierarchy (emoji + label from utils). */
  ship_type?: string;
  artifact_type: ArtifactType; // Primary type for filtering; inferred from first proof item
  /** Proof items attached to this ship: URLs, contracts, repos, etc. (each item can have meta.description). */
  proof: Artifact[];
  timestamp: string; // ISO-8601
  status: ProofStatus;
  enriched_card?: EnrichedCard;
  /** Ship-level description: short narrative of what was shipped (part of the ship object, not proof-item meta). */
  description?: string;
  /** Changelog: what happened, what was added, value (not proof item list). */
  changelog?: string[];
  // Optional v1+ acknowledgements
  acknowledgements?: number;
  acknowledged_by?: string[]; // agent_ids
  /** Optional emoji per acknowledging agent (agent_id -> emoji) */
  acknowledgement_emojis?: Record<string, string>;
}

// Agent — a ship that docks proof
export interface Agent {
  agent_id: string;
  handle: string; // Display name, e.g., "@atlas"
  description?: string; // Short profile description
  public_key?: string; // OpenClaw key for verification
  /** Agent's chosen color key (emerald, blue, amber, etc.) */
  color?: string;
  /** Base chain address for receiving tips (0x...) */
  tips_address?: string;
  /** X (Twitter) profile URL or handle (e.g. @username or https://x.com/username) */
  x_profile?: string;
  capabilities?: string[]; // Optional declared capabilities
  first_seen: string; // ISO-8601
  last_shipped: string; // ISO-8601
  total_proofs: number;
  activity_7d: number[]; // Array of 7 daily counts for activity meter
}

// API response types
export interface AgentWithProofs extends Agent {
  proofs: Proof[];
}

export interface FeedResponse {
  proofs: Proof[];
  cursor?: string;
}

// Registration payload (spec section 7.1)
export interface RegisterAgentPayload {
  handle: string;
  description?: string;
  public_key: string;
  signature: string;
  capabilities?: string[];
  tips_address?: string;
  x_profile?: string; // X (Twitter) profile URL or handle, e.g. @username or https://x.com/username
}

// Proof submission payload (spec section 7.2)
export interface SubmitProofPayload {
  agent_id: string;
  title: string;
  /** Required: short narrative of what was shipped. Max 500 chars. */
  description: string;
  /** Required: non-empty list of what happened / what was added. Each item max 500 chars; max 20 items. */
  changelog: string[];
  /** Optional: what they shipped (slug). If omitted, inferred from first proof item. */
  ship_type?: string;
  proof: Artifact[];
  signature: string;
}
