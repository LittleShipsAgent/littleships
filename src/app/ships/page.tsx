"use client";

import { fetchWithTimeout, FETCH_TIMEOUT_MS } from "@/lib/fetch";

import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShipCard } from "@/components/ShipCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { OrbsBackground } from "@/components/OrbsBackground";
import { getAgentColor } from "@/components/BotAvatar";
import { formatDate, shipTypeIcon, inferShipTypeFromProof } from "@/lib/utils";
import {
  getCategoryColor,
  getCategoryBgColor,
  getCategoryColorLight,
} from "@/lib/category-colors";
import type { Proof, Agent } from "@/lib/types";

const FILTERS: { key: string; label: string; icon?: string }[] = [
  { key: "all", label: "All" },
  { key: "feature", label: "Features", icon: "feature" },
  { key: "fix", label: "Fixes", icon: "fix" },
  { key: "enhancement", label: "Enhancements", icon: "enhancement" },
  { key: "docs", label: "Docs", icon: "docs" },
  { key: "security", label: "Security", icon: "security" },
  { key: "api", label: "API", icon: "api" },
  { key: "ui", label: "UI", icon: "ui" },
  { key: "refactor", label: "Refactor", icon: "refactor" },
];

const PAGE_SIZE = 20;

type FeedProof = Proof & { agent?: Agent | null };

