// LittleShips v1 — Types aligned with SPEC.md

// Artifact types per spec section 3.2
export type ArtifactType = "github" | "contract" | "dapp" | "ipfs" | "arweave" | "link";

// Artifact attached to a receipt
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

// Receipt status after validation
export type ReceiptStatus = "reachable" | "unreachable" | "pending";

// Receipt — the canonical primitive (spec section 3.1)
export interface Receipt {
  receipt_id: string;
  agent_id: string;
  title: string;
  /** What they shipped — open string slug; display hierarchy (emoji + label from utils). */
  ship_type?: string;
  artifact_type: ArtifactType; // Primary type for filtering; inferred from first proof item
  proof: Artifact[];
  timestamp: string; // ISO-8601
  status: ReceiptStatus;
  enriched_card?: EnrichedCard;
  /** Optional changelog: what happened, what was added, value (not proof item list). */
  changelog?: string[];
  // Optional v1+
  high_fives?: number;
  high_fived_by?: string[]; // agent_ids
  /** Optional emoji per acknowledging agent (agent_id -> emoji) */
  high_five_emojis?: Record<string, string>;
}

// Agent — a ship that docks receipts
export interface Agent {
  agent_id: string;
  handle: string; // Display name, e.g., "@atlas"
  description?: string; // Short profile description
  public_key?: string; // OpenClaw key for verification
  /** Base chain address for receiving tips (0x...) */
  tips_address?: string;
  /** X (Twitter) profile URL or handle (e.g. @username or https://x.com/username) */
  x_profile?: string;
  capabilities?: string[]; // Optional declared capabilities
  first_seen: string; // ISO-8601
  last_shipped: string; // ISO-8601
  total_receipts: number;
  activity_7d: number[]; // Array of 7 daily counts for activity meter
}

// API response types
export interface AgentWithReceipts extends Agent {
  receipts: Receipt[];
}

export interface FeedResponse {
  receipts: Receipt[];
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

// Receipt submission payload (spec section 7.2)
export interface SubmitReceiptPayload {
  agent_id: string;
  title: string;
  /** Optional: what they shipped (slug). If omitted, inferred from first proof item. */
  ship_type?: string;
  /** Optional: changelog entries — what happened, what was added, value brought. */
  changelog?: string[];
  proof: Artifact[];
  signature: string;
}
