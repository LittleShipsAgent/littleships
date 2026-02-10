"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { ActivityMeter } from "@/components/ActivityMeter";
import { BotAvatar, getAgentColor } from "@/components/BotAvatar";
import { timeAgo, formatDate, pluralize } from "@/lib/utils";
import { isLittleShipsTeamMember, getTeamRole } from "@/lib/team";
import type { Agent } from "@/lib/types";

interface AgentListItemProps {
  agent: Agent;
}

export function AgentListItem({ agent }: AgentListItemProps) {
  const totalActivity = agent.activity_7d.reduce((a, b) => a + b, 0);
  const agentColor = getAgentColor(agent.agent_id, agent.color);
  const handleSlug = agent.handle.replace("@", "");
  const teamRole = isLittleShipsTeamMember(agent.agent_id) ? getTeamRole(handleSlug) : undefined;

  return (
    <Link
      href={`/agent/${agent.handle.replace("@", "")}`}
      className="flex items-center gap-5 p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)] transition group"
    >
      {/* Avatar */}
      <div className="hidden sm:block group-hover:scale-105 transition-transform shrink-0">
        <BotAvatar
          size="lg"
          seed={agent.agent_id}
          iconClassName="text-4xl transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-translate-y-0.5"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-semibold text-lg group-hover:text-[var(--fg)] transition" style={{ color: agentColor }}>
            <Bot className="w-4 h-4 shrink-0" aria-hidden />
            {agent.handle}
          </span>
          {isLittleShipsTeamMember(agent.agent_id) && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium"
              style={{
                borderColor: agentColor,
                backgroundColor: agentColor.replace(")", ", 0.15)").replace("rgb", "rgba"),
                color: agentColor,
              }}
            >
              LittleShips team
            </span>
          )}
          {teamRole && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] text-xs font-medium text-[var(--fg-muted)]">
              {teamRole}
            </span>
          )}
          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="flex gap-1 overflow-hidden">
              {agent.capabilities.slice(0, 2).map((cap) => (
                <span
                  key={cap}
                  className="px-1.5 py-0.5 bg-[var(--bg-muted)] rounded text-xs text-[var(--fg-subtle)]"
                >
                  {cap}
                </span>
              ))}
              {agent.capabilities.length > 2 && (
                <span className="text-xs text-[var(--fg-subtle)]">
                  +{agent.capabilities.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="text-xs text-[var(--fg-muted)] inline-flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Bot className="w-3 h-3 shrink-0" aria-hidden />
            {pluralize(agent.total_ships, "ship")}
          </span>
          <span className="mx-2 text-[var(--border)] hidden sm:inline">•</span>
          <span className="hidden sm:inline">First seen {formatDate(agent.first_seen)}</span>
          <span className="mx-2 text-[var(--border)]">•</span>
          <span>Last ship {timeAgo(agent.last_shipped)}</span>
        </div>
      </div>

      {/* Activity */}
      <div className="shrink-0 text-right">
        <ActivityMeter values={agent.activity_7d} size="md" color={agentColor} />
        <div className="text-xs text-[var(--fg-subtle)] mt-1">
          {pluralize(totalActivity, "ship")}
        </div>
      </div>
    </Link>
  );
}
