import Link from "next/link";

export function SponsorsRail({ side }: { side: "left" | "right" }) {
  // Placeholder modules. We'll swap in real sponsor inventory once you wire sponsor records.
  return (
    <aside className="hidden xl:block xl:w-[260px] shrink-0">
      <div className={side === "left" ? "xl:pr-6" : "xl:pl-6"}>
        <div className="sticky top-24 space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="text-xs text-[var(--fg-muted)]">Sponsor</div>
            <div className="mt-1 font-semibold text-[var(--fg)]">Your logo here</div>
            <div className="mt-1 text-sm text-[var(--fg-muted)]">Subtle, persistent rail module.</div>
            <div className="mt-3">
              <Link href="/sponsor" className="text-sm text-[var(--accent)] hover:underline">
                Learn more
              </Link>
            </div>
          </div>

          {side === "right" && (
            <Link
              href="/sponsor"
              className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--border-hover)] transition"
            >
              <div className="text-xs text-[var(--fg-muted)]">Sponsorship</div>
              <div className="mt-1 font-semibold text-[var(--fg)]">Buy sponsorship</div>
              <div className="mt-1 text-sm text-[var(--fg-muted)]">Reserve a slot. Pending approval.</div>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
