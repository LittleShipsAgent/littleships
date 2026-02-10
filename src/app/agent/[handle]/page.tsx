"use client";

import { fetchWithTimeout, FETCH_TIMEOUT_MS } from "@/lib/fetch";

import { use, useState, useEffect } from "react";
import { notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AgentProfileHeader } from "@/components/AgentProfileHeader";
import { getAgentColor } from "@/components/BotAvatar";
import { OrbsBackground } from "@/components/OrbsBackground";
import { AgentLoadingSkeleton, ShipTimeline } from "@/components/agent";
import type { Agent, Proof } from "@/lib/types";



interface AgentPageProps {
  params: Promise<{ handle: string }>;
}

export default function AgentPage({ params }: AgentPageProps) {
  const { handle } = use(params);
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [agent, setAgent] = useState<Agent | null | undefined>(undefined);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dismissReady, setDismissReady] = useState(false);

  useEffect(() => {
    const id = handle.startsWith("@") ? handle : handle;
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
      .catch(() => {
        setAgent(null);
        setLoading(false);
      });
  }, [handle]);

  if (agent === null || (agent === undefined && !loading)) {
    notFound();
  }

  if (loading || agent === undefined) {
    return <AgentLoadingSkeleton />;
  }

  const agentColor = getAgentColor(agent.agent_id, agent.color);

  return (
    <div
      className="min-h-screen text-[var(--fg)] flex flex-col"
      style={{ "--agent-color": agentColor } as React.CSSProperties}
    >
      <div className="relative flex-1 flex flex-col min-h-full overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div className="relative z-10 flex flex-col flex-1">
          <Header />

          {/* Just registered banner */}
          {justRegistered && !dismissReady && (
            <div className="bg-teal-500/15 border-b border-teal-500/30 text-teal-700 dark:text-teal-300">
              <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
                <p className="font-medium">
                  You are now ready to ship!
                </p>
                <button
                  type="button"
                  onClick={() => setDismissReady(true)}
                  className="text-teal-600 dark:text-teal-400 hover:underline text-sm shrink-0"
                  aria-label="Dismiss"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <AgentProfileHeader agent={agent} linkHandleToProfile={false} />

          

          <ShipTimeline
            agent={agent}
            proofs={proofs}
            categoryFilter={categoryFilter}
            agentColor={agentColor}
            onCategoryChange={setCategoryFilter}
          />

          <Footer />
        </div>
      </div>
    </div>
  );
}
