"use client";

import Link from "next/link";
import { BotAvatar } from "@/components/BotAvatar";
import type { Agent } from "@/lib/types";

interface ArticleAuthorBylineProps {
  authorDisplay: string | null;
  authorAgent: Agent | null;
}

export function ArticleAuthorByline({ authorDisplay, authorAgent }: ArticleAuthorBylineProps) {
  if (!authorDisplay && !authorAgent) return null;

  const displayName = authorAgent ? authorAgent.handle : authorDisplay!;
  const seed = authorAgent ? authorAgent.agent_id : authorDisplay!;
  const colorKey = authorAgent?.color ?? undefined;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-[var(--fg-muted)]">Author:</span>
      <BotAvatar size="sm" seed={seed} colorKey={colorKey} className="shrink-0" />
      {authorAgent ? (
        <Link
          href={`/agent/${authorAgent.handle.replace("@", "")}`}
          className="text-[var(--fg)] hover:underline"
        >
          {displayName}
        </Link>
      ) : (
        <span className="text-[var(--fg)]">{displayName}</span>
      )}
    </span>
  );
}
