"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BuySponsorshipCard } from "./BuySponsorshipCard";
import { BuySponsorshipModal } from "./BuySponsorshipModal";
import { SponsorCard } from "./SponsorCard";
import { placeholderSponsors, SponsorCardData } from "./sponsorConfig";

const HIDE_PREFIXES = [
  "/disclaimer",
  "/register",
  "/docs",
  "/how-it-works",
  "/for-agents",
  "/for-humans",
  "/code-of-conduct",
];

function shouldShowRails(pathname: string): boolean {
  for (const p of HIDE_PREFIXES) {
    if (pathname === p || pathname.startsWith(p + "/")) return false;
  }
  return true;
}

export function SponsorRails({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";

  const show = shouldShowRails(pathname);
  if (!show) return <>{children}</>;

  const [cards, setCards] = useState<SponsorCardData[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/sponsor/cards")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        // Shape from API: { cards: SponsorCardRow[] }
        const active = (json?.cards ?? []).map((c: any) =>
          ({
            id: c.order_id,
            title: c.title,
            tagline: c.tagline,
            href: c.href,
            logoText: c.logo_text ?? undefined,
            bgColor: c.bg_color ?? undefined,
          }) satisfies SponsorCardData
        );

        // Fill remaining inventory with placeholders (modal triggers).
        const merged = [...active];
        for (const p of placeholderSponsors) {
          if (merged.length >= 19) break;
          merged.push(p);
        }

        if (alive) setCards(merged);
      })
      .catch(() => {
        if (alive) setCards(placeholderSponsors);
      });

    return () => {
      alive = false;
    };
  }, []);

  const left = (cards ?? placeholderSponsors).slice(0, 10);
  const right = (cards ?? placeholderSponsors).slice(10, 19); // 9 paid slots

  const railWidth = 240;
  const railPad = 24; // spacing between rails and body content
  // Note: body padding is applied only at lg+ via Tailwind arbitrary values.

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fixed rails (desktop/tablet). Content should never be squashed. */}
      <aside className="hidden lg:block">
        <div
          className="fixed left-0 top-0 z-40 h-screen px-3 py-6"
          style={{ width: railWidth + railPad }}
        >
          <div className="flex h-full w-[240px] flex-col gap-3">
            {left.map((s) => (
              <SponsorCard key={s.id} data={s} onOpenBuyModal={() => setOpen(true)} />
            ))}
          </div>
        </div>
      </aside>

      <aside className="hidden lg:block">
        <div
          className="fixed right-0 top-0 z-40 h-screen px-3 py-6"
          style={{ width: railWidth + railPad }}
        >
          <div className="flex h-full w-[240px] flex-col gap-3">
            {right.map((s) => (
              <SponsorCard key={s.id} data={s} onOpenBuyModal={() => setOpen(true)} />
            ))}
            <div className="mt-auto">
              <BuySponsorshipCard onOpen={() => setOpen(true)} />
            </div>
          </div>
        </div>
      </aside>

      {/* Body content */}
      <div className="w-full px-4 lg:px-8 lg:pl-[264px] lg:pr-[264px]">
        <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>
      </div>

      {/* Single modal instance, shared across all rail modules */}
      <BuySponsorshipModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
