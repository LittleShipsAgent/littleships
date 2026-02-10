"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { BotAvatar, getAgentColor, getAgentGlowColor } from "@/components/BotAvatar";
import { ActivityMeter } from "@/components/ActivityMeter";
import { timeAgo, pluralWord } from "@/lib/utils";
import { consecutiveDaysWithShips } from "@/lib/badges";
import type { Agent } from "@/lib/types";

interface ActiveAgentsSectionProps {
  agents: Agent[];
  highlightedAgentId: string | null;
  newSlideEffect: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const CAROUSEL_SIZE = 3;

export function ActiveAgentsSection({
  agents,
  highlightedAgentId,
  newSlideEffect,
  onHoverStart,
  onHoverEnd,
}: ActiveAgentsSectionProps) {
  // Only show agents who have actually shipped something
  const activeAgents = useMemo(() => {
    return [...agents]
      .filter(a => a.total_ships > 0)
      .sort((a, b) => new Date(b.last_shipped).getTime() - new Date(a.last_shipped).getTime());
  }, [agents]);

  // Display agents: if one is highlighted (new activity), put them first
  const displayAgents = useMemo(() => {
    if (highlightedAgentId) {
      const highlighted = activeAgents.find((a) => a.agent_id === highlightedAgentId);
      if (highlighted) {
        const rest = activeAgents.filter((a) => a.agent_id !== highlightedAgentId);
        return [highlighted, ...rest].slice(0, CAROUSEL_SIZE);
      }
    }
    return activeAgents.slice(0, CAROUSEL_SIZE);
  }, [activeAgents, highlightedAgentId]);

  // Calculate glow color from middle agent
  const glowStyle = useMemo(() => {
    const middleIndex = Math.floor(displayAgents.length / 2);
    const middleAgent = displayAgents[middleIndex];
    const glowBase = middleAgent 
      ? getAgentGlowColor(middleAgent.agent_id, middleAgent.color) 
      : "rgba(240, 244, 248, 0.15)";
    const glowBrighter = glowBase.replace(/[\d.]+\)$/, "0.32)");
    return {
      background: `radial-gradient(ellipse 80% 100% at 50% 50%, ${glowBrighter} 0%, transparent 70%)`,
    };
  }, [displayAgents]);

  return (
    <section className="recent-shippers-grid relative border-b border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden">
      <div
        className="hidden dark:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100%,42rem)] h-64 pointer-events-none z-0"
        style={glowStyle}
        aria-hidden
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[var(--fg)]">Active Agents</h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-teal-500/40 bg-teal-500/15 text-teal-600 dark:text-teal-400 text-xs font-medium animate-breathe">
              <span
                className={`w-1.5 h-1.5 rounded-full bg-teal-500 ${newSlideEffect ? "animate-pulse" : ""}`}
                aria-hidden
              />
              LIVE
            </span>
          </div>
          <Link
            href="/agents"
            className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-2.5 py-1.5 text-sm text-[var(--fg)] hover:bg-[var(--border-hover)] hover:text-[var(--fg)] transition"
          >
            View All Agents →
          </Link>
        </div>

        <div
          className="pt-3 pb-3"
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayAgents.map((agent) => {
              const totalActivity = agent.activity_7d.reduce((a, b) => a + b, 0);
              const streak = consecutiveDaysWithShips(agent.activity_7d ?? []);
              const isNewCard = newSlideEffect && agent.agent_id === highlightedAgentId;
              const agentColor = getAgentColor(agent.agent_id, agent.color);
              return (
                <Link
                  key={agent.agent_id}
                  href={`/agent/${agent.handle.replace("@", "")}`}
                  className={`min-w-0 home-active-agent-card border border-[var(--border)] rounded-2xl p-3 hover:border-[var(--border-hover)] hover:shadow-md hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-200 group flex items-center gap-3 ${
                    isNewCard ? "animate-new-card" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="group-hover:scale-105 transition-transform shrink-0">
                      <BotAvatar size="md" seed={agent.agent_id} colorKey={agent.color} iconClassName="text-3xl" />
                    </div>
                    <div className="min-w-0">
                      <div 
                        className="font-semibold text-base truncate group-hover:text-[var(--fg)] transition"
                        style={{ color: agentColor }}
                      >
                        @{agent.handle.replace("@", "")}
                      </div>
                      <div className="text-xs text-[var(--fg-subtle)]">
                        {timeAgo(agent.last_shipped)}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end pr-2">
                    <ActivityMeter values={agent.activity_7d} size="md" color={agentColor} />
                    <div className="text-xs text-[var(--fg-muted)] mt-0.5 flex items-center justify-end gap-1.5">
                      {/* TODO: revert to 7-day streak when done testing — show only when consecutiveDaysWithShips(agent.activity_7d ?? []) >= 7 */}
                      <span title={streak === 0 ? "No streak" : streak === 1 ? "1 day streak" : `${streak} days streak`}>
                        <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: agentColor }} aria-hidden />
                      </span>
                      <span><span className="font-semibold text-[var(--fg)]">{totalActivity}</span> {pluralWord(totalActivity, "ship")}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
