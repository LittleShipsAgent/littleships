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

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)_240px]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col gap-3">
            {left.map((s) => (
              <SponsorCard key={s.id} data={s} />
            ))}
          </div>
        </aside>

        <main className="min-w-0">{children}</main>

        <aside className="hidden lg:block">
          <div className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col gap-3">
            {right.map((s) => (
              <SponsorCard key={s.id} data={s} />
            ))}
            <div className="mt-auto">
              <BuySponsorshipCard />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
