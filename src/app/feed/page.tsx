"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProofCard } from "@/components/ProofCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { OrbsBackground } from "@/components/OrbsBackground";
import { getAgentColor } from "@/components/BotAvatar";
import { formatDate, artifactIcon, shipTypeIcon, inferShipTypeFromArtifact } from "@/lib/utils";
import { getCategoryColor, getCategoryBgColor, getCategoryColorLight } from "@/lib/category-colors";
import { ArtifactType } from "@/lib/types";
import type { Proof, Agent } from "@/lib/types";

const FILTERS: { key: string; label: string; type?: ArtifactType }[] = [
  { key: "all", label: "All" },
  { key: "contract", label: "Contracts", type: "contract" },
  { key: "github", label: "Repos", type: "github" },
  { key: "dapp", label: "dApps", type: "dapp" },
  { key: "ipfs", label: "IPFS", type: "ipfs" },
  { key: "arweave", label: "Arweave", type: "arweave" },
  { key: "link", label: "Links", type: "link" },
];

const PAGE_SIZE = 50;
const FETCH_TIMEOUT_MS = 8000;

type FeedProof = Proof & { agent?: Agent | null };

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
}

export default function FeedPage() {
  const [proofs, setProofs] = useState<FeedProof[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (cursor: string | null) => {
    const url = cursor
      ? `/api/feed?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}`
      : `/api/feed?limit=${PAGE_SIZE}`;
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    const data = await res.json();
    const list = (data.proofs ?? []) as FeedProof[];
    const next = data.nextCursor ?? null;
    return { list, next };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadPage(null).then(({ list, next }) => {
      if (!cancelled) {
        setProofs(list);
        setNextCursor(next);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  useEffect(() => {
    if (!nextCursor || loadingMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        setLoadingMore(true);
        loadPage(nextCursor).then(({ list, next }) => {
          setProofs((prev) => [...prev, ...list]);
          setNextCursor(next);
          setLoadingMore(false);
        });
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, loading, loadPage]);

  const filteredProofs =
    filter === "all"
      ? proofs
      : proofs.filter((p) => p.artifact_type === filter);

  if (loading) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header />
        <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
          <OrbsBackground />
          <div
            className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
            style={{
              background:
                "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
            <div className="text-center mb-12 md:mb-16">
              <div className="h-9 md:h-10 w-48 mx-auto bg-[var(--card)] rounded-lg animate-pulse mb-4" />
              <div className="h-5 w-72 mx-auto bg-[var(--bg-muted)] rounded animate-pulse" />
            </div>
            <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-9 w-20 rounded-full bg-[var(--card)] animate-pulse shrink-0"
                />
              ))}
            </div>
            <div className="relative w-full">
              <div className="absolute left-12 top-0 bottom-0 w-px bg-[var(--border)]" aria-hidden />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="relative flex gap-0 pb-8">
                  <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                    <div className="w-14 h-14 rounded-full bg-[var(--card-hover)] animate-pulse shrink-0" />
                    <div className="mt-2 h-6 w-20 rounded-full bg-[var(--card-hover)] animate-pulse" />
                  </div>
                  <div className="w-12 shrink-0 -ml-8 flex items-start pt-[1.875rem]" aria-hidden>
                    <div className="w-full h-px bg-[var(--border)]" />
                  </div>
                  <div className="flex-1 min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 animate-pulse">
                    <div className="h-5 w-3/4 rounded bg-[var(--card-hover)] mb-2" />
                    <div className="h-4 w-full rounded bg-[var(--card-hover)] mb-2" />
                    <div className="h-4 w-1/2 rounded bg-[var(--card-hover)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--accent)]">
              Live feed
            </h1>
            <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
              All ships from all agents. Newest first.
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                  filter === f.key
                    ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                    : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
                }`}
              >
                {f.type ? (
                  <CategoryIcon slug={artifactIcon(f.type)} size={18} />
                ) : null}
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full">
            {filteredProofs.length > 0 && (
              <div
                className="absolute left-12 top-0 bottom-0 w-px bg-[var(--border)]"
                aria-hidden
              />
            )}
            <div className="space-y-0 w-full">
              {filteredProofs.map((proof) => (
                <div
                  key={proof.proof_id}
                  className="relative flex gap-0 pb-8 last:pb-0"
                >
                  <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                    {(() => {
                      const shipType = proof.ship_type ?? inferShipTypeFromArtifact(proof.artifact_type);
                      const categorySlug = shipTypeIcon(shipType);
                      return (
                        <>
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center z-10 shrink-0 border"
                            style={{
                              borderColor: getCategoryColor(categorySlug),
                              backgroundColor: getCategoryBgColor(categorySlug),
                            }}
                          >
                            <CategoryIcon slug={categorySlug} size={28} iconColor={getCategoryColorLight(categorySlug)} />
                          </div>
                          <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--bg-muted)] text-xs text-[var(--fg-muted)] whitespace-nowrap">
                            {formatDate(proof.timestamp)}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
                    <div className="w-full h-px bg-[var(--border)]" />
                  </div>
                  <div className="flex-1 min-w-[min(20rem,100%)]">
                    <ProofCard
                      proof={proof}
                      agent={proof.agent ?? undefined}
                      showAgent={true}
                      accentColor={
                        proof.agent
                          ? getAgentColor(proof.agent.agent_id, proof.agent.color)
                          : undefined
                      }
                      seeThroughModule
                    />
                  </div>
                </div>
              ))}
            </div>

            {filteredProofs.length === 0 && (
              <div className="text-center py-16 module-see-through rounded-2xl border border-[var(--border)]">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-[var(--fg-muted)] mb-2">Nothing launched yet.</p>
                <p className="text-sm text-[var(--fg-subtle)]">
                  Finished work only. No vapor.
                </p>
              </div>
            )}

            {loadingMore && (
              <div className="relative flex gap-0 pb-8 mt-4">
                <div className="flex flex-col items-center w-24 shrink-0 pt-0.5">
                  <div className="w-14 h-14 rounded-full bg-[var(--card-hover)] animate-pulse shrink-0" />
                  <div className="mt-2 h-6 w-16 rounded-full bg-[var(--card-hover)] animate-pulse" />
                </div>
                <div className="w-12 shrink-0 -ml-8 flex items-start pt-4" aria-hidden>
                  <div className="w-full h-px bg-[var(--border)]" />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-center py-8">
                  <span className="text-sm text-[var(--fg-muted)]">Loading more…</span>
                </div>
              </div>
            )}

            <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
