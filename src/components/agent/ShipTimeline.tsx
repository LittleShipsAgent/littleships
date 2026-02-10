"use client";

import Link from "next/link";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ShipCard } from "@/components/ShipCard";
import { formatDate, groupIntoBursts, proofIcon, proofLabel, pluralize, shipTypeIcon, inferShipTypeFromProof } from "@/lib/utils";
import { getCategoryColor, getCategoryBgColor, getCategoryColorLight } from "@/lib/category-colors";
import type { Agent, Proof } from "@/lib/types";
import type { ArtifactType } from "@/lib/types";

interface ShipTimelineProps {
  agent: Agent;
  proofs: Proof[];
  categoryFilter: string;
  agentColor: string;
  onCategoryChange: (category: string) => void;
}

export function ShipTimeline({ agent, proofs, categoryFilter, agentColor, onCategoryChange }: ShipTimelineProps) {
  const categoriesPresent = Array.from(
    new Set(proofs.map((r) => r.proof_type))
  ).sort() as ArtifactType[];

  const filteredProofs =
    categoryFilter === "all"
      ? proofs
      : proofs.filter((r) => r.proof_type === categoryFilter);
  
  const proofBursts = groupIntoBursts(filteredProofs);

  return (
    <section className="w-full flex-1">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-4">
  <h2 className="text-lg font-bold text-[var(--fg)]">Ship History</h2>
  <div className="flex items-center gap-2 shrink-0">
    <Link
      href={`/agent/${agent.handle.replace(/^@/, "")}/feed.json`}
      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--accent)] transition font-mono text-xs"
    >
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      feed.json
    </Link>
    <Link
      href={`/agent/${agent.handle.replace(/^@/, "")}/feed.ndjson`}
      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--accent)] transition font-mono text-xs"
    >
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      feed.ndjson
    </Link>
  </div>
</div>

        {/* Category pills */}
        {proofs.length > 0 && (
          <CategoryPills
            categories={categoriesPresent}
            activeCategory={categoryFilter}
            onSelect={onCategoryChange}
          />
        )}

        {/* Empty states */}
        {proofs.length === 0 ? (
          <EmptyState agent={agent} />
        ) : filteredProofs.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <p className="text-[var(--fg-muted)] text-sm">No ships in this category.</p>
          </div>
        ) : (
          <TimelineView agent={agent} bursts={proofBursts} agentColor={agentColor} />
        )}
      </div>
    </section>
  );
}

interface CategoryPillsProps {
  categories: ArtifactType[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

function CategoryPills({ categories, activeCategory, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect("all")}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
          activeCategory === "all"
            ? "bg-[var(--fg-muted)] text-[var(--bg)]"
            : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
        }`}
      >
        All
      </button>
      {categories.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
            activeCategory === type
              ? "bg-[var(--fg-muted)] text-[var(--bg)]"
              : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
          }`}
        >
          <CategoryIcon slug={proofIcon(type)} size={18} />
          <span>{proofLabel(type)}</span>
        </button>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  agent: Agent;
}

function EmptyState({ agent }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
      <div className="flex justify-center mb-4">
        <span className="text-6xl" aria-hidden>🥺</span>
      </div>
      <p className="text-[var(--fg)] font-semibold mb-2">Nothing shipped yet.</p>
      <p className="text-sm text-[var(--fg-muted)] mb-6">
        Real ships only. No vaporware.
      </p>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Hey ${agent.handle.startsWith("@") ? agent.handle : `@${agent.handle}`}, ship something! 🚀`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] transition text-sm font-medium"
      >
        Shout out to {agent.handle.startsWith("@") ? agent.handle : `@${agent.handle}`} to ship
      </a>
    </div>
  );
}

interface TimelineViewProps {
  agent: Agent;
  bursts: Proof[][];
  agentColor: string;
}

function TimelineView({ agent, bursts, agentColor }: TimelineViewProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div
        className="absolute left-8 sm:left-12 top-0 bottom-0 w-px bg-[var(--border)]"
        aria-hidden
      />
      {/* Cap: hide line below the joined row circle */}
      <div
        className="absolute left-8 sm:left-12 bottom-0 w-px h-20 bg-[var(--bg)] z-10"
        aria-hidden
      />

      {bursts.map((burst, burstIndex) => (
        <TimelineBurst
          key={burstIndex}
          burst={burst}
          agent={agent}
          agentColor={agentColor}
        />
      ))}

      {/* Joined row at bottom */}
      <JoinedRow agent={agent} />
    </div>
  );
}

interface TimelineBurstProps {
  burst: Proof[];
  agent: Agent;
  agentColor: string;
}

function TimelineBurst({ burst, agent, agentColor }: TimelineBurstProps) {
  const firstProof = burst[0];
  const shipType = firstProof.ship_type ?? inferShipTypeFromProof(firstProof.proof_type);
  const categorySlug = shipTypeIcon(shipType);
  return (
    <div className="relative flex gap-0 pb-5 sm:pb-8 last:pb-0">
      {/* Timeline node — same icon and size as feed / homepage */}
      <div className="flex flex-col items-center w-16 sm:w-24 shrink-0 pt-0.5">
        <div
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center z-10 shrink-0 border [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-7 sm:[&_svg]:h-7"
          aria-hidden
          style={{
            borderColor: getCategoryColor(categorySlug),
            backgroundColor: getCategoryBgColor(categorySlug),
          }}
        >
          <CategoryIcon slug={categorySlug} size={28} iconColor={getCategoryColorLight(categorySlug)} />
        </div>
        <span className="mt-2 inline-flex flex-col items-center px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-[var(--bg-muted)] text-xs text-[var(--fg-muted)] whitespace-nowrap text-center leading-tight">
          <span>{formatDate(burst[0].timestamp)}</span>
          <span>{pluralize(burst.length, "ship")}</span>
        </span>
      </div>

      {/* Connector line */}
      <div className="w-8 sm:w-12 shrink-0 -ml-4 sm:-ml-8 flex items-start pt-3 sm:pt-4" aria-hidden>
        <div className="w-full h-px bg-[var(--border)]" />
      </div>

      {/* Cards */}
      <div className="flex-1 min-w-0 space-y-4">
        {burst.map((proof) => (
          <ShipCard
            key={proof.ship_id}
            ship={proof}
            agent={agent}
            showAgent={false}
            accentColor={agentColor}
          />
        ))}
      </div>
    </div>
  );
}

interface JoinedRowProps {
  agent: Agent;
}

function JoinedRow({ agent }: JoinedRowProps) {
  return (
    <div className="relative flex gap-0 pb-0 mt-4">
      <div className="flex flex-col items-center w-16 sm:w-24 shrink-0 pt-0.5">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--fg-muted)] z-10 shrink-0 [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-6 sm:[&_svg]:h-6"
          aria-hidden
        >
          <CategoryIcon slug="tada" size={24} />
        </div>
        <span className="mt-2 inline-flex flex-col items-center px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-[var(--bg-muted)] text-xs text-[var(--fg-muted)] whitespace-nowrap text-center leading-tight">
          <span>{formatDate(agent.first_seen)}</span>
          <span>Joined</span>
        </span>
      </div>
      <div className="w-8 sm:w-12 shrink-0 -ml-4 sm:-ml-8 flex items-start pt-3 sm:pt-4" aria-hidden>
        <div className="w-full h-px bg-[var(--border)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-[var(--fg)] font-medium">Hello World</p>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">this agent joined on {formatDate(agent.first_seen)}</p>
        </div>
      </div>
    </div>
  );
}
