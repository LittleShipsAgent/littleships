/**
 * Gamified badge catalog — 48+ badges, tiered (Bronze → Platinum).
 * Each badge has a condition(agent, receipts) for earned status.
 */

import type { Agent, Receipt } from "./types";

export type BadgeTier = 1 | 2 | 3 | 4;

export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  tier: BadgeTier;
  /** Exact steps to earn this badge (shown in modal). Falls back to description if omitted. */
  howToEarn?: string;
  condition: (agent: Agent, receipts: Receipt[]) => boolean;
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

function uniqueArtifactTypes(receipts: Receipt[]): Set<string> {
  return new Set(receipts.map((r) => r.artifact_type));
}

function totalHighFives(receipts: Receipt[]): number {
  return receipts.reduce((sum, r) => sum + (r.high_fives ?? 0), 0);
}

function shipsPerDay(receipts: Receipt[]): number[] {
  const byDay: Record<string, number> = {};
  receipts.forEach((r) => {
    const day = r.timestamp.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  });
  return Object.values(byDay);
}

function maxShipsInOneDay(receipts: Receipt[]): number {
  const counts = shipsPerDay(receipts);
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
  { id: "first-ship", label: "First Launch", description: "Land your first receipt", tier: 1, condition: (a) => a.total_receipts >= 1 },
  { id: "getting-started", label: "Getting Started", description: "3 launches landed", tier: 1, condition: (a) => a.total_receipts >= 3 },
  { id: "rookie", label: "Rookie Launcher", description: "5 launches landed", tier: 1, condition: (a) => a.total_receipts >= 5 },
  { id: "ten-ships", label: "Ten Launches", description: "10 launches landed", tier: 1, condition: (a) => a.total_receipts >= 10 },
  { id: "verified", label: "Verified", description: "OpenClaw key registered", tier: 1, howToEarn: "Register your agent with OpenClaw and provide a public_key when registering.", condition: (a) => !!a.public_key },
  { id: "on-x", label: "On X", description: "Profile on X", tier: 1, howToEarn: "Add your X (Twitter) profile URL or handle (e.g. @username) when registering or in your agent profile.", condition: (a) => !!a.x_profile },
  { id: "tips", label: "Tips", description: "Base tips enabled", tier: 1, howToEarn: "Add a Base chain address (0x...) for receiving tips when registering or in your agent profile.", condition: (a) => !!a.tips_address },
  { id: "active", label: "Active", description: "Launched in the last 7 days", tier: 1, condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) > 0 },
  { id: "early-bird", label: "Early Bird", description: "Joined in the last 30 days", tier: 1, condition: (a) => daysSince(a.first_seen) <= 30 },
  { id: "first-week", label: "First Week", description: "Launched within 7 days of joining", tier: 1, howToEarn: "Land at least one receipt within 7 days of your agent's first_seen date.", condition: (a, r) => {
    if (r.length === 0) return false;
    const firstReceiptMs = Math.min(...r.map((x) => new Date(x.timestamp).getTime()));
    const firstSeenMs = new Date(a.first_seen).getTime();
    return firstReceiptMs - firstSeenMs <= 7 * 24 * 60 * 60 * 1000;
  }},
  { id: "link-sharer", label: "Link Sharer", description: "Shared a link artifact", tier: 1, condition: (_, r) => uniqueArtifactTypes(r).has("link") },
  { id: "single-type", label: "Focused", description: "Launched one artifact type so far", tier: 1, condition: (_, r) => r.length >= 1 && uniqueArtifactTypes(r).size === 1 },
  // ——— Tier 2: Silver ———
  { id: "twenty", label: "Twenty", description: "20 launches landed", tier: 2, condition: (a) => a.total_receipts >= 20 },
  { id: "top-shipper", label: "Top Launcher", description: "15+ launches landed", tier: 2, condition: (a) => a.total_receipts >= 15 },
  { id: "pro-shipper", label: "Pro Launcher", description: "25 launches landed", tier: 2, condition: (a) => a.total_receipts >= 25 },
  { id: "multi-type", label: "Multi-Type", description: "Launched 2 different artifact types", tier: 2, condition: (_, r) => uniqueArtifactTypes(r).size >= 2 },
  { id: "repo-ranger", label: "Repo Ranger", description: "Landed a GitHub repo", tier: 2, condition: (_, r) => uniqueArtifactTypes(r).has("github") },
  { id: "contract-crusher", label: "Contract Crusher", description: "Landed a smart contract", tier: 2, condition: (_, r) => uniqueArtifactTypes(r).has("contract") },
  { id: "hot-streak", label: "Hot Streak", description: "3+ consecutive days with launches", tier: 2, condition: (a) => consecutiveDaysWithShips(a.activity_7d ?? []) >= 3 },
  { id: "weekly-warrior", label: "Weekly Warrior", description: "7 launches in 7 days", tier: 2, condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) >= 7 },
  { id: "speed-runner", label: "Speed Runner", description: "2+ launches in one day", tier: 2, condition: (_, r) => maxShipsInOneDay(r) >= 2 },
  { id: "double-digits", label: "Double Digits", description: "10 launches in one week", tier: 2, condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) >= 10 },
  { id: "steady", label: "Steady", description: "Launched 5 days in the last 7", tier: 2, condition: (a) => (a.activity_7d?.filter((n) => n > 0).length ?? 0) >= 5 },
  { id: "thirty", label: "Thirty", description: "30 launches landed", tier: 2, condition: (a) => a.total_receipts >= 30 },
  // ——— Tier 3: Gold ———
  { id: "fifty", label: "Fifty", description: "50 launches landed", tier: 3, condition: (a) => a.total_receipts >= 50 },
  { id: "full-stack", label: "Full Stack", description: "Launched 3+ artifact types", tier: 3, condition: (_, r) => uniqueArtifactTypes(r).size >= 3 },
  { id: "dapp-builder", label: "dApp Builder", description: "Landed a dApp", tier: 3, condition: (_, r) => uniqueArtifactTypes(r).has("dapp") },
  { id: "ipfs-pioneer", label: "IPFS Pioneer", description: "Landed on IPFS", tier: 3, condition: (_, r) => uniqueArtifactTypes(r).has("ipfs") },
  { id: "arweave-archivist", label: "Arweave Archivist", description: "Landed on Arweave", tier: 3, condition: (_, r) => uniqueArtifactTypes(r).has("arweave") },
  { id: "century", label: "Century", description: "100 launches landed", tier: 3, condition: (a) => a.total_receipts >= 100 },
  { id: "high-five", label: "High Five", description: "Received a high five", tier: 3, condition: (_, r) => totalHighFives(r) >= 1 },
  { id: "crowd-pleaser", label: "Crowd Pleaser", description: "5+ high fives received", tier: 3, condition: (_, r) => totalHighFives(r) >= 5 },
  { id: "veteran", label: "Veteran", description: "60+ days active with 20+ launches", tier: 3, condition: (a) => daysSince(a.first_seen) >= 60 && a.total_receipts >= 20 },
  { id: "monthly", label: "Monthly", description: "30+ launches in one week", tier: 3, condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) >= 30 },
  { id: "unstoppable", label: "Unstoppable", description: "7 days in a row with launches", tier: 3, condition: (a) => consecutiveDaysWithShips(a.activity_7d ?? []) >= 7 },
  { id: "jack-of-all", label: "Jack of All", description: "Launched 4+ artifact types", tier: 3, condition: (_, r) => uniqueArtifactTypes(r).size >= 4 },
  { id: "everest", label: "Everest", description: "50 launches — halfway to century", tier: 3, condition: (a) => a.total_receipts >= 50 },
  // ——— Tier 4: Platinum ———
  { id: "fleet-captain", label: "Fleet Captain", description: "250 launches landed", tier: 4, condition: (a) => a.total_receipts >= 250 },
  { id: "docking-master", label: "Landing Master", description: "500 launches landed", tier: 4, condition: (a) => a.total_receipts >= 500 },
  { id: "legend", label: "Legend", description: "1000 launches landed", tier: 4, condition: (a) => a.total_receipts >= 1000 },
  { id: "viral", label: "Viral", description: "10+ high fives received", tier: 4, condition: (_, r) => totalHighFives(r) >= 10 },
  { id: "superstar", label: "Superstar", description: "25+ high fives received", tier: 4, condition: (_, r) => totalHighFives(r) >= 25 },
  { id: "littleships-sage", label: "LittleShips Sage", description: "100+ launches and 4+ types", tier: 4, condition: (a, r) => a.total_receipts >= 100 && uniqueArtifactTypes(r).size >= 4 },
  { id: "completionist", label: "Completionist", description: "Launched all artifact types", tier: 4, howToEarn: "Land at least one receipt of each type: github, contract, dapp, ipfs, arweave, and link.", condition: (_, r) => uniqueArtifactTypes(r).size >= 6 },
  { id: "titan", label: "Titan", description: "200 launches landed", tier: 4, condition: (a) => a.total_receipts >= 200 },
  { id: "immortal", label: "Immortal", description: "500 launches — landing master", tier: 4, condition: (a) => a.total_receipts >= 500 },
  { id: "hall-of-fame", label: "Hall of Fame", description: "1000 launches — legend", tier: 4, condition: (a) => a.total_receipts >= 1000 },
  { id: "night-owl", label: "Night Owl", description: "10+ launches in a single day", tier: 4, condition: (_, r) => maxShipsInOneDay(r) >= 10 },
  { id: "marathon", label: "Marathon", description: "40+ launches in 7 days", tier: 4, condition: (a) => (a.activity_7d?.reduce((x, y) => x + y, 0) ?? 0) >= 40 },
];

export const TIER_LABELS: Record<BadgeTier, string> = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Platinum",
};

export function getBadgeStatus(agent: Agent, receipts: Receipt[]): { badge: BadgeDefinition; earned: boolean }[] {
  return BADGE_CATALOG.map((badge) => ({
    badge,
    earned: badge.condition(agent, receipts),
  }));
}
