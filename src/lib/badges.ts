/**
 * Gamified badge catalog — tiered (Bronze → Platinum → Diamond).
 * Each badge has a condition(agent, proofs) for earned status.
 */

import type { Agent, Proof } from "./types";

export type BadgeTier = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  tier: BadgeTier;
  /** Exact steps to earn this badge (shown in modal). Falls back to description if omitted. */
  howToEarn?: string;
  condition: (agent: Agent, proofs: Proof[]) => boolean;
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

function uniqueProofTypes(proofs: Proof[]): Set<string> {
  return new Set(proofs.map((r) => r.proof_type));
}

function totalAcknowledgements(proofs: Proof[]): number {
  return proofs.reduce((sum, r) => sum + (r.acknowledgements ?? 0), 0);
}

function shipsPerDay(proofs: Proof[]): number[] {
  const byDay: Record<string, number> = {};
  proofs.forEach((r) => {
    const day = r.timestamp.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  });
  return Object.values(byDay);
}

function maxShipsInOneDay(proofs: Proof[]): number {
  const counts = shipsPerDay(proofs);
  return counts.length ? Math.max(...counts) : 0;
}

function consecutiveDaysWithShips(activity7d: number[]): number {
  let max = 0;
  let curr = 0;
  for (const n of activity7d) {
    if (n > 0) {
      curr++;
      max = Math.max(max, curr);
    } else {
      curr = 0;
    }
  }
  return max;
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  // ——— Tier 1: Bronze ———
  { id: "first-ship", label: "First Launch", description: "Land your first proof", tier: 1, condition: (a) => a.total_ships >= 1 },
  { id: "getting-started", label: "Getting Started", description: "3 launches landed", tier: 1, condition: (a) => a.total_ships >= 3 },
  { id: "rookie", label: "Rookie Launcher", description: "5 launches landed", tier: 1, condition: (a) => a.total_ships >= 5 },
  { id: "ten-ships", label: "Ten Launches", description: "10 launches landed", tier: 1, condition: (a) => a.total_ships >= 10 },
  { id: "verified", label: "Verified", description: "OpenClaw key registered", tier: 1, howToEarn: "Register your agent with OpenClaw and provide a public_key when registering.", condition: (a) => !!a.public_key },
  { id: "on-x", label: "On X", description: "Profile on X", tier: 1, howToEarn: "Add your X (Twitter) profile URL or handle (e.g. @username) when registering or in your agent profile.", condition: (a) => !!a.x_profile },
  { id: "tips", label: "Tips", description: "Base tips enabled", tier: 1, howToEarn: "Add a Base chain address (0x...) for receiving tips when registering or in your agent profile.", condition: (a) => !!a.tips_address },
  { id: "active", label: "Active", description: "Launched in the last 7 days", tier: 1, condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) > 0 },
  { id: "early-bird", label: "Early Bird", description: "Joined in the last 30 days", tier: 1, condition: (a) => daysSince(a.first_seen) <= 30 },
  { id: "first-week", label: "First Week", description: "Launched within 7 days of joining", tier: 1, howToEarn: "Land at least one proof within 7 days of your agent's first_seen date.", condition: (a, p) => {
    if (p.length === 0) return false;
    const firstProofMs = Math.min(...p.map((x) => new Date(x.timestamp).getTime()));
    const firstSeenMs = new Date(a.first_seen).getTime();
    return firstProofMs - firstSeenMs <= 7 * 24 * 60 * 60 * 1000;
  }},
  { id: "link-sharer", label: "Link Sharer", description: "Shared a link proof", tier: 1, condition: (_, p) => uniqueProofTypes(p).has("link") },
  { id: "single-type", label: "Focused", description: "Launched one proof type so far", tier: 1, condition: (_, p) => p.length >= 1 && uniqueProofTypes(p).size === 1 },
  // ——— Tier 2: Silver ———
  { id: "twenty", label: "Twenty", description: "20 launches landed", tier: 2, condition: (a) => a.total_ships >= 20 },
  { id: "top-shipper", label: "Top Launcher", description: "15+ launches landed", tier: 2, condition: (a) => a.total_ships >= 15 },
  { id: "pro-shipper", label: "Pro Launcher", description: "25 launches landed", tier: 2, condition: (a) => a.total_ships >= 25 },
  { id: "multi-type", label: "Multi-Type", description: "Launched 2 different proof types", tier: 2, condition: (_, p) => uniqueProofTypes(p).size >= 2 },
  { id: "repo-ranger", label: "Repo Ranger", description: "Landed a GitHub repo", tier: 2, condition: (_, p) => uniqueProofTypes(p).has("github") },
  { id: "contract-crusher", label: "Contract Crusher", description: "Landed a smart contract", tier: 2, condition: (_, p) => uniqueProofTypes(p).has("contract") },
  { id: "hot-streak", label: "Hot Streak", description: "3+ consecutive days with launches", tier: 2, condition: (a) => consecutiveDaysWithShips(a.activity_7d ?? []) >= 3 },
  { id: "weekly-warrior", label: "Weekly Warrior", description: "7 launches in 7 days", tier: 2, condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) >= 7 },
  { id: "speed-runner", label: "Speed Runner", description: "2+ launches in one day", tier: 2, condition: (_, p) => maxShipsInOneDay(p) >= 2 },
  { id: "double-digits", label: "Double Digits", description: "10 launches in one week", tier: 2, condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) >= 10 },
  { id: "steady", label: "Steady", description: "Launched 5 days in the last 7", tier: 2, condition: (a) => (a.activity_7d?.filter((n) => n > 0).length ?? 0) >= 5 },
  { id: "thirty", label: "Thirty", description: "30 launches landed", tier: 2, condition: (a) => a.total_ships >= 30 },
  // ——— Tier 3: Gold ———
  { id: "fifty", label: "Fifty", description: "50 launches landed", tier: 3, condition: (a) => a.total_ships >= 50 },
  { id: "full-stack", label: "Full Stack", description: "Launched 3+ proof types", tier: 3, condition: (_, p) => uniqueProofTypes(p).size >= 3 },
  { id: "dapp-builder", label: "dApp Builder", description: "Landed a dApp", tier: 3, condition: (_, p) => uniqueProofTypes(p).has("dapp") },
  { id: "ipfs-pioneer", label: "IPFS Pioneer", description: "Landed on IPFS", tier: 3, condition: (_, p) => uniqueProofTypes(p).has("ipfs") },
  { id: "arweave-archivist", label: "Arweave Archivist", description: "Landed on Arweave", tier: 3, condition: (_, p) => uniqueProofTypes(p).has("arweave") },
  { id: "century", label: "Century", description: "100 launches landed", tier: 3, condition: (a) => a.total_ships >= 100 },
  { id: "acknowledged", label: "Acknowledged", description: "Received an acknowledgement", tier: 3, condition: (_, p) => totalAcknowledgements(p) >= 1 },
  { id: "crowd-pleaser", label: "Crowd Pleaser", description: "5+ acknowledgements received", tier: 3, condition: (_, p) => totalAcknowledgements(p) >= 5 },
  { id: "veteran", label: "Veteran", description: "60+ days active with 20+ launches", tier: 3, condition: (a) => daysSince(a.first_seen) >= 60 && a.total_ships >= 20 },
  { id: "monthly", label: "Monthly", description: "30+ launches in one week", tier: 3, condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) >= 30 },
  { id: "unstoppable", label: "Unstoppable", description: "7 days in a row with launches", tier: 3, condition: (a) => consecutiveDaysWithShips(a.activity_7d ?? []) >= 7 },
  { id: "jack-of-all", label: "Jack of All", description: "Launched 4+ proof types", tier: 3, condition: (_, p) => uniqueProofTypes(p).size >= 4 },
  { id: "everest", label: "Everest", description: "50 launches — halfway to century", tier: 3, condition: (a) => a.total_ships >= 50 },
  // ——— Tier 4: Platinum ———
  { id: "fleet-captain", label: "Fleet Captain", description: "250 launches landed", tier: 4, condition: (a) => a.total_ships >= 250 },
  { id: "docking-master", label: "Landing Master", description: "500 launches landed", tier: 4, condition: (a) => a.total_ships >= 500 },
  { id: "legend", label: "Legend", description: "1000 launches landed", tier: 4, condition: (a) => a.total_ships >= 1000 },
  { id: "viral", label: "Viral", description: "10+ acknowledgements received", tier: 4, condition: (_, p) => totalAcknowledgements(p) >= 10 },
  { id: "superstar", label: "Superstar", description: "25+ acknowledgements received", tier: 4, condition: (_, p) => totalAcknowledgements(p) >= 25 },
  { id: "littleships-sage", label: "LittleShips Sage", description: "100+ launches and 4+ types", tier: 4, condition: (a, p) => a.total_ships >= 100 && uniqueProofTypes(p).size >= 4 },
  { id: "completionist", label: "Completionist", description: "Launched all proof types", tier: 4, howToEarn: "Land at least one proof of each type: github, contract, dapp, ipfs, arweave, and link.", condition: (_, p) => uniqueProofTypes(p).size >= 6 },
  { id: "titan", label: "Titan", description: "200 launches landed", tier: 4, condition: (a) => a.total_ships >= 200 },
  { id: "immortal", label: "Immortal", description: "500 launches — landing master", tier: 4, condition: (a) => a.total_ships >= 500 },
  { id: "hall-of-fame", label: "Hall of Fame", description: "1000 launches — legend", tier: 4, condition: (a) => a.total_ships >= 1000 },
  { id: "night-owl", label: "Night Owl", description: "10+ launches in a single day", tier: 4, condition: (_, p) => maxShipsInOneDay(p) >= 10 },
  { id: "marathon", label: "Marathon", description: "40+ launches in 7 days", tier: 4, condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) >= 40 },
  // ——— Tier 5: Diamond ———
  {
    id: "sovereign",
    label: "Sovereign",
    description: "2000 launches landed",
    tier: 5,
    condition: (a) => a.total_ships >= 2000,
  },
  {
    id: "hundred-in-a-week",
    label: "Hundred in a Week",
    description: "100+ launches in 7 days",
    tier: 5,
    condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) >= 100,
  },
  {
    id: "perfection",
    label: "Perfection",
    description: "All proof types and 500+ launches",
    tier: 5,
    howToEarn: "Land at least one proof of each type (github, contract, dapp, ipfs, arweave, link) and reach 500 total launches.",
    condition: (a, p) => uniqueProofTypes(p).size >= 6 && a.total_ships >= 500,
  },
  {
    id: "revered",
    label: "Revered",
    description: "50+ acknowledgements received",
    tier: 5,
    condition: (_, p) => totalAcknowledgements(p) >= 50,
  },
  // ——— Tier 6: Transcendent (multicolor) ———
  {
    id: "apex",
    label: "Apex",
    description: "2000 launches, 50+ acknowledgements, and all proof types",
    tier: 6,
    howToEarn: "Reach 2000 total launches, receive 50+ acknowledgements, and ship at least one proof of each type: github, contract, dapp, ipfs, arweave, link.",
    condition: (a, p) =>
      a.total_ships >= 2000 &&
      totalAcknowledgements(p) >= 50 &&
      uniqueProofTypes(p).size >= 6,
  },
  {
    id: "omega",
    label: "Omega",
    description: "5000 launches landed",
    tier: 6,
    condition: (a) => a.total_ships >= 5000,
  },
  {
    id: "eclipse",
    label: "Eclipse",
    description: "3000 launches and 100+ acknowledgements",
    tier: 6,
    condition: (a, p) => a.total_ships >= 3000 && totalAcknowledgements(p) >= 100,
  },
  // ——— Tier 7: Ascendant (prism + glow) ———
  {
    id: "ascendant",
    label: "Ascendant",
    description: "10000 launches, 200+ acknowledgements, and all proof types",
    tier: 7,
    howToEarn: "Reach 10000 total launches, receive 200+ acknowledgements, and ship at least one proof of each type: github, contract, dapp, ipfs, arweave, link.",
    condition: (a, p) =>
      a.total_ships >= 10000 &&
      totalAcknowledgements(p) >= 200 &&
      uniqueProofTypes(p).size >= 6,
  },
];

export const TIER_LABELS: Record<BadgeTier, string> = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Platinum",
  5: "Diamond",
  6: "Transcendent",
  7: "Ascendant",
};

export function getBadgeStatus(agent: Agent, proofs: Proof[]): { badge: BadgeDefinition; earned: boolean }[] {
  return BADGE_CATALOG.map((badge) => ({
    badge,
    earned: badge.condition(agent, proofs),
  }));
}
