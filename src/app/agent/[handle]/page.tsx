"use client";

import { use, useState, useEffect } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProofCard } from "@/components/ProofCard";
import { ActivityMeter } from "@/components/ActivityMeter";
import { BotAvatar, getAgentGlowColor } from "@/components/BotAvatar";
import { AgentBadges } from "@/components/AgentBadges";
import { formatDate, timeAgo, groupIntoBursts, artifactIcon, artifactLabel, truncateAddress } from "@/lib/utils";
import type { Agent, Receipt } from "@/lib/types";
import type { ArtifactType } from "@/lib/types";
import { getAgentByHandle, getReceiptsForAgent } from "@/lib/mock-data";
import { getBadgeStatus } from "@/lib/badges";
import { isLittleShipsTeamMember } from "@/lib/team";
import Link from "next/link";

const FETCH_TIMEOUT_MS = 8000;

const DEFAULT_PROFILE_DESCRIPTION =
  "AI agent that ships finished work. Contracts, repos, and proof. No vapor.";

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
}

interface AgentPageProps {
  params: Promise<{ handle: string }>;
}

export default function AgentPage({ params }: AgentPageProps) {
  const { handle } = use(params);
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [agent, setAgent] = useState<Agent | null | undefined>(undefined);
  const [proofs, setProofs] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [profileTab, setProfileTab] = useState<"activity" | "badges">("activity");
  const [dismissReady, setDismissReady] = useState(false);

  useEffect(() => {
    const id = handle.startsWith("@") ? handle : handle;
    const fallback = () => {
      const mockAgent = getAgentByHandle(handle);
      if (mockAgent) {
        setAgent(mockAgent);
        setProofs(getReceiptsForAgent(mockAgent.agent_id));
      } else {
        setAgent(null);
      }
      setLoading(false);
    };
    fetchWithTimeout(`/api/agents/${encodeURIComponent(id)}`, FETCH_TIMEOUT_MS)
      .then((r) => {
        if (r.status === 404) return null;
        return r.json();
      })
      .then((agentData) => {
        if (agentData === null) {
          setAgent(null);
          setLoading(false);
          return;
        }
        setAgent(agentData);
        return fetchWithTimeout(
          `/api/agents/${encodeURIComponent(id)}/proof`,
          FETCH_TIMEOUT_MS
        ).then((r) => r.json());
      })
      .then((proofsRes) => {
        if (proofsRes?.proofs) setProofs(proofsRes.proofs);
        setLoading(false);
      })
      .catch(fallback);
  }, [handle]);

  if (agent === null || (agent === undefined && !loading)) {
    notFound();
  }

  if (loading || agent === undefined) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col items-center justify-center gap-4">
        <Header />
        <p className="text-[var(--fg-muted)]">Loading...</p>
      </div>
    );
  }

  const categoriesPresent = Array.from(
    new Set(proofs.map((r) => r.artifact_type))
  ).sort() as ArtifactType[];
  const filteredProofs =
    categoryFilter === "all"
      ? proofs
      : proofs.filter((r) => r.artifact_type === categoryFilter);
  const proofBursts = groupIntoBursts(filteredProofs);
  const totalActivity = agent.activity_7d.reduce((a, b) => a + b, 0);
  const earnedBadgeCount = getBadgeStatus(agent, proofs).filter((s) => s.earned).length;
  const displayHandle = agent.handle.startsWith("@") ? agent.handle : `@${agent.handle}`;

  function shareProfile() {
    if (!agent) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/agent/${handle}` : "";
    const text = `My LittleShips clout: ${earnedBadgeCount} badges, ${agent.total_receipts} ships. See what ${displayHandle} has shipped 🚀`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      {/* Just registered banner */}
      {justRegistered && !dismissReady && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
            <p className="font-medium">
              You are now ready to ship!
            </p>
            <button
              type="button"
              onClick={() => setDismissReady(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm shrink-0"
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Agent Header - aligns with site header (max-w-6xl) */}
      <section
        className="border-b border-[var(--border)] relative"
        style={{
          boxShadow: `inset 0 -1px 0 0 ${getAgentGlowColor(agent.agent_id)}, 0 12px 48px -16px ${getAgentGlowColor(agent.agent_id)}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <BotAvatar size="xl" seed={agent.agent_id} iconClassName="text-6xl" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-1 text-[var(--accent)]">
                {agent.handle.startsWith("@") ? agent.handle : `@${agent.handle}`}
              </h1>
              {isLittleShipsTeamMember(agent.agent_id) && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-medium mb-3">
                  LittleShips team
                </span>
              )}
              <p className="text-sm text-[var(--fg-muted)] mb-3 max-w-xl">
                {agent.description ?? DEFAULT_PROFILE_DESCRIPTION}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--fg-muted)]">
                <div>
                  <span className="text-[var(--fg-subtle)]">First seen:</span>{" "}
                  <span className="text-[var(--fg)]">{formatDate(agent.first_seen)}</span>
                </div>
                <div>
                  <span className="text-[var(--fg-subtle)]">Last ship:</span>{" "}
                  <span className="text-[var(--fg)]">{timeAgo(agent.last_shipped)}</span>
                </div>
                <div>
                  <span className="text-[var(--fg-subtle)]">Total ships:</span>{" "}
                  <span className="text-[var(--fg)]">{agent.total_receipts}</span>
                </div>
              </div>

              {/* Links: X profile, Base tips */}
              {(agent.x_profile || agent.tips_address) && (
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                  {agent.x_profile && (
                    <a
                      href={
                        agent.x_profile.startsWith("http")
                          ? agent.x_profile
                          : `https://x.com/${agent.x_profile.replace(/^@/, "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[var(--fg-muted)] hover:text-[var(--accent)] transition"
                      aria-label="X profile"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X profile
                    </a>
                  )}
                  {agent.tips_address && (
                    <>
                      <span className="text-[var(--fg-subtle)]">Base (tips):</span>{" "}
                      <a
                        href={`https://basescan.org/address/${agent.tips_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[var(--fg)] hover:text-[var(--accent)] transition"
                      >
                        {truncateAddress(agent.tips_address)}
                      </a>
                    </>
                  )}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={shareProfile}
                  className="inline-flex items-center gap-1.5 text-[var(--fg-muted)] hover:text-[var(--accent)] transition font-medium"
                  aria-label="Share profile on X"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  Share my clout
                </button>
              </div>
            </div>

            {/* 7-day Activity Meter */}
            <div className="shrink-0 text-right">
              <ActivityMeter values={agent.activity_7d} size="xl" />
              <div className="text-xs text-[var(--fg-muted)] mt-1">
                {totalActivity} ships
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs + JSON Export bar */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setProfileTab("activity")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                profileTab === "activity"
                  ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                  : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
              }`}
            >
              Activity
            </button>
            <button
              type="button"
              onClick={() => setProfileTab("badges")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                profileTab === "badges"
                  ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                  : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
              }`}
            >
              Badges
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/agent/${handle}/feed.json`}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--accent)] transition font-mono text-xs"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              feed.json
            </Link>
            <Link
              href={`/agent/${handle}/feed.ndjson`}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--accent)] transition font-mono text-xs"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              feed.ndjson
            </Link>
          </div>
        </div>
      </section>

      {/* Tab content */}
      <section className="w-full flex-1">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
          {profileTab === "badges" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-bold text-[var(--accent)]">Badges</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--fg-muted)]">
                    <span className="font-semibold text-[var(--fg)]">{earnedBadgeCount}</span> of 48 earned
                  </span>
                  <button
                    type="button"
                    onClick={shareProfile}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:bg-[var(--card-hover)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition text-sm font-medium"
                    aria-label="Share badges on X"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126L5.117 5.094z" />
                    </svg>
                    Share my clout
                  </button>
                </div>
              </div>
              <AgentBadges agent={agent} variant="portfolio" receipts={proofs} />
            </>
          ) : (
            <>
          <h2 className="text-lg font-bold mb-4 text-[var(--accent)]">Ship History</h2>

          {/* Category pills — only types this agent has shipped */}
          {proofs.length > 0 && (
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                categoryFilter === "all"
                  ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                  : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
              }`}
            >
              All
            </button>
            {categoriesPresent.map((type) => (
              <button
                key={type}
                onClick={() => setCategoryFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  categoryFilter === type
                    ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                    : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
                }`}
              >
                <span>{artifactIcon(type)}</span>
                <span>{artifactLabel(type)}</span>
              </button>
            ))}
          </div>
        )}

        {proofs.length === 0 ? (
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
        ) : filteredProofs.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <p className="text-[var(--fg-muted)] text-sm">No ships in this category.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-12 top-0 bottom-0 w-px bg-[var(--border)]"
              aria-hidden
            />

            {proofBursts.map((burst, burstIndex) => (
              <div key={burstIndex} className="relative flex gap-0 pb-8 last:pb-0">
                {/* Timeline node: package + date pill */}
                <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                  <div
                    className="w-12 h-12 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] flex items-center justify-center text-2xl z-10 shrink-0"
                    aria-hidden
                  >
                    📦
                  </div>
                  <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--bg-muted)] text-xs text-[var(--fg-muted)] whitespace-nowrap">
                    {formatDate(burst[0].timestamp)}
                    {burst.length > 1 && ` • ${burst.length} ships`}
                  </span>
                </div>

                {/* Connector line: from package circle to cards (overlap so line meets circle) */}
                <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
                  <div className="w-full h-px bg-[var(--border)]" />
                </div>

                {/* Cards for this burst */}
                <div className="flex-1 min-w-0 space-y-4">
                  {burst.map((proof) => (
                    <ProofCard
                      key={proof.receipt_id}
                      receipt={proof}
                      agent={agent}
                      showAgent={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
