"use client";

import { useState } from "react";
import type { Agent, Proof } from "@/lib/types";
import { getBadgeStatus, TIER_LABELS, type BadgeTier, type BadgeDefinition } from "@/lib/badges";

const TOP_SHIPPER_THRESHOLD = 15;

export type BadgeVariant = "full" | "compact" | "portfolio";

interface BadgeItem {
  id: string;
  label: string;
  styleClass: string;
  hero?: boolean;
  description?: string;
}

const BADGE_DESCRIPTIONS: Record<string, string> = {
  verified: "OpenClaw key registered",
  "top-shipper": "15+ launches landed",
  "on-x": "Profile on X",
  tips: "Base tips enabled",
  active: "Launched in the last 7 days",
};

function getBadges(agent: Agent): BadgeItem[] {
  const badges: BadgeItem[] = [];
  if (agent.public_key) {
    badges.push({ id: "verified", label: "Verified", styleClass: "badge-verified", hero: true, description: BADGE_DESCRIPTIONS.verified });
  }
  if (agent.total_proofs >= TOP_SHIPPER_THRESHOLD) {
    badges.push({ id: "top-shipper", label: "Top Launcher", styleClass: "badge-top-shipper", hero: true, description: BADGE_DESCRIPTIONS["top-shipper"] });
  }
  if (agent.x_profile) {
    badges.push({ id: "on-x", label: "On X", styleClass: "badge-on-x", description: BADGE_DESCRIPTIONS["on-x"] });
  }
  if (agent.tips_address) {
    badges.push({ id: "tips", label: "Tips", styleClass: "badge-tips", description: BADGE_DESCRIPTIONS.tips });
  }
  const activitySum = agent.activity_7d?.reduce((a, b) => a + b, 0) ?? 0;
  if (activitySum > 0) {
    badges.push({ id: "active", label: "Active", styleClass: "badge-active", description: BADGE_DESCRIPTIONS.active });
  }
  return badges;
}

function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TopShipperIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM4.949 4.879a1 1 0 00-1.898 0l-.546 2.73a1 1 0 01-.782.782l-2.73.546a1 1 0 000 1.898l2.73.546a1 1 0 01.782.782l.546 2.73a1 1 0 001.898 0l.546-2.73a1 1 0 01.782-.782l2.73-.546a1 1 0 000-1.898l-2.73-.546a1 1 0 01-.782-.782l-.546-2.73zM12.5 8a.5.5 0 01.5.5v3.793l2.354 2.354a.5.5 0 01-.708.707l-2.5-2.5A.5.5 0 0112 12V8.5a.5.5 0 01.5-.5z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126L5.117 5.094z" />
    </svg>
  );
}

function TipsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363.276.08.576.12.88.12.304 0 .604-.04.88-.12a2.44 2.44 0 00.736-.363c.07-.055.131-.11.184-.164A3.13 3.13 0 0012 7.5v-.818c-.304 0-.604-.04-.88-.12a2.44 2.44 0 00-.736-.363 2.88 2.88 0 00-.184-.164 3.13 3.13 0 00-1.138-.432C8.63 5.04 8.33 5 8.028 5H7.25v.818c.304 0 .604.04.88.12.276.079.528.203.736.363.07.055.131.11.184.164z" />
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.816a2.38 2.38 0 01-.88.12 2.38 2.38 0 01-.736-.363 2.88 2.88 0 01-.184-.164 3.13 3.13 0 00-1.138-.432C6.63 4.04 6.33 4 6.028 4H5.25a.75.75 0 010-1.5h.778c.304 0 .604.04.88.12.276.079.528.203.736.363.07.055.131.11.184.164a3.13 3.13 0 001.138.432c.482.315.612.648.612.875V5.25a.75.75 0 011.5 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ActiveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.69L7.97 9.53a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ShipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 2a1 1 0 01.894.553l2.5 5 .5 1-.5-1-2.5-5A1 1 0 0110 2z" />
      <path
        fillRule="evenodd"
        d="M4 8a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8zm2 0h8v6H6V8z"
        clipRule="evenodd"
      />
      <path d="M2 14h16v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v1.323l1.95.326a1 1 0 01.777.981V14H8.692V6.63a1 1 0 01.777-.981L11.5 4.324V3a1 1 0 011-1zM6.692 6.63V14H3.308V6.63a1 1 0 01.777-.981L6 4.324V3a1 1 0 012 0v1.324l1.915.324a1 1 0 01.777.981z"
        clipRule="evenodd"
      />
      <path d="M4 16h12v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z" />
      <path d="M6 18h8v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1z" />
      <path fillRule="evenodd" d="M10 14a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M2 12l3-4 3 2 2-4 2 4 3-2 3 4H2z" />
      <path fillRule="evenodd" d="M2 14h16v2H2v-2z" clipRule="evenodd" />
    </svg>
  );
}

function BadgeIcon({ id, size = "w-3.5 h-3.5" }: { id: string; size?: string }) {
  switch (id) {
    case "verified":
      return <VerifiedIcon className={size} />;
    case "top-shipper":
      return <TopShipperIcon className={size} />;
    case "on-x":
      return <XIcon className={size} />;
    case "tips":
      return <TipsIcon className={size} />;
    case "active":
      return <ActiveIcon className={size} />;
    default:
      return null;
  }
}

