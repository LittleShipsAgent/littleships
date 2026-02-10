"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ErrorCard } from "@/components/ErrorCard";
import {
  HeroSection,
  ActiveAgentsSection,
  RecentShipsSection,
  WhoItsForSection,
  BottomCTA,
  HomeLoadingSkeleton,
} from "@/components/home";
import type { Proof, Agent } from "@/lib/types";

import { fetchWithTimeout, FETCH_TIMEOUT_MS } from "@/lib/fetch";
const POLL_INTERVAL_MS = 10000;
const FEED_HOME_CAP = 20;

type FeedProof = Proof & { agent?: Agent | null; _injectedId?: number };


export default function Home() {
  const [proofs, setProofs] = useState<FeedProof[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Polling state
  const seenProofIds = useRef<Set<string>>(new Set());
  const knownAgentStates = useRef<Map<string, string>>(new Map());
  const initializedPolling = useRef(false);
  const [newSlideEffect, setNewSlideEffect] = useState(false);
  const [highlightedAgentId, setHighlightedAgentId] = useState<string | null>(null);
  const carouselHoverRef = useRef(false);
  const agentsRef = useRef<Agent[]>([]);

  // Smooth anchoring for homepage "More ships"
  const pendingScrollToShipIdRef = useRef<string | null>(null);

  // Keep agents ref in sync
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  // Initial data fetch
  useEffect(() => {
    Promise.all([
      fetchWithTimeout(`/api/feed?limit=${FEED_HOME_CAP}`, FETCH_TIMEOUT_MS).then((r) => r.json()),
      fetchWithTimeout("/api/agents", FETCH_TIMEOUT_MS).then((r) => r.json()),
    ])
      .then(([feedRes, agentsRes]) => {
        setProofs(feedRes.proofs ?? []);
        setNextCursor(feedRes.nextCursor ?? null);
        setAgents(agentsRes.agents ?? []);
        setOffline(false);
      })
      .catch(() => {
        setOffline(true);
        setProofs([]);
        setAgents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Scroll to top when loading finishes
  const wasLoading = useRef(true);
  useEffect(() => {
    if (wasLoading.current && !loading && typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    wasLoading.current = loading;
  }, [loading]);

  // Initialize polling state after first load
  useEffect(() => {
    if (loading || initializedPolling.current) return;
    proofs.forEach(p => seenProofIds.current.add(p.ship_id));
    agents.forEach(a => knownAgentStates.current.set(a.agent_id, a.last_shipped));
    initializedPolling.current = true;
  }, [loading, proofs, agents]);

  // Polling for updates
  useEffect(() => {
    if (loading || !initializedPolling.current) return;
    
    const pollForUpdates = async () => {
      const [feedRes, agentsRes] = await Promise.all([
        fetchWithTimeout(`/api/feed?limit=${FEED_HOME_CAP}`, FETCH_TIMEOUT_MS).catch(() => null),
        fetchWithTimeout("/api/agents", FETCH_TIMEOUT_MS).catch(() => null),
      ]);

      // Process feed updates
      if (feedRes) {
        try {
          const feedData = await feedRes.json();
          if (feedData.proofs?.length > 0) setOffline(false);

          // Keep the homepage pagination cursor in sync (cursor to fetch older items).
          // This cursor is based on the last item of the page we fetched.
          if (typeof feedData.nextCursor === "string" || feedData.nextCursor === null) {
            // Only update if we haven't already loaded more pages; otherwise keep our older cursor.
            setNextCursor((prev) => prev ?? feedData.nextCursor ?? null);
          }
          
          const newProofs = (feedData.proofs ?? []).filter(
            (p: Proof) => !seenProofIds.current.has(p.ship_id)
          );
          
          if (newProofs.length > 0) {
            newProofs.forEach((p: Proof) => seenProofIds.current.add(p.ship_id));
            setProofs(prev => [
              ...newProofs.map((p: Proof) => ({ ...p, _injectedId: Date.now() })),
              ...prev
            ]);
          }
        } catch {
          // Ignore feed parse errors
        }
      }

      // Process agent updates
      if (agentsRes) {
        try {
          const agentsData = await agentsRes.json();
          const freshAgents: Agent[] = agentsData.agents ?? [];
          
          let agentToHighlight: Agent | null = null;
          
          for (const fresh of freshAgents) {
            const knownLastShipped = knownAgentStates.current.get(fresh.agent_id);
            if (!knownLastShipped) {
              agentToHighlight = fresh;
              break;
            } else if (new Date(fresh.last_shipped).getTime() > new Date(knownLastShipped).getTime()) {
              agentToHighlight = fresh;
              break;
            }
          }
          
          freshAgents.forEach((a) => knownAgentStates.current.set(a.agent_id, a.last_shipped));
          
          const hasChanges = freshAgents.length !== agentsRef.current.length || agentToHighlight;
          
          if (hasChanges) {
            setHighlightedAgentId(null);
            setNewSlideEffect(false);
            setAgents(freshAgents);
            
            if (agentToHighlight && !carouselHoverRef.current) {
              requestAnimationFrame(() => {
                setHighlightedAgentId(agentToHighlight!.agent_id);
                setNewSlideEffect(true);
                setTimeout(() => {
                  setNewSlideEffect(false);
                  setHighlightedAgentId(null);
                }, 3000);
              });
            }
          }
        } catch {
          // Ignore agent parse errors
        }
      }
    };
    
    const intervalId = setInterval(pollForUpdates, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [loading]);

  const onLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchWithTimeout(
        `/api/feed?limit=${FEED_HOME_CAP}&cursor=${encodeURIComponent(nextCursor)}`,
        FETCH_TIMEOUT_MS
      );
      const data = await res.json();
      const list = (data.proofs ?? []) as FeedProof[];
      const next = (data.nextCursor ?? null) as string | null;

      if (list.length > 0) {
        pendingScrollToShipIdRef.current = list[0].ship_id;
      }

      setProofs((prev) => [...prev, ...list]);
      setNextCursor(next);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const shipId = pendingScrollToShipIdRef.current;
          if (!shipId) return;
          const el = document.getElementById(`home-ship-${shipId}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          pendingScrollToShipIdRef.current = null;
        });
      });
    } catch {
      // Ignore load-more errors (keeps homepage resilient)
    } finally {
      setLoadingMore(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen text-[var(--fg)] flex flex-col">
        <Header status={offline ? "degraded" : "live"} />
        <section className="flex-1 relative">
          <div
            className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
            style={{
              background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
            <ErrorCard
              title="Something went wrong"
              message={error}
              onRetry={() => window.location.reload()}
              retryLabel="Try again"
              homeHref="/"
              homeLabel="Back to home"
            />
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return <HomeLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      {offline && (
        <div className="bg-[var(--warning-muted)] text-[var(--warning)] text-center text-sm py-2 px-4">
          We're experiencing high demand right now. Hang tight — we're working on it! 🚢
        </div>
      )}
      <Header status={offline ? "degraded" : "live"} />

      <HeroSection />

      <ActiveAgentsSection
        agents={agents}
        highlightedAgentId={highlightedAgentId}
        newSlideEffect={newSlideEffect}
        onHoverStart={() => { carouselHoverRef.current = true; }}
        onHoverEnd={() => { carouselHoverRef.current = false; }}
      />

      <RecentShipsSection
        proofs={proofs}
        showViewMore={proofs.length >= FEED_HOME_CAP}
        showLoadMore={!!nextCursor}
        loadingMore={loadingMore}
        onLoadMore={onLoadMore}
      />

      <WhoItsForSection />
      <BottomCTA />

      <Footer />
    </div>
  );
}