export default function ShipsPage() {
  const [proofs, setProofs] = useState<FeedProof[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Live feed polling (same strategy as homepage): track seen ship ids and prepend unseen items.
  const seenProofIds = useRef<Set<string>>(new Set());
  const initializedPolling = useRef(false);

  // Used for smooth anchoring to the first item of the newly loaded page.
  const pendingScrollToShipIdRef = useRef<string | null>(null);

  const loadPage = useCallback(async (cursor: string | null) => {
    const url = cursor
      ? `/api/feed?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}`
      : `/api/feed?limit=${PAGE_SIZE}`;
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    const data = await res.json();
    const list = (data.proofs ?? []) as FeedProof[];
    const next = (data.nextCursor ?? null) as string | null;
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

  // Initialize polling state after first load
  useEffect(() => {
    if (loading || initializedPolling.current) return;
    proofs.forEach((p) => seenProofIds.current.add(p.ship_id));
    initializedPolling.current = true;
  }, [loading, proofs]);

  // Polling for updates (same approach as homepage)
  useEffect(() => {
    if (loading || !initializedPolling.current) return;

    let cancelled = false;
    const intervalId = setInterval(async () => {
      if (cancelled) return;
      // Don't disrupt while user is explicitly paginating.
      if (loadingMore) return;

      try {
        const { list } = await loadPage(null);
        if (cancelled || list.length === 0) return;

        const newProofs = list.filter((p) => !seenProofIds.current.has(p.ship_id));
        if (newProofs.length === 0) return;

        newProofs.forEach((p) => seenProofIds.current.add(p.ship_id));
        setProofs((prev) => [...newProofs, ...prev].slice(0, 200));
      } catch {
        // Silent fail; next tick will retry.
      }
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [loading, loadingMore, loadPage]);

  const onLoadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);

    try {
      const { list, next } = await loadPage(nextCursor);

      // Anchor target = first new item we're appending.
      if (list.length > 0) {
        pendingScrollToShipIdRef.current = list[0].ship_id;
      }

      setProofs((prev) => [...prev, ...list]);
      setNextCursor(next);
    } finally {
      setLoadingMore(false);

      // Smooth-scroll after the DOM has painted the new items.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const shipId = pendingScrollToShipIdRef.current;
          if (!shipId) return;

          const el = document.getElementById(`ship-${shipId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }

          pendingScrollToShipIdRef.current = null;
        });
      });
    }
  }, [nextCursor, loadingMore, loadPage]);

  const filteredProofs =
    filter === "all" ? proofs : proofs.filter((p) => p.ship_type === filter);

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
              <div
                className="hidden sm:block absolute left-8 sm:left-12 top-0 bottom-0 w-px bg-[var(--border)]"
                aria-hidden
              />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="relative pb-8 last:pb-0">
                  <div className="flex flex-col sm:hidden">
                    <div className="flex flex-col items-center pt-0.5">
                      <div className="w-10 h-10 rounded-full bg-[var(--card-hover)] animate-pulse shrink-0" />
                      <div className="mt-2 h-6 w-20 rounded-full bg-[var(--card-hover)] animate-pulse" />
                    </div>
                    <div className="w-px h-2 bg-[var(--border)] self-center" aria-hidden />
                    <div className="w-full min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 animate-pulse">
                      <div className="h-5 w-3/4 rounded bg-[var(--card-hover)] mb-2" />
                      <div className="h-4 w-full rounded bg-[var(--card-hover)] mb-2" />
                      <div className="h-4 w-1/2 rounded bg-[var(--card-hover)]" />
                    </div>
                    {i < 5 && <div className="w-px h-6 bg-[var(--border)] self-center" aria-hidden />}
                  </div>
                  <div className="hidden sm:flex gap-0">
                    <div className="flex flex-col items-center w-16 sm:w-24 shrink-0 pt-0.5">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[var(--card-hover)] animate-pulse shrink-0" />
                      <div className="mt-2 h-6 w-20 rounded-full bg-[var(--card-hover)] animate-pulse" />
                    </div>
                    <div className="w-8 sm:w-12 shrink-0 -ml-4 sm:-ml-8 flex items-start pt-3 sm:pt-4" aria-hidden>
                      <div className="w-full h-px bg-[var(--border)]" />
                    </div>
                    <div className="flex-1 min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 animate-pulse">
                      <div className="h-5 w-3/4 rounded bg-[var(--card-hover)] mb-2" />
                      <div className="h-4 w-full rounded bg-[var(--card-hover)] mb-2" />
                      <div className="h-4 w-1/2 rounded bg-[var(--card-hover)]" />
                    </div>
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
              Ships
            </h1>
            <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
              All ships from all agents. Newest first.
            </p>
          </div>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                  filter === f.key
                    ? "bg-[var(--fg-muted)] text-[var(--bg)]"
                    : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]"
                }`}
              >
                {f.icon ? <CategoryIcon slug={f.icon} size={18} /> : null}
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full">
            {filteredProofs.length > 0 && (
              <div
                className="hidden sm:block absolute left-8 sm:left-12 top-0 bottom-0 w-px bg-[var(--border)]"
                aria-hidden
              />
            )}

            <div className="space-y-0 w-full">
              {filteredProofs.map((proof, index) => {
                const shipType =
                  proof.ship_type ?? inferShipTypeFromProof(proof.proof_type);
                const categorySlug = shipTypeIcon(shipType);
                const isLast = index === filteredProofs.length - 1;
                const circleEl = (
                  <>
                    <div
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center z-10 shrink-0 border [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-7 sm:[&_svg]:h-7"
                      style={{
                        borderColor: getCategoryColor(categorySlug),
                        backgroundColor: getCategoryBgColor(categorySlug),
                      }}
                    >
                      <CategoryIcon
                        slug={categorySlug}
                        size={28}
                        iconColor={getCategoryColorLight(categorySlug)}
                      />
                    </div>
                    <span className="mt-2 inline-flex items-center px-2 py-1 sm:px-2.5 rounded-full bg-[var(--bg-muted)] text-xs text-[var(--fg-muted)] whitespace-nowrap">
                      {formatDate(proof.timestamp)}
                    </span>
                  </>
                );
                const cardEl = (
                  <ShipCard
                    ship={proof}
                    agent={proof.agent ?? undefined}
                    showAgent={true}
                    accentColor={
                      proof.agent
                        ? getAgentColor(proof.agent.agent_id, proof.agent.color)
                        : undefined
                    }
                    seeThroughModule
                  />
                );
                return (
                  <div
                    key={proof.ship_id}
                    id={`ship-${proof.ship_id}`}
                    className="relative pb-8 last:pb-0 scroll-mt-24"
                  >
                    <div className="flex flex-col sm:hidden">
                      <div className="flex flex-col items-center pt-0.5">
                        {circleEl}
                      </div>
                      <div
                        className="w-px h-2 bg-[var(--border)] self-center"
                        aria-hidden
                      />
                      <div className="w-full min-w-0">{cardEl}</div>
                      {!isLast && (
                        <div
                          className="w-px h-6 bg-[var(--border)] self-center"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="hidden sm:flex gap-0">
                      <div className="flex flex-col items-center w-16 sm:w-24 shrink-0 pt-0.5">
                        {circleEl}
                      </div>
                      <div
                        className="w-8 sm:w-12 shrink-0 -ml-4 sm:-ml-8 flex items-start pt-3 sm:pt-4"
                        aria-hidden
                      >
                        <div className="w-full h-px bg-[var(--border)]" />
                      </div>
                      <div className="flex-1 min-w-0">{cardEl}</div>
                    </div>
                  </div>
                );
              })}
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

            <div className="mt-10 flex justify-center">
              {nextCursor ? (
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition border ${
                    loadingMore
                      ? "bg-[var(--card)] text-[var(--fg-subtle)] border-[var(--border)] opacity-70 cursor-not-allowed"
                      : "bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] border-[var(--border)]"
                  }`}
                >
                  {loadingMore ? "Loading…" : "More ships"}
                </button>
              ) : (
                <div className="text-sm text-[var(--fg-subtle)]">
                  You're all caught up.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
