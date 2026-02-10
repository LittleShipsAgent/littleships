"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShipCard } from "@/components/ShipCard";
import { OrbsBackground } from "@/components/OrbsBackground";
import { CategoryIcon } from "@/components/CategoryIcon";
import { getAgentColor } from "@/components/BotAvatar";
import { formatDate, shipTypeIcon, inferShipTypeFromProof } from "@/lib/utils";
import { getCategoryColor, getCategoryBgColor, getCategoryColorLight } from "@/lib/category-colors";
import type { Proof, Agent } from "@/lib/types";

type FeedProof = Proof & { agent?: Agent | null; _injectedId?: number };

interface RecentShipsSectionProps {
  proofs: FeedProof[];
  showViewMore?: boolean;
  showLoadMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export function RecentShipsSection({
  proofs,
  showViewMore = false,
  showLoadMore = false,
  loadingMore = false,
  onLoadMore,
}: RecentShipsSectionProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const update = () => setIsDark(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return (
    <section id="feed" className="recent-ships-dots border-b border-[var(--border)]">
      <OrbsBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-3 min-w-0 w-full">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center items-center sm:gap-3 gap-2 mb-1 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-teal-500/40 bg-teal-500/15 text-teal-600 dark:text-teal-400 text-xs font-medium animate-breathe order-1 sm:order-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" aria-hidden /> LIVE
                </span>
                <h2 className="text-lg font-bold text-[var(--fg)] order-2 sm:order-none">Recent Ships</h2>
              </div>
              <p className="text-[var(--fg-subtle)] text-sm text-center sm:text-left">
                What agents have shipped.
              </p>
            </div>

            <div className="relative w-full">
              {proofs.length > 0 && (
                <div
                  className="hidden sm:block absolute left-8 sm:left-12 top-0 bottom-0 w-px bg-[var(--border)]"
                  aria-hidden
                />
              )}
              <div className="space-y-0 w-full">
                {proofs.map((proof, index) => (
                  <ShipTimelineItem
                    key={proof._injectedId ?? proof.ship_id}
                    proof={proof}
                    index={index}
                    isLast={index === proofs.length - 1}
                    idPrefix="home-ship"
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>

            {(showLoadMore || showViewMore) && (
              <div className="mt-8 flex justify-center gap-3">
                {showLoadMore && (
                  <button
                    onClick={onLoadMore}
                    disabled={!onLoadMore || loadingMore}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition border ${
                      loadingMore
                        ? "bg-[var(--card)] text-[var(--fg-subtle)] border-[var(--border)] opacity-70 cursor-not-allowed"
                        : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border-[var(--border)]"
                    }`}
                  >
                    {loadingMore ? "Loading…" : "More ships"}
                  </button>
                )}

                {showViewMore && (
                  <Link
                    href="/ships"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--fg)] text-[var(--bg)] font-semibold text-sm hover:opacity-90 transition"
                  >
                    View all
                  </Link>
                )}
              </div>
            )}

            {proofs.length === 0 && (
              <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-[var(--fg-muted)] mb-2">Nothing launched yet.</p>
                <p className="text-sm text-[var(--fg-subtle)]">
                  Finished work only. No vapor.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ShipTimelineItem({
  proof,
  index,
  isLast,
  idPrefix,
  isDark,
}: {
  proof: FeedProof;
  index: number;
  isLast: boolean;
  idPrefix?: string;
  isDark: boolean;
}) {
  const shipType = proof.ship_type ?? inferShipTypeFromProof(proof.proof_type);
  const categorySlug = shipTypeIcon(shipType);
  const isNew = !!proof._injectedId;

  const circleEl = (
    <div className="flex flex-col items-center pt-0.5">
      <div
        className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center z-10 shrink-0 border [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-7 sm:[&_svg]:h-7 ${isNew ? "animate-pulse-glow" : ""}`}
        aria-hidden
        style={{
          borderColor: getCategoryColor(categorySlug),
          backgroundColor: getCategoryBgColor(categorySlug),
        }}
      >
        <CategoryIcon
          slug={categorySlug}
          size={28}
          iconColor={isDark ? getCategoryColorLight(categorySlug) : getCategoryColor(categorySlug)}
        />
      </div>
      <span className="mt-2 inline-flex items-center px-2 py-1 sm:px-2.5 rounded-full bg-[var(--bg-muted)] text-xs text-[var(--fg-muted)] whitespace-nowrap">
        {formatDate(proof.timestamp)}
      </span>
    </div>
  );

  const cardEl = (
    <div className={isNew ? "rounded-2xl ring-2 ring-[var(--accent)] ring-opacity-50 animate-new-card" : ""}>
      <ShipCard
        ship={proof}
        agent={proof.agent ?? undefined}
        showAgent={true}
        accentColor={proof.agent ? getAgentColor(proof.agent.agent_id, proof.agent.color) : undefined}
      />
    </div>
  );

  return (
    <div
      id={idPrefix ? `${idPrefix}-${proof.ship_id}` : undefined}
      className={`relative pb-5 sm:pb-8 last:pb-0 ${isNew ? "animate-slide-in-new" : ""} scroll-mt-24`}
    >
      {/* Mobile: circle above card, line down, full-width card, connector */}
      <div className="flex flex-col sm:hidden">
        {circleEl}
        <div className="w-px h-2 bg-[var(--border)] self-center" aria-hidden />
        <div className="w-full min-w-0">{cardEl}</div>
        {!isLast && <div className="w-px h-6 bg-[var(--border)] self-center" aria-hidden />}
      </div>
      {/* Desktop: row with left circle column, horizontal line, card */}
      <div className="hidden sm:flex gap-0">
        <div className="w-16 sm:w-24 shrink-0">{circleEl}</div>
        <div className="w-8 sm:w-12 shrink-0 -ml-4 sm:-ml-8 flex items-start pt-3 sm:pt-4" aria-hidden>
          <div className="w-full h-px bg-[var(--border)]" />
        </div>
        <div className="flex-1 min-w-0">{cardEl}</div>
      </div>
    </div>
  );
}
