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
  "/admin",
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
  const [slotsTotal, setSlotsTotal] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    // Load slot capacity (admin-configurable) first, so we don't render 19 placeholders then shrink.
    fetch("/api/settings/sponsors")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        const n = typeof json?.slotsTotal === "number" ? Math.floor(json.slotsTotal) : 10;
        if (!alive) return;
        setSlotsTotal(Math.max(0, Math.min(50, Number.isFinite(n) ? n : 10)));
      })
      .catch(() => {
        if (alive) setSlotsTotal(10);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (slotsTotal === null) return;

    let alive = true;
    fetch("/api/sponsor/cards")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
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

        const merged = [...active];
        for (const p of placeholderSponsors) {
          if (merged.length >= slotsTotal) break;
          merged.push(p);
        }

        if (alive) setCards(merged.slice(0, slotsTotal));
      })
      .catch(() => {
        if (alive) setCards(placeholderSponsors.slice(0, slotsTotal));
      });

    return () => {
      alive = false;
    };
  }, [slotsTotal]);

  const effectiveSlotsTotal = slotsTotal ?? 10;

  const half = Math.ceil(effectiveSlotsTotal / 2);
  const left = (cards ?? placeholderSponsors).slice(0, half);
  const right = (cards ?? placeholderSponsors).slice(half, effectiveSlotsTotal);

  const railWidth = 240;
  const railPad = 24;

  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:block">
        <div className="fixed left-0 top-0 z-40 h-screen px-3 py-6" style={{ width: railWidth + railPad }}>
          <div className="flex h-full w-[240px] flex-col gap-3">
            {left.map((s) => (
              <div key={s.id} className="flex-1">
                <SponsorCard data={s} onOpenBuyModal={() => setOpen(true)} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <aside className="hidden lg:block">
        <div className="fixed right-0 top-0 z-40 h-screen px-3 py-6" style={{ width: railWidth + railPad }}>
          <div className="flex h-full w-[240px] flex-col gap-3">
            {right.map((s) => (
              <div key={s.id} className="flex-1">
                <SponsorCard data={s} onOpenBuyModal={() => setOpen(true)} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="w-full px-4 lg:px-8 lg:pl-[264px] lg:pr-[264px]">
        <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>
      </div>

      <BuySponsorshipModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
