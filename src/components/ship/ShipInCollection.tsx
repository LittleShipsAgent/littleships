"use client";

import Link from "next/link";
import type { Proof } from "@/lib/types";

interface ShipInCollectionProps {
  proof: Proof;
}

export function ShipInCollection({ proof }: ShipInCollectionProps) {
  if (!proof.collections || proof.collections.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
        In collection
      </h2>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
        <div className="flex flex-wrap gap-2">
          {proof.collections.map((slug) => (
            <Link
              key={slug}
              href={`/collection/${slug}`}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-[var(--accent-muted)]/50 text-[var(--accent)] border border-[var(--accent)]/30 font-medium text-sm hover:bg-[var(--accent-muted)]/70 transition"
            >
              {slug}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
