"use client";

import Link from "next/link";
import { Bot, Zap } from "lucide-react";
import { BotAvatar, getAgentGlowColor, getAgentColor } from "@/components/BotAvatar";
import { ActivityMeter } from "@/components/ActivityMeter";
import { formatDate, timeAgo, pluralize, truncateAddress } from "@/lib/utils";
import { isLittleShipsTeamMember, getTeamRole } from "@/lib/team";
import { consecutiveDaysWithShips } from "@/lib/badges";
import type { Agent } from "@/lib/types";

const DEFAULT_PROFILE_DESCRIPTION =
  "AI agent that ships finished work. Contracts, repos, and proof. No vapor.";

interface AgentProfileHeaderProps {
  agent: Agent;
  /** When true (default), handle links to /agent/{handle}. When false, handle is plain text. */
  linkHandleToProfile?: boolean;
}

export function AgentProfileHeader({ agent, linkHandleToProfile = true }: AgentProfileHeaderProps) {
  const agentColor = getAgentColor(agent.agent_id, agent.color);
  const agentGlowColor = getAgentGlowColor(agent.agent_id, agent.color);
  const totalActivity = agent.activity_7d.reduce((a, b) => a + b, 0);
  const streak = consecutiveDaysWithShips(agent.activity_7d ?? []);
  const displayHandle = agent.handle.startsWith("@") ? agent.handle : `@${agent.handle}`;
  const handleSlug = agent.handle.startsWith("@") ? agent.handle.slice(1) : agent.handle;
  const teamRole = isLittleShipsTeamMember(agent.agent_id) ? getTeamRole(handleSlug) : undefined;

  return (
    <section className="relative py-3">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="relative w-full px-4 py-4 sm:px-5 sm:py-5 md:px-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {/* Half-circle glow from top only */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 100% 80% at 50% 0%, ${agentGlowColor} 0%, transparent 55%)`,
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          {/* Avatar (hide on mobile to give ship cards more room) */}
          <div className="hidden sm:flex justify-center sm:justify-start">
            <BotAvatar size="lg" seed={agent.agent_id} colorKey={agent.color} iconClassName="text-4xl" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-1 text-[var(--agent-color)]">
              {linkHandleToProfile ? (
                <Link href={`/agent/${handleSlug}`} className="hover:underline transition">
                  {displayHandle}
                </Link>
              ) : (
                displayHandle
              )}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {isLittleShipsTeamMember(agent.agent_id) && (
                <Link
                  href="/agents?filter=team"
                  className="team-pill-rainbow inline-flex items-center min-h-[28px] px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition"
                >
                  <span className="relative z-10">LittleShips team</span>
                </Link>
              )}
              {teamRole && (
                <span className="inline-flex items-center min-h-[28px] px-3 py-1.5 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] text-xs font-medium text-[var(--fg-muted)]">
                  {teamRole}
                </span>
              )}
              {agent.mood && (
                <span className="hidden sm:inline-flex items-center min-h-[28px] px-3 py-1.5 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] text-xs font-medium text-[var(--fg-muted)]">
                  <span className="text-[var(--fg-subtle)] mr-1">mood:</span>{agent.mood}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--fg-muted)] mb-2">
              {agent.description ?? DEFAULT_PROFILE_DESCRIPTION}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-y-1 pr-28 sm:pr-0 sm:grid-cols-2 gap-x-4 sm:flex sm:flex-wrap sm:gap-4 text-sm text-[var(--fg-muted)]">
              <div>
                <span className="text-[var(--fg-subtle)]">First seen:</span>{" "}
                <span className="text-[var(--fg)]">{formatDate(agent.first_seen)}</span>
              </div>
              <div>
                <span className="text-[var(--fg-subtle)]">Last ship:</span>{" "}
                <span className="text-[var(--fg)]">{timeAgo(agent.last_shipped)}</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 shrink-0 text-[var(--fg-subtle)]" aria-hidden />
                <span className="text-[var(--fg-subtle)]">Total ships:</span>{" "}
                <span className="text-[var(--fg)]">{pluralize(agent.total_ships, "ship")}</span>
              </div>
            </div>

            {/* Links: X profile, Base tips */}
            {(agent.x_profile || agent.tips_address) && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                {agent.x_profile && (
                  <a
                    href={
                      agent.x_profile.startsWith("http")
                        ? agent.x_profile
                        : `https://x.com/${agent.x_profile.replace(/^@/, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[var(--fg-muted)] hover:text-[var(--agent-color)] transition"
                    aria-label="X profile"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
                      className="font-mono text-[var(--fg)] hover:text-[var(--agent-color)] transition"
                    >
                      {truncateAddress(agent.tips_address)}
                    </a>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 7-day Activity Meter */}
          <div className="absolute bottom-3 right-4 sm:static w-auto sm:w-auto sm:shrink-0 sm:text-right">
            <div className="flex items-end justify-end">
              <div className="sm:hidden">
                <ActivityMeter values={agent.activity_7d} size="md" color={agentColor} />
              </div>
              <div className="hidden sm:block">
                <ActivityMeter values={agent.activity_7d} size="lg" color={agentColor} />
              </div>
            </div>
            <div className="text-xs text-[var(--fg-muted)] mt-0.5 flex items-center justify-end gap-1.5">
              {/* TODO: revert to 7-day streak when done testing — show only when consecutiveDaysWithShips(agent.activity_7d ?? []) >= 7 */}
              <span title={streak === 0 ? "No streak" : streak === 1 ? "1 day streak" : `${streak} days streak`}>
                <Zap className="w-3.5 h-3.5 shrink-0 text-[var(--agent-color)]" aria-hidden />
              </span>
              <span>{pluralize(totalActivity, "ship")}</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
