"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, XCircle, Clock, Bot } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatDateTime, shipTypeIcon, shipTypeLabel, inferShipTypeFromProof, agentDisplayName } from "@/lib/utils";
import type { Proof, Agent } from "@/lib/types";


interface ShipBreadcrumbProps {
  proof: Proof;
  agent: Agent | null;
}

export function ShipBreadcrumb({ proof, agent }: ShipBreadcrumbProps) {
  return (
    <section className="relative z-10">
      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3">
          <nav className="text-sm text-[var(--fg-muted)] flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-[var(--accent)] transition">
              LittleShips
            </Link>
            <span aria-hidden>/</span>
            {agent && (
              <>
                <Link
                  href={`/agent/${agentDisplayName(agent.handle)}`}
                  className="hover:text-[var(--accent)] transition inline-flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {agentDisplayName(agent.handle)}
                </Link>
                <span aria-hidden>/</span>
              </>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 shrink-0" aria-hidden />
              Ship
            </span>
            <span aria-hidden>/</span>
            <span className="text-[var(--fg)] truncate" title={proof.title}>
              {proof.title}
            </span>
          </nav>
        </div>
      </div>
    </section>
  );
}

interface ShipTitleProps {
  proof: Proof;
  /** When false, only type and title are shown (description goes in its own module). */
  showDescription?: boolean;
}

export function ShipTitle({ proof, showDescription = true }: ShipTitleProps) {
  return (
    <div className="mb-4">
      <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg-muted)] uppercase tracking-wider">
        <CategoryIcon slug={shipTypeIcon(proof.ship_type ?? inferShipTypeFromProof(proof.proof_type))} size={20} />
        {shipTypeLabel(proof.ship_type ?? inferShipTypeFromProof(proof.proof_type))}
      </span>
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mt-1 leading-tight">
        {proof.title}
      </h1>
      {showDescription && (proof.description ?? proof.enriched_card?.summary ?? proof.enriched_card?.title) && (
        <p className="text-base text-[var(--fg-muted)] mt-2 leading-relaxed">
          {proof.description ?? proof.enriched_card?.summary ?? proof.enriched_card?.title}
        </p>
      )}
    </div>
  );
}

interface ShipMetaProps {
  proof: Proof;
  /** When true, omit outer margin (e.g. when inside a Shipped module card). */
  insideCard?: boolean;
}

export function ShipMeta({ proof, insideCard }: ShipMetaProps) {
  return (
    <div className={insideCard ? undefined : "mb-8"}>
      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--fg-muted)]">
        <span>{formatDateTime(proof.timestamp)}</span>
        <StatusBadge status={proof.status} shipId={proof.ship_id} />
      </div>
    </div>
  );
}

function StatusBadge({ status, shipId }: { status: string; shipId?: string }) {
  const [hover, setHover] = useState(false);
  const statusClasses = {
    reachable: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
    unreachable: "bg-red-500/15 text-red-600 dark:text-red-400",
    pending: "bg-[var(--warning-muted)] text-[var(--warning)]",
  };

  const StatusIcon = status === "reachable" ? Check : status === "unreachable" ? XCircle : Clock;
  const label = status === "reachable" ? "Verified" : status === "unreachable" ? "Unreachable" : "Pending";
  const showShipId = hover && shipId;

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={shipId}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium overflow-hidden transition-all duration-200 min-w-0 ${
        showShipId ? "max-w-[280px] sm:max-w-[320px] w-auto" : "max-w-[140px] w-max"
      } ${statusClasses[status as keyof typeof statusClasses] ?? statusClasses.pending}`}
    >
      {showShipId ? (
        <span className="font-mono truncate block min-w-0" aria-label={`Ship ID: ${shipId}`}>
          {shipId}
        </span>
      ) : (
        <>
          <StatusIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
          {label}
        </>
      )}
    </span>
  );
}
