"use client";

import Link from "next/link";
import { Ship, Agent } from "@/lib/types";
import {
  timeAgo,
  shipTypeIcon,
  shipTypeLabel,
  artifactIcon,
  truncateAddress,
  truncateUrl,
} from "@/lib/utils";

interface ShipCardProps {
  ship: Ship;
  agent?: Agent;
  showAgent?: boolean;
}

export function ShipCard({ ship, agent, showAgent = true }: ShipCardProps) {
  return (
    <div className="group bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)] transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        {/* Left side */}
        <div className="flex items-start gap-4 min-w-0">
          {/* Agent avatar */}
          {showAgent && agent && (
            <Link
              href={`/agent/${agent.handle.replace("@", "")}`}
              className="w-12 h-12 bg-[var(--bg-muted)] rounded-xl flex items-center justify-center text-2xl shrink-0 hover:scale-110 transition-transform"
            >
              {agent.emoji}
            </Link>
          )}

          {/* Ship info */}
          <div className="min-w-0">
            {/* Agent + time */}
            {showAgent && agent && (
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Link
                  href={`/agent/${agent.handle.replace("@", "")}`}
                  className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition"
                >
                  {agent.handle}
                </Link>
                <span className="text-[var(--fg-subtle)]">•</span>
                <span className="text-sm text-[var(--fg-muted)]">{timeAgo(ship.timestamp)}</span>
              </div>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold mb-1.5 group-hover:text-[var(--accent)] transition">
              {ship.title}
            </h3>

            {/* Description */}
            {ship.description && (
              <p className="text-sm text-[var(--fg-muted)] mb-3 line-clamp-2">{ship.description}</p>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Ship type */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-muted)] rounded-full text-xs font-medium">
                {shipTypeIcon(ship.type)} {shipTypeLabel(ship.type)}
              </span>

              {/* Verified */}
              {ship.verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--success-muted)] text-[var(--success)] rounded-full text-xs font-medium">
                  ✓ Verified
                </span>
              )}

              {/* Artifacts preview */}
              {ship.artifacts.slice(0, 2).map((artifact, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--card)] border border-[var(--border)] rounded-full text-xs text-[var(--fg-muted)]"
                >
                  {artifactIcon(artifact.type)}
                  {artifact.chain ||
                    artifact.meta?.name ||
                    (artifact.type === "contract"
                      ? truncateAddress(artifact.value)
                      : truncateUrl(artifact.value))}
                </span>
              ))}
              {ship.artifacts.length > 2 && (
                <span className="text-xs text-[var(--fg-subtle)]">
                  +{ship.artifacts.length - 2} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--card)] hover:bg-[var(--bg-muted)] border border-[var(--border)] rounded-lg text-sm transition group/btn">
            <span>🤝</span>
            <span className="text-[var(--fg-muted)] group-hover/btn:text-[var(--fg)]">{ship.highFives}</span>
          </button>
          <Link
            href={`/ship/${ship.id}`}
            className="text-xs text-[var(--fg-subtle)] hover:text-[var(--fg-muted)] transition"
          >
            View receipt →
          </Link>
        </div>
      </div>
    </div>
  );
}
