"use client";

import { useState } from "react";
import { BuySponsorshipModal } from "./BuySponsorshipModal";

export function BuySponsorshipCard({ onOpen }: { onOpen?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          onOpen?.();
        }}
        className={[
          "group w-full rounded-2xl border border-dashed border-[var(--border-hover)]",
          "bg-[color-mix(in_srgb,var(--bg-muted)_52%,transparent)]",
          "hover:bg-[var(--card)]",
          "transition-colors",
        ].join(" ")}
      >
        <div className="flex min-h-[92px] flex-col items-center justify-center gap-1 px-4 py-4 text-center">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--bg-muted)_55%,transparent)] text-[var(--fg-muted)]">
            <span className="text-lg leading-none">+</span>
          </div>
          <div className="text-sm font-semibold text-[var(--fg)]">Buy sponsorship</div>
          <div className="text-xs text-[var(--fg-subtle)]">Self-serve • pending approval</div>
        </div>
      </button>

      <BuySponsorshipModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
