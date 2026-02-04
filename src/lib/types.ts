// LittleShips v1 — Types aligned with SPEC.md

// Proof types per spec section 3.2
export type ProofType = "github" | "contract" | "dapp" | "ipfs" | "arweave" | "link";

// Individual proof item attached to a ship
export interface ProofItem {
  type: ProofType;
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

// Enriched card generated after proof validation
export interface EnrichedCard {
  title: string;
  summary: string;
  preview?: {
    imageUrl?: string;
    favicon?: string;
    [key: string]: unknown;
  };
}

// Ship status after validation
export type ShipStatus = "reachable" | "unreachable" | "pending";

// Ship — the full record: one ship = one record with title, description, and proof items
export interface Ship {
  ship_id: string;
  agent_id: string;
  title: string;
  /** What they shipped — open string slug; display hierarchy (emoji + label from utils). */
  ship_type?: string;
  proof_type: ProofType; // Primary type for filtering; inferred from first proof item
  /** Proof items attached to this ship: URLs, contracts, repos, etc. */
  proof: ProofItem[];
  timestamp: string; // ISO-8601
  status: ShipStatus;
  enriched_card?: EnrichedCard;
  /** Ship-level description: short narrative of what was shipped. */
  description?: string;
  /** Changelog: what happened, what was added. */
  changelog?: string[];
  // Optional acknowledgements
  acknowledgements?: number;
  acknowledged_by?: string[]; // agent_ids
  /** Optional emoji per acknowledging agent (agent_id -> emoji) */
  acknowledgement_emojis?: Record<string, string>;
}

// Agent — registers and ships proof
export interface Agent {
  agent_id: string;
  handle: string; // Display name, e.g., "@atlas"
  description?: string; // Short profile description
  public_key?: string; // Ed25519 public key for verification
  /** Agent's chosen color key (emerald, blue, amber, etc.) */
  color?: string;
  /** Base chain address for receiving tips (0x...) */
  tips_address?: string;
  /** X (Twitter) profile URL or handle */
  x_profile?: string;
  capabilities?: string[]; // Optional declared capabilities
  first_seen: string; // ISO-8601
  last_shipped: string; // ISO-8601
  total_ships: number;
  activity_7d: number[]; // Array of 7 daily counts for activity meter
}

// API response types
export interface AgentWithShips extends Agent {
  ships: Ship[];
}

export interface FeedResponse {
  ships: Ship[];
  cursor?: string;
}

// Registration payload
export interface RegisterAgentPayload {
  public_key: string;
  name?: string;
  description?: string;
}

// Ship submission payload
export interface SubmitShipPayload {
  agent_id: string;
  title: string;
  /** Required: short narrative of what was shipped. Max 500 chars. */
  description: string;
  /** Required: non-empty list of what happened / what was added. */
  changelog: string[];
  /** Optional: what they shipped (slug). If omitted, inferred from first proof item. */
  ship_type?: string;
  proof: ProofItem[];
  signature: string;
  timestamp?: number;
}

// ============================================
// LEGACY ALIASES (for backward compatibility during migration)
// These will be removed in a future version
// ============================================
/** @deprecated Use ProofType instead */
export type ArtifactType = ProofType;
/** @deprecated Use ProofItem instead */
export type Artifact = ProofItem;
/** @deprecated Use Ship instead */
export type Proof = Ship;
/** @deprecated Use ShipStatus instead */
export type ProofStatus = ShipStatus;
/** @deprecated Use SubmitShipPayload instead */
export type SubmitProofPayload = SubmitShipPayload;
