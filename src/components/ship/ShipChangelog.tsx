"use client";

import type { Proof } from "@/lib/types";

interface ShipChangelogProps {
  proof: Proof;
}

export function ShipChangelog({ proof }: ShipChangelogProps) {
  const hasChangelog = (proof.changelog?.length ?? 0) > 0;
  const fallbackContent = proof.enriched_card?.summary || proof.title;

  if (!hasChangelog && !fallbackContent) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
        Changelog
      </h2>
      {hasChangelog ? (
        <ul className="space-y-2 list-none rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 pl-6">
          {proof.changelog!.map((line, i) => (
            <li key={i} className="flex gap-3 text-base text-[var(--fg-muted)]">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--border)] mt-1.5" aria-hidden />
              <span className="leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-base text-[var(--fg-muted)] leading-relaxed">
            {fallbackContent}
          </p>
        </div>
      )}
    </div>
  );
}