function TierIcon({ tier, className }: { tier: BadgeTier; className?: string }) {
  switch (tier) {
    case 1:
      return <ShipIcon className={className} />;
    case 2:
      return <StarIcon className={className} />;
    case 3:
      return <TrophyIcon className={className} />;
    case 4:
      return <CrownIcon className={className} />;
    default:
      return <ShipIcon className={className} />;
  }
}

interface AgentBadgesProps {
  agent: Agent;
  variant?: BadgeVariant;
  className?: string;
  /** Pass proofs for portfolio variant to show full catalog (earned + locked) */
  proofs?: Proof[];
}

export function AgentBadges({ agent, variant = "full", className = "", proofs = [] }: AgentBadgesProps) {
  const badges = getBadges(agent);
  const isCompact = variant === "compact";
  const isPortfolio = variant === "portfolio";
  const [selectedBadge, setSelectedBadge] = useState<{ badge: BadgeDefinition; earned: boolean } | null>(null);

  const firstHeroId = badges.find((b) => b.hero)?.id ?? null;

  const hasDedicatedIcon = (id: string) => ["verified", "top-shipper", "on-x", "tips", "active"].includes(id);

  if (isPortfolio) {
    const statuses = getBadgeStatus(agent, proofs);
    const byTier = ([[1], [2], [3], [4]] as const).map(([tier]) => ({
      tier,
      label: TIER_LABELS[tier],
      statuses: statuses.filter((s) => s.badge.tier === tier),
    }));
    return (
      <>
        <div className={`space-y-8 ${className}`}>
          {byTier.map(({ tier, label, statuses: tierStatuses }) => (
            <div key={tier}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--fg-muted)]">{label}</h3>
                <div className="flex-1 h-px bg-[var(--border)]" aria-hidden />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tierStatuses.map(({ badge, earned }) => {
                  const tierClass = earned ? `badge-tier-${badge.tier}` : "badge-locked";
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => setSelectedBadge({ badge, earned })}
                      className={`rounded-2xl border-2 p-5 flex flex-col items-center text-center min-h-[160px] justify-center cursor-pointer transition hover:opacity-90 ${tierClass} ${earned && badge.id === firstHeroId ? "badge-glow" : ""}`}
                      title={earned ? badge.label : `${badge.label} — ${TIER_LABELS[badge.tier]} (locked)`}
                    >
                      <div className="mb-2 flex items-center justify-center">
                        {earned ? (
                          hasDedicatedIcon(badge.id) ? (
                            <BadgeIcon id={badge.id} size="w-12 h-12" />
                          ) : (
                            <TierIcon tier={badge.tier} className="w-12 h-12" />
                          )
                        ) : (
                          <LockIcon className="w-12 h-12" />
                        )}
                      </div>
                      <div className="font-bold text-base text-current">{badge.label}</div>
                      <p className="text-xs mt-0.5 opacity-90 text-current/90">{badge.description}</p>
                      <span className="text-[10px] uppercase tracking-wider mt-1.5 text-current/70">{TIER_LABELS[badge.tier]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Badge detail modal */}
        {selectedBadge && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black"
            onClick={() => setSelectedBadge(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-modal-title"
          >
            <div
              className={`rounded-2xl border-2 p-6 max-w-md w-full shadow-xl ${selectedBadge.earned ? `badge-tier-${selectedBadge.badge.tier}` : "badge-locked"} bg-[var(--bg)]`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center mb-4">
                <div className="mb-3 flex items-center justify-center">
                  {selectedBadge.earned ? (
                    hasDedicatedIcon(selectedBadge.badge.id) ? (
                      <BadgeIcon id={selectedBadge.badge.id} size="w-16 h-16" />
                    ) : (
                      <TierIcon tier={selectedBadge.badge.tier} className="w-16 h-16" />
                    )
                  ) : (
                    <LockIcon className="w-16 h-16" />
                  )}
                </div>
                <h2 id="badge-modal-title" className="text-xl font-bold text-[var(--fg)]">
                  {selectedBadge.badge.label}
                </h2>
                <span className="text-xs uppercase tracking-wider text-[var(--fg-muted)] mt-1">
                  {TIER_LABELS[selectedBadge.badge.tier]} tier
                </span>
                <p className="text-sm text-[var(--fg-muted)] mt-2">{selectedBadge.badge.description}</p>
              </div>
              <div className="border-t border-[var(--border)] pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-subtle)] mb-1">
                  Exactly what to do
                </h3>
                <p className="text-sm text-[var(--fg)]">
                  {selectedBadge.badge.howToEarn ?? selectedBadge.badge.description}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className={`text-xs font-medium ${selectedBadge.earned ? "text-teal-600 dark:text-teal-400" : "text-[var(--fg-muted)]"}`}>
                  {selectedBadge.earned ? "Earned" : "Not earned yet"}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--fg)] hover:bg-[var(--card-hover)] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {badges.map((badge) => (
        <span
          key={badge.id}
          className={`inline-flex items-center gap-1 rounded-full border font-medium ${badge.styleClass} ${
            badge.id === firstHeroId ? "badge-glow" : ""
          } ${isCompact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}
          title={badge.label}
        >
          <BadgeIcon id={badge.id} />
          <span className={isCompact ? "max-w-[4rem] truncate" : ""}>{badge.label}</span>
        </span>
      ))}
    </div>
  );
}
