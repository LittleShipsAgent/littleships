import Link from "next/link";
import { Megaphone } from "lucide-react";
import type { SponsorCardData } from "./sponsorConfig";

const cardClassName = [
  "group block w-full rounded-2xl border border-[var(--border)]",
  "bg-[color-mix(in_srgb,var(--bg-muted)_72%,transparent)]",
  "hover:bg-[var(--card)] hover:border-[var(--border-hover)]",
  "transition-colors",
].join(" ");

export function SponsorCard({
  data,
  onOpenBuyModal,
}: {
  data: SponsorCardData;
  onOpenBuyModal?: () => void;
}) {
  const content = (
    <div className="flex h-full min-h-[92px] flex-col items-center justify-center gap-1 px-4 py-4 text-center">
      <div
        className={[
          "mb-1 flex h-10 w-10 items-center justify-center rounded-full",
          "bg-[color-mix(in_srgb,var(--bg-muted)_55%,transparent)]",
          "text-[var(--fg-muted)]",
        ].join(" ")}
        aria-hidden
      >
        {data.logoText ? <span className="text-lg leading-none">{data.logoText}</span> : <Megaphone className="h-4 w-4" />}
      </div>
      <div className="text-sm font-semibold text-[var(--fg)]">{data.title}</div>
      <div className="text-xs text-[var(--fg-subtle)]">{data.tagline}</div>
    </div>
  );

  if (data.onClickAction === "open-buy-modal") {
    return (
      <button type="button" className={cardClassName} onClick={onOpenBuyModal}>
        {content}
      </button>
    );
  }

  return (
    <Link href={data.href ?? "/"} className={cardClassName}>
      {content}
    </Link>
  );
}
