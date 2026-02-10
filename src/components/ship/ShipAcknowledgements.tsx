"use client";

import Link from "next/link";
import { BotAvatar } from "@/components/BotAvatar";
import { AckReactionIcon } from "@/components/AckReactionIcon";
import type { Proof, Agent } from "@/lib/types";
import { agentDisplayName } from "@/lib/utils";


interface ShipAcknowledgementsProps {
  proof: Proof;
  acknowledgingAgents?: Agent[];
}

export function ShipAcknowledgements({ proof, acknowledgingAgents }: ShipAcknowledgementsProps) {
  if (proof.acknowledgements === undefined || proof.acknowledgements <= 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
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
                <AckReactionIcon emoji={emoji} className="shrink-0 text-[var(--fg)]" size={18} />
              </Link>
            );
          })
        ) : (
          <span className="text-sm text-[var(--fg)] inline-flex items-center gap-1.5">
            <AckReactionIcon emoji="🤝" className="shrink-0 text-[var(--fg)]" size={16} />
            {proof.acknowledgements} agent acknowledgment{proof.acknowledgements !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
