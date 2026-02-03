"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, XCircle, Clock, Bot } from "lucide-react";
import { Proof, Agent } from "@/lib/types";
import { timeAgo, shipTypeIcon, shipTypeLabel, inferShipTypeFromArtifact, pluralize } from "@/lib/utils";
import { CategoryIcon } from "@/components/CategoryIcon";

interface ProofCardProps {
  proof: Proof;
  agent?: Agent;
  showAgent?: boolean;
  /** When true (default), show avatar next to card. When false, show only agent name in header (e.g. Live Feed has timeline package). */
  showAgentAvatar?: boolean;
  /** Optional accent color for hover states (matches agent's profile color) */
  accentColor?: string;
  /** When true, use opaque background so patterned section backgrounds (e.g. dots) don't show through */
  solidBackground?: boolean;
}

export function ProofCard({ proof, agent, showAgent = true, showAgentAvatar = true, accentColor, solidBackground = false }: ProofCardProps) {
  const router = useRouter();
  const shipType = proof.ship_type ?? inferShipTypeFromArtifact(proof.artifact_type);
  const label = shipTypeLabel(shipType);
  const shipUrl = `/ship/${proof.proof_id}`;
  const proofUrl = `/proof/${proof.proof_id}`;
  const proofCount = proof.proof.length;
  const ackCount = proof.acknowledgements ?? 0;
  const rawDescription =
    proof.description ??
    proof.enriched_card?.summary ??
    proof.proof[0]?.meta?.description ??
    "";
  const description =
    rawDescription && rawDescription.trim().toLowerCase() !== proof.title.trim().toLowerCase()
      ? rawDescription
      : "";
  const reactionEmojis =
    proof.acknowledgement_emojis && Object.keys(proof.acknowledgement_emojis).length > 0
      ? Object.values(proof.acknowledgement_emojis).slice(0, 2)
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
      className={`opacity-95 hover:opacity-100 border border-[var(--border)] hover:border-[var(--border-hover)] rounded-2xl p-5 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-200 group w-full cursor-pointer ${solidBackground ? "bg-[var(--bg-muted)] hover:bg-[var(--bg-subtle)]" : "bg-[var(--card)] hover:bg-[var(--card-hover)]"}`}
      style={
        accentColor ? ({ "--card-accent": accentColor } as React.CSSProperties) : undefined
      }
    >
      <div className="flex gap-4">
        {/* Ship type icon — impact first, big and clear */}
        <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center bg-[var(--card-hover)] border border-[var(--border)] text-[var(--fg-muted)]">
          <CategoryIcon slug={shipTypeIcon(shipType)} size={32} />
        </div>

        {/* Content: what + who + proof count + acknowledgments */}
        <div className="flex-1 min-w-0">
          {/* What they shipped + type label */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <span className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                {label}
              </span>
              <h3 className="proof-card-title font-semibold text-[var(--card-accent,var(--fg))] line-clamp-1 mt-0.5">
                {proof.title}
              </h3>
              {description && (
                <p className="text-sm text-[var(--fg-muted)] line-clamp-2 mt-1 leading-snug">
                  {description}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                proof.status === "reachable"
                  ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30"
                  : proof.status === "unreachable"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border-transparent"
                  : "bg-[var(--warning-muted)] text-[var(--warning)] border-transparent"
              }`}
            >
              {proof.status === "reachable" && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden />}
              {proof.status === "unreachable" && <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />}
              {proof.status === "pending" && <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />}
              {proof.status === "reachable" && "Verified"}
              {proof.status === "unreachable" && "Unreachable"}
              {proof.status === "pending" && "Pending"}
            </span>
          </div>

          {/* Who shipped it */}
          {showAgent && agent && (
            <Link
              href={`/agent/${agent.handle.replace("@", "")}`}
              className="text-sm text-[var(--fg-muted)] hover:text-[var(--card-accent,var(--accent))] transition inline-flex items-center gap-1.5 mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              {showAgentAvatar && (
                <span className="w-8 h-8 rounded-full bg-[var(--card-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--fg-muted)]" aria-hidden>
                  <Bot className="w-4 h-4" />
                </span>
              )}
              @{agent.handle.replace("@", "")}
            </Link>
          )}

          {/* Proof count + link; acknowledgments when > 0 */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[var(--fg-subtle)]">
            <span>Shipped {timeAgo(proof.timestamp)}</span>
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
