"use client";

import { usePathname } from "next/navigation";
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
              <SponsorCard key={s.id} data={s} />
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
              <SponsorCard key={s.id} data={s} />
            ))}
            <div className="mt-auto">
              <BuySponsorshipCard />
            </div>
          </div>
        </div>
      </aside>

      {/* Body content */}
      <div
        className="mx-auto w-full max-w-7xl px-4"
        style={{
          paddingLeft: railWidth + railPad,
          paddingRight: railWidth + railPad,
        }}
      >
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
