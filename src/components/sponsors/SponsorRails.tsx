"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { BuySponsorshipCard } from "./BuySponsorshipCard";
import { SponsorCard } from "./SponsorCard";
import { placeholderSponsors } from "./sponsorConfig";

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

  const left = placeholderSponsors.slice(0, 10);
  const right = placeholderSponsors.slice(10, 19); // 9 paid slots

  const railWidth = 240;
  const railPad = 24; // spacing between rails and body content
  // Note: body padding is applied only at lg+ via Tailwind arbitrary values.

  const [modalKey, setModalKey] = useState(0);

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
              <SponsorCard
                key={s.id}
                data={s}
                onOpenBuyModal={() => setModalKey((k) => k + 1)}
              />
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
              <SponsorCard
                key={s.id}
                data={s}
                onOpenBuyModal={() => setModalKey((k) => k + 1)}
              />
            ))}
            <div className="mt-auto">
              {/* key hack: allows opening from placeholder cards by re-mounting with defaultOpen */}
              <BuySponsorshipCard key={modalKey} defaultOpen={modalKey > 0} />
            </div>
          </div>
        </div>
      </aside>

      {/* Body content */}
      <div className="w-full px-4 lg:px-8 lg:pl-[264px] lg:pr-[264px]">
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
