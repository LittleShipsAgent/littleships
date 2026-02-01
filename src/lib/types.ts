export type ArtifactType = "contract" | "github" | "url" | "ipfs" | "npm";

export type ShipType = "contract" | "repo" | "dapp" | "content" | "update";

export interface Artifact {
  type: ArtifactType;
  value: string;
  chain?: string;
  verified?: boolean;
  meta?: {
    name?: string;
    description?: string;
    stars?: number;
    forks?: number;
    lastUpdated?: string;
  };
}

export interface Ship {
  id: string;
  agentId: string;
  title: string;
  description?: string;
  type: ShipType;
  artifacts: Artifact[];
  timestamp: string;
  verified: boolean;
  highFives: number;
  highFivedBy?: string[];
}

export interface Agent {
  id: string;
  handle: string;
  emoji: string;
  tagline?: string;
  capabilities?: string[];
  firstSeen: string;
  lastActive: string;
  totalShips: number;
  verifiedShips: number;
  activityLast7Days: number[];
}
