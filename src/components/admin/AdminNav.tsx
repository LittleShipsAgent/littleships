"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/sponsors", label: "Sponsorships" },
  { href: "/admin/settings", label: "Settings" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";

  const sponsorHref = "/admin/sponsors";
  const [pendingSponsorCount, setPendingSponsorCount] = useState<number | null>(null);

  const showSponsorBadge = useMemo(() => {
    if (pendingSponsorCount == null) return false;
    return pendingSponsorCount > 0;
  }, [pendingSponsorCount]);

  useEffect(() => {
    let cancelled = false;

    async function loadPending() {
      try {
        const res = await fetch("/api/admin/sponsors/pending", {
          method: "GET",
          headers: { "content-type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          // Not logged in / not admin -> don’t show anything.
          if (!cancelled) setPendingSponsorCount(null);
          return;
        }

        const json: any = await res.json();
        const count = Array.isArray(json?.pending) ? json.pending.length : 0;
        if (!cancelled) setPendingSponsorCount(count);
      } catch {
        if (!cancelled) setPendingSponsorCount(null);
      }
    }

    loadPending();
    const interval = window.setInterval(loadPending, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const renderLabel = (item: (typeof NAV_ITEMS)[number]) => {
    const isSponsors = item.href === sponsorHref;
    if (!isSponsors) return <span>{item.label}</span>;

    return (
      <span className="inline-flex items-center gap-2">
        <span>{item.label}</span>
        {showSponsorBadge ? (
          <span
            aria-label={`${pendingSponsorCount} pending sponsorship${pendingSponsorCount === 1 ? "" : "s"}`}
            title={`${pendingSponsorCount} pending sponsorship${pendingSponsorCount === 1 ? "" : "s"}`}
            className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] leading-none font-semibold rounded-full bg-red-500 text-white"
          >
            {pendingSponsorCount}
          </span>
        ) : null}
      </span>
    );
  };

  return (
    <>
      {/* Mobile nav */}
      <nav className="md:hidden -mx-6 px-6 pb-4 mb-6 border-b border-[var(--border)] overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "rounded-xl px-3 py-2 text-sm whitespace-nowrap border transition " +
                  (active
                    ? "border-teal-500/40 bg-teal-500/15 text-teal-200"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]")
                }
              >
                {renderLabel(item)}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <nav className="sticky top-[88px] space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "block rounded-xl px-3 py-2 text-sm transition " +
                  (active
                    ? "bg-[var(--card)] text-[var(--fg)]"
                    : "text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]")
                }
              >
                {renderLabel(item)}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
