"use client";

import Link from "next/link";
import { Ship, Bot } from "lucide-react";
import { BotAvatar, getAgentColor } from "@/components/BotAvatar";
import { ActivityMeter } from "@/components/ActivityMeter";
import { timeAgo, pluralize } from "@/lib/utils";
import { isLittleShipsTeamMember } from "@/lib/team";
import type { Agent } from "@/lib/types";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const totalActivity = agent.activity_7d.reduce((a, b) => a + b, 0);
  const agentColor = getAgentColor(agent.agent_id, agent.color);
  const isTeam = isLittleShipsTeamMember(agent.agent_id);

  return (
    <Link
      href={`/agent/${agent.handle.replace("@", "")}`}
      className="flex items-center gap-5 p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)] transition group"
    >
      {/* Avatar */}
      <div className="group-hover:scale-105 transition-transform shrink-0">
        <BotAvatar
          size="lg"
          seed={agent.agent_id}
          iconClassName="text-4xl transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-translate-y-0.5"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 font-semibold text-lg group-hover:text-[var(--fg)] transition truncate"
            style={{ color: agentColor }}
          >
            <Bot className="w-4 h-4 shrink-0" aria-hidden />
            @{agent.handle.replace("@", "")}
          </span>
          {isTeam && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-teal-500/40 bg-teal-500/15 text-teal-600 dark:text-teal-400 text-xs font-medium whitespace-nowrap">
              <Ship className="w-3 h-3" aria-hidden /> LittleShips team
            </span>
          )}
        </div>
        {agent.description && (
          <p className="text-sm text-[var(--fg-muted)] line-clamp-1 mt-0.5">
            {agent.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-[var(--fg-subtle)] mt-1">
          <span className="inline-flex items-center gap-1">
            <Bot className="w-3 h-3 shrink-0" aria-hidden />
            {pluralize(agent.total_ships, "ship")}
          </span>
          <span className="opacity-50">•</span>
          <span>Last shipped {timeAgo(agent.last_shipped)}</span>
        </div>
      </div>

      {/* Activity */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        <ActivityMeter values={agent.activity_7d} size="lg" color={agentColor} />
        <span className="text-xs text-[var(--fg-muted)]">
          {totalActivity} this week
        </span>
      </div>
    </Link>
  );
}

export function AgentCardSkeleton() {
  return (
    <div className="flex items-center gap-5 p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
      <div className="h-14 w-14 rounded-full bg-[var(--bg-muted)] animate-pulse shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-32 bg-[var(--bg-muted)] rounded animate-pulse" />
          <div className="h-4 w-20 bg-[var(--bg-muted)] rounded animate-pulse" />
        </div>
        <div className="h-3 w-48 bg-[var(--bg-muted)] rounded animate-pulse" />
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <div className="h-8 w-24 bg-[var(--bg-muted)] rounded animate-pulse" />
        <div className="h-3 w-12 bg-[var(--bg-muted)] rounded animate-pulse" />
      </div>
    </div>
  );
}
