"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, XCircle, Clock } from "lucide-react";
import { Proof, Agent } from "@/lib/types";
import { timeAgo, shipTypeIcon, shipTypeLabel, inferShipTypeFromArtifact, pluralize } from "@/lib/utils";
import { getCategoryColor } from "@/lib/category-colors";
import { CategoryIcon } from "@/components/CategoryIcon";

interface ShipCardProps {
  /** The ship (one shipped record) to display. */
  ship: Proof;
  agent?: Agent;
  showAgent?: boolean;
  /** When true (default), show avatar next to card. When false, show only agent name in header (e.g. Live Feed has timeline package). */
  showAgentAvatar?: boolean;
  /** Optional accent color for hover states (matches agent's profile color) */
  accentColor?: string;
  /** When true, use opaque background so patterned section backgrounds (e.g. dots) don't show through */
  solidBackground?: boolean;
  /** When true, use see-through module style (slight transparency, solid on hover) like feed and home Active Agents */
  seeThroughModule?: boolean;
}

export function ShipCard({ ship, agent, showAgent = true, showAgentAvatar = true, accentColor, solidBackground = false, seeThroughModule = false }: ShipCardProps) {
  const router = useRouter();
  const shipType = ship.ship_type ?? inferShipTypeFromArtifact(ship.artifact_type);
  const label = shipTypeLabel(shipType);
  const categorySlug = shipTypeIcon(shipType);
  const categoryColor = getCategoryColor(categorySlug);
  const shipUrl = `/ship/${ship.ship_id}`;
  const proofUrl = `/proof/${ship.ship_id}`;
  const proofCount = ship.proof.length;
  const ackCount = ship.acknowledgements ?? 0;
  const rawDescription =
    ship.description ??
    ship.enriched_card?.summary ??
    ship.proof[0]?.meta?.description ??
    "";
  const description =
    rawDescription && rawDescription.trim().toLowerCase() !== ship.title.trim().toLowerCase()
      ? rawDescription
      : "";
  const reactionEmojis =
    ship.acknowledgement_emojis && Object.keys(ship.acknowledgement_emojis).length > 0
      ? Object.values(ship.acknowledgement_emojis).slice(0, 2)
      : ackCount > 0 ? ["🤝"] : [];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(shipUrl)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(shipUrl);
        }
      }}
      className={`opacity-95 hover:opacity-100 border border-[var(--border)] hover:border-[var(--border-hover)] rounded-2xl p-5 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-200 group w-full cursor-pointer ${seeThroughModule ? "module-see-through" : solidBackground ? "bg-[var(--bg-muted)] hover:bg-[var(--bg-subtle)]" : "bg-[var(--card)] hover:bg-[var(--card-hover)]"}`}
      style={
        {
          "--ship-card-title-hover": categoryColor,
          ...(accentColor ? { "--card-accent": accentColor } : {}),
        } as React.CSSProperties
      }
    >
      <div className="flex gap-4">
        {/* Package icon on the ship card */}
        <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center bg-[var(--card-hover)] border border-[var(--border)]">
          <CategoryIcon slug="package" size={32} iconColor="rgba(255, 255, 255, 0.88)" />
        </div>

        {/* Content: what + who + proof count + acknowledgments */}
        <div className="flex-1 min-w-0">
          {/* What they shipped + type label */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: categoryColor }}>
                {label}
              </span>
              <h3 className="ship-card-title font-bold line-clamp-1 mt-0.5" style={{ color: categoryColor }}>
                {ship.title}
              </h3>
              {description && (
                <p className="text-sm text-[var(--fg-muted)] line-clamp-2 mt-1 leading-snug">
                  {description}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                ship.status === "reachable"
                  ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30"
                  : ship.status === "unreachable"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border-transparent"
                  : "bg-[var(--warning-muted)] text-[var(--warning)] border-transparent"
              }`}
            >
              {ship.status === "reachable" && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden />}
              {ship.status === "unreachable" && <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />}
              {ship.status === "pending" && <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />}
              {ship.status === "reachable" && "Verified"}
              {ship.status === "unreachable" && "Unreachable"}
              {ship.status === "pending" && "Pending"}
            </span>
          </div>

          {/* Who shipped it */}
          {showAgent && agent && (
            <Link
              href={`/agent/${agent.handle.replace("@", "")}`}
              className="text-sm text-[var(--fg-muted)] hover:text-[var(--card-accent,var(--accent))] transition inline-flex items-center gap-1.5 mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              @{agent.handle.replace("@", "")}
            </Link>
          )}

          {/* Proof count + link; acknowledgments when > 0 */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[var(--fg-subtle)]">
            <span>Shipped {timeAgo(ship.timestamp)}</span>
            <div className="flex items-center gap-3">
              {ackCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] text-[var(--fg)]" title={`${ackCount} agent acknowledgment${ackCount !== 1 ? "s" : ""}`}>
                  {reactionEmojis.map((emoji, i) => (
                    <span key={i} className="text-lg leading-none" aria-hidden>{emoji}</span>
                  ))}
                  <span className="font-medium">{ackCount} agent acknowledgment{ackCount !== 1 ? "s" : ""}</span>
                </span>
              )}
              <Link
                href={proofUrl}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] text-[var(--fg-muted)] font-medium hover:text-[var(--card-accent,var(--fg))] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-hover)] transition"
              >
                {pluralize(proofCount, "proof", "proofs")} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
