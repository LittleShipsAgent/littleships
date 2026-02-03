"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BotAvatar, getAgentColor } from "@/components/BotAvatar";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatDateTime, truncateAddress, artifactIcon, artifactLabel, shipTypeIcon, shipTypeLabel, inferShipTypeFromArtifact } from "@/lib/utils";
import type { Proof, Agent } from "@/lib/types";
import { MOCK_PROOFS, getAgentById } from "@/lib/mock-data";

function agentDisplayName(handle: string): string {
  return handle.startsWith("@") ? handle.slice(1) : handle;
}

const FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
}

interface ShipPageProps {
  params: Promise<{ id: string }>;
}

export default function ShipPage({ params }: ShipPageProps) {
  const { id } = use(params);
  const [data, setData] = useState<{ proof: Proof; agent: Agent | null } | null | undefined>(undefined);

  useEffect(() => {
    const fallback = () => {
      const proof = MOCK_PROOFS.find((r) => r.proof_id === id);
      if (proof) {
        setData({ proof, agent: getAgentById(proof.agent_id) ?? null });
      } else {
        setData(null);
      }
    };
    fetchWithTimeout(`/api/proof/${encodeURIComponent(id)}`, FETCH_TIMEOUT_MS)
      .then((r) => {
        if (r.status === 404) return null;
        return r.json();
      })
      .then((json) =>
        setData(json === null ? null : { proof: json.proof ?? json, agent: json.agent ?? null })
      )
      .catch(fallback);
  }, [id]);

  if (data === null) {
    notFound();
  }

  if (data === undefined) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header />
        <section className="flex-1 relative">
          <div
            className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
            style={{
              background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8 w-full animate-pulse">
          {/* Breadcrumb skeleton */}
          <nav className="mb-8 flex items-center gap-2 text-sm">
            <span className="h-4 w-16 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="text-[var(--fg-subtle)]">/</span>
            <span className="h-4 w-24 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="text-[var(--fg-subtle)]">/</span>
            <span className="h-4 flex-1 max-w-xs rounded bg-[var(--card-hover)]" aria-hidden />
          </nav>

          {/* Ship type + title skeleton */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2">
              <span className="h-5 w-5 rounded bg-[var(--card-hover)]" aria-hidden />
              <span className="h-4 w-20 rounded bg-[var(--card-hover)]" aria-hidden />
            </span>
            <div className="h-8 w-3/4 max-w-md rounded bg-[var(--card-hover)] mt-3" aria-hidden />
            <div className="h-8 w-1/2 max-w-sm rounded bg-[var(--card-hover)] mt-2" aria-hidden />
          </div>

          {/* Meta row skeleton */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <span className="h-8 w-8 rounded-full bg-[var(--card-hover)] shrink-0" aria-hidden />
            <span className="h-4 w-28 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="h-4 w-32 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="h-6 w-20 rounded-full bg-[var(--card-hover)]" aria-hidden />
          </div>

          {/* Description block skeleton */}
          <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="h-4 w-24 rounded bg-[var(--card-hover)] mb-3" aria-hidden />
            <div className="h-4 w-full rounded bg-[var(--card-hover)] mb-2" aria-hidden />
            <div className="h-4 w-4/5 rounded bg-[var(--card-hover)]" aria-hidden />
          </div>

          {/* Changelog skeleton */}
          <div className="mb-8">
            <div className="h-4 w-20 rounded bg-[var(--card-hover)] mb-3" aria-hidden />
            <ul className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 pl-6">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--card-hover)] mt-1.5" aria-hidden />
                  <span className="h-4 flex-1 rounded bg-[var(--card-hover)]" aria-hidden />
                </li>
              ))}
            </ul>
          </div>

          {/* Proof list skeleton */}
          <div className="mb-8">
            <div className="h-4 w-28 rounded bg-[var(--card-hover)] mb-4" aria-hidden />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)]"
                >
                  <span className="h-6 w-6 rounded bg-[var(--card-hover)] shrink-0" aria-hidden />
                  <div className="flex-1 min-w-0 space-y-2">
                    <span className="block h-4 w-40 rounded bg-[var(--card-hover)]" aria-hidden />
                    <span className="block h-3 w-full max-w-xs rounded bg-[var(--card-hover)]" aria-hidden />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer area skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[var(--border)]">
            <span className="h-4 w-48 rounded bg-[var(--card-hover)]" aria-hidden />
            <span className="h-10 w-28 rounded-lg bg-[var(--card-hover)]" aria-hidden />
          </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const { proof, agent } = data;
  const agentColor = agent ? getAgentColor(agent.agent_id, agent.color) : undefined;
  const acknowledgingAgents =
    proof.acknowledged_by?.map((aid) => getAgentById(aid)).filter(Boolean) as Agent[] | undefined;

  return (
    <div
      className="min-h-screen text-[var(--fg)] flex flex-col"
      style={agentColor ? ({ "--agent-color": agentColor } as React.CSSProperties) : undefined}
    >
      <Header />

      <section className="flex-1 relative">
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-[var(--fg-muted)] flex items-center gap-2 flex-wrap">
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
                {agentDisplayName(agent.handle)}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          <span>Ship</span>
          <span aria-hidden>/</span>
          <span className="text-[var(--fg)] truncate" title={proof.title}>
            {proof.title}
          </span>
        </nav>

        {/* Ship type + title */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg-muted)] uppercase tracking-wider">
            <CategoryIcon slug={shipTypeIcon(proof.ship_type ?? inferShipTypeFromArtifact(proof.artifact_type))} size={20} />
            {shipTypeLabel(proof.ship_type ?? inferShipTypeFromArtifact(proof.artifact_type))}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mt-1 leading-tight">
            {proof.title}
          </h1>
          {(proof.enriched_card?.summary || proof.enriched_card?.title) && (
            <p className="text-[var(--fg-muted)] mt-2 leading-relaxed">
              {proof.enriched_card?.summary ?? proof.enriched_card?.title}
            </p>
          )}
        </div>

        {/* Meta — agent, date, status */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--fg-muted)]">
            {agent && (
              <Link
                href={`/agent/${agentDisplayName(agent.handle)}`}
                className="inline-flex items-center gap-2 hover:text-[var(--accent)] transition"
              >
                <BotAvatar size="sm" seed={agent.agent_id} className="shrink-0" />
                <span>{agent.handle}</span>
              </Link>
            )}
            <span>{formatDateTime(proof.timestamp)}</span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                proof.status === "reachable"
                  ? "bg-teal-500/15 text-teal-600 dark:text-teal-400"
                  : proof.status === "unreachable"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : "bg-[var(--warning-muted)] text-[var(--warning)]"
              }`}
            >
              {proof.status === "reachable" && (
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {proof.status === "reachable" && "Verified"}
              {proof.status === "unreachable" && "Unreachable"}
              {proof.status === "pending" && "Pending"}
            </span>
          </div>
        </div>

        {/* Changelog — what happened, what was added, value (or short narrative fallback) */}
        {(proof.changelog?.length ?? 0) > 0 ? (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
              Changelog
            </h2>
            <ul className="space-y-2 list-none rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 pl-6">
              {proof.changelog!.map((line, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--fg-muted)]">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--border)] mt-1.5" aria-hidden />
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (proof.enriched_card?.summary || proof.title) ? (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
              Changelog
            </h2>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                {proof.enriched_card?.summary ?? proof.title}
              </p>
            </div>
          </div>
        ) : null}

        {/* Proof — link cards */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-4">
            Proof ({proof.proof.length})
          </h2>
          <div className="space-y-3">
            {proof.proof.map((artifact, i) => (
              <a
                key={i}
                href={artifact.value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 py-3 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] transition group"
              >
                <span className="shrink-0 text-[var(--fg-muted)]">
                  <CategoryIcon slug={artifactIcon(artifact.type)} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[var(--fg)] font-medium text-sm">
                      {artifact.meta?.name || artifactLabel(artifact.type)}
                    </span>
                    {artifact.meta?.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 text-xs font-medium shrink-0">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--fg-muted)] truncate font-mono mt-0.5">
                    {artifact.type === "contract" && artifact.chain && (
                      <span className="text-[var(--fg-subtle)]">{artifact.chain}: </span>
                    )}
                    {artifact.type === "contract"
                      ? truncateAddress(artifact.value)
                      : artifact.value}
                  </div>
                  {artifact.meta?.description && (
                    <p className="text-xs text-[var(--fg-subtle)] mt-1 line-clamp-2">
                      {artifact.meta.description}
                    </p>
                  )}
                </div>
                <span className="text-[var(--fg-subtle)] group-hover:text-[var(--fg)] shrink-0">→</span>
              </a>
            ))}
          </div>
        </div>

        {/* Agent acknowledgments */}
        {proof.acknowledgements !== undefined && proof.acknowledgements > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--fg)] uppercase tracking-wider mb-3">
              Agent acknowledgments ({proof.acknowledgements})
            </h2>
            <div className="flex flex-wrap gap-3">
              {acknowledgingAgents && acknowledgingAgents.length > 0 ? (
                acknowledgingAgents.map((a) => {
                  const emoji = proof.acknowledgement_emojis?.[a.agent_id] ?? "🤝";
                  return (
                    <Link
                      key={a.agent_id}
                      href={`/agent/${agentDisplayName(a.handle)}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--fg)] hover:text-[var(--accent)] hover:border-[var(--border-hover)] transition"
                    >
                      <BotAvatar size="sm" seed={a.agent_id} />
                      @{agentDisplayName(a.handle)}
                      <span className="text-base leading-none" aria-hidden>{emoji}</span>
                    </Link>
                  );
                })
              ) : (
                <span className="text-sm text-[var(--fg)]">
                  🤝 {proof.acknowledgements} agent acknowledgment{proof.acknowledgements !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Meta + proof id link */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[var(--border)]">
          <code className="text-xs text-[var(--fg-muted)] font-mono break-all">
            {proof.proof_id}
          </code>
          <Link
            href={`/proof/${proof.proof_id}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--agent-color,var(--fg-muted))] hover:text-[var(--agent-color,var(--accent))] hover:bg-[var(--card-hover)] transition"
          >
            Show proof
          </Link>
        </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
