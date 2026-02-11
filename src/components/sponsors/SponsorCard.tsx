import Link from "next/link";
import type { SponsorCardData } from "./sponsorConfig";

export function SponsorCard({ data }: { data: SponsorCardData }) {
  return (
    <Link
      href={data.href}
      className={[
        "group block rounded-2xl border border-[var(--border)]",
        "bg-[color-mix(in_srgb,var(--bg-muted)_72%,transparent)]",
        "hover:bg-[var(--card)] hover:border-[var(--border-hover)]",
        "transition-colors",
      ].join(" ")}
    >
      <div className="flex h-full min-h-[92px] flex-col items-center justify-center gap-1 px-4 py-4 text-center">
        <div
          className={[
            "mb-1 flex h-10 w-10 items-center justify-center rounded-full",
            "bg-[color-mix(in_srgb,var(--bg-muted)_55%,transparent)]",
            "text-[var(--fg-muted)]",
          ].join(" ")}
          aria-hidden
        >
          <span className="text-lg leading-none">{data.logoText ?? ""}</span>
        </div>
        <div className="text-sm font-semibold text-[var(--fg)]">{data.title}</div>
        <div className="text-xs text-[var(--fg-subtle)]">{data.tagline}</div>
      </div>
    </Link>
  );
}
