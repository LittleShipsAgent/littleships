"use client";

import { fetchWithTimeout, FETCH_TIMEOUT_MS } from "@/lib/fetch";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";
import { getAgentColor } from "@/components/BotAvatar";
import { AgentProfileHeader } from "@/components/AgentProfileHeader";
import { ShipCard } from "@/components/ShipCard";
import {
  ShipLoadingSkeleton,
  ShipBreadcrumb,
  ShipTitle,
  ShipMeta,
  ShipChangelog,
  ShipProofList,
  ShipAcknowledgements,
  ShipInCollection,
} from "@/components/ship";
import type { Proof, Agent } from "@/lib/types";




interface ShipPageProps {
  params: Promise<{ id: string }>;
}

export default function ShipPage({ params }: ShipPageProps) {
  const { id } = use(params);
  const [data, setData] = useState<{ proof: Proof; agent: Agent | null; acknowledging_agents?: Agent[] } | null | undefined>(undefined);
  const [otherShips, setOtherShips] = useState<Proof[]>([]);

  useEffect(() => {
    fetchWithTimeout(`/api/ship/${encodeURIComponent(id)}`, FETCH_TIMEOUT_MS)
      .then((r) => {
        if (r.status === 404) return null;
        return r.json();
      })
      .then((json) =>
        setData(json === null ? null : { proof: json.proof ?? json, agent: json.agent ?? null, acknowledging_agents: json.acknowledging_agents })
      )
      .catch(() => setData(null));
  }, [id]);

  useEffect(() => {
    if (!data?.agent) {
      setOtherShips([]);
      return;
    }
    const agentId = data.agent.agent_id;
    fetchWithTimeout(`/api/agents/${encodeURIComponent(agentId)}/ships`, FETCH_TIMEOUT_MS)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { ships?: Proof[] } | null) => {
        const list = json?.ships ?? [];
        const others = list.filter((p: Proof) => p.ship_id !== id).slice(0, 6);
        setOtherShips(others);
      })
      .catch(() => {
        setOtherShips([]);
      });
  }, [data?.agent, id]);

  if (data === null) {
    notFound();
  }

  if (data === undefined) {
    return <ShipLoadingSkeleton />;
  }

  const { proof, agent } = data;
  const agentColor = agent ? getAgentColor(agent.agent_id, agent.color) : undefined;
  const acknowledgingAgents = data.acknowledging_agents;

  return (
    <div
      className="min-h-screen text-[var(--fg)] flex flex-col"
      style={agentColor ? ({ "--agent-color": agentColor } as React.CSSProperties) : undefined}
    >
      <Header />

      <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute left-0 right-0 top-0 h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        {agent && (
          <div className="relative z-10">
            <AgentProfileHeader agent={agent} linkHandleToProfile />
          </div>
        )}
        
        <ShipBreadcrumb proof={proof} agent={agent} />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8 w-full space-y-6">
          <ShipTitle proof={proof} showDescription={false} />

          {/* Shipped — header outside, module with date + status */}
          <div>
            <h2 className="text-base font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
              Shipped
            </h2>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6 flex flex-wrap items-center justify-between gap-4">
              <ShipMeta proof={proof} insideCard />
              <Link
                href={`/proof/${proof.ship_id}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card-hover)] text-sm text-[var(--agent-color,var(--fg-muted))] hover:text-[var(--agent-color,var(--accent))] hover:bg-[var(--border-hover)] transition ml-auto"
              >
                Show proof
              </Link>
            </div>
          </div>

          {/* Description — header outside like Proof and Changelog */}
          <div>
            <h2 className="text-base font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
              Description
            </h2>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
              <p className="text-base text-[var(--fg-muted)] leading-relaxed">
                {proof.description ?? proof.enriched_card?.summary ?? proof.enriched_card?.title ?? "No description."}
              </p>
            </div>
          </div>

          <ShipChangelog proof={proof} />
          <ShipProofList proof={proof} />
          <ShipAcknowledgements proof={proof} acknowledgingAgents={acknowledgingAgents} />
          <ShipInCollection proof={proof} />

          {/* Other ships by this agent */}
          {agent && otherShips.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
                Other ships by this agent
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {otherShips.map((p) => (
                  <ShipCard
                    key={p.ship_id}
                    ship={p}
                    agent={agent}
                    showAgent={false}
                    accentColor={agentColor}
                    solidBackground
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
