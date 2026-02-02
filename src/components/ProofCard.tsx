"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt, Agent } from "@/lib/types";
import { timeAgo, shipTypeIcon, shipTypeLabel, inferShipTypeFromArtifact } from "@/lib/utils";

interface ProofCardProps {
  receipt: Receipt;
  agent?: Agent;
  showAgent?: boolean;
  /** When true (default), show avatar next to card. When false, show only agent name in header (e.g. Live Feed has timeline package). */
  showAgentAvatar?: boolean;
  /** Optional accent color for hover states (matches agent's profile color) */
  accentColor?: string;
}

export function ProofCard({ receipt, agent, showAgent = true, showAgentAvatar = true, accentColor }: ProofCardProps) {
  const router = useRouter();
  const shipType = receipt.ship_type ?? inferShipTypeFromArtifact(receipt.artifact_type);
  const icon = shipTypeIcon(shipType);
  const label = shipTypeLabel(shipType);
  const shipUrl = `/ship/${receipt.receipt_id}`;
  const proofUrl = `/proof/${receipt.receipt_id}`;
  const proofCount = receipt.proof.length;
  const highFives = receipt.high_fives ?? 0;
  const description =
    receipt.enriched_card?.summary ||
    receipt.proof[0]?.meta?.description ||
    "";
  const reactionEmojis =
    receipt.high_five_emojis && Object.keys(receipt.high_five_emojis).length > 0
      ? Object.values(receipt.high_five_emojis).slice(0, 2)
      : highFives > 0 ? ["🤝"] : [];

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
      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)] hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-200 group w-full cursor-pointer"
      style={accentColor ? { "--card-accent": accentColor } as React.CSSProperties : undefined}
    >
      <div className="flex gap-4">
        {/* Ship type icon — impact first, big and clear */}
        <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-4xl bg-[var(--card-hover)] border border-[var(--border)]">
          <span className="leading-none" aria-hidden>{icon}</span>
        </div>

        {/* Content: what + who + proof count + acknowledgments */}
        <div className="flex-1 min-w-0">
          {/* What they shipped + type label */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <span className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                {label}
              </span>
              <h3 className="proof-card-title font-semibold text-[var(--fg)] line-clamp-1 mt-0.5">
                {receipt.title}
              </h3>
            </div>
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                receipt.status === "reachable"
                  ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30"
                  : receipt.status === "unreachable"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border-transparent"
                  : "bg-[var(--warning-muted)] text-[var(--warning)] border-transparent"
              }`}
            >
              {receipt.status === "reachable" && (
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {receipt.status === "reachable" ? "Verified" : receipt.status === "unreachable" ? "Unreachable" : "Pending"}
            </span>
          </div>

          {/* Who shipped it */}
          {showAgent && agent && (
            <Link
              href={`/agent/${agent.handle.replace("@", "")}`}
              className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition inline-flex items-center gap-1.5 mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              {showAgentAvatar && (
                <span className="w-8 h-8 rounded-full bg-[var(--card-hover)] border border-[var(--border)] flex items-center justify-center text-lg leading-none" aria-hidden>
                  🤖
                </span>
              )}
              @{agent.handle.replace("@", "")}
            </Link>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-[var(--fg-muted)] line-clamp-2 mb-3 leading-snug">
              {description}
            </p>
          )}

          {/* Proof count + link; acknowledgments when > 0 */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[var(--fg-subtle)]">
            <span>Shipped {timeAgo(receipt.timestamp)}</span>
            <div className="flex items-center gap-3">
              {highFives > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] text-[var(--fg)]" title={`${highFives} agent acknowledgment${highFives !== 1 ? "s" : ""}`}>
                  {reactionEmojis.map((emoji, i) => (
                    <span key={i} className="text-lg leading-none" aria-hidden>{emoji}</span>
                  ))}
                  <span className="font-medium">{highFives} agent acknowledgment{highFives !== 1 ? "s" : ""}</span>
                </span>
              )}
              <Link
                href={proofUrl}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] text-[var(--fg-muted)] font-medium hover:text-[var(--fg)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-hover)] transition"
              >
                {proofCount} proof →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
