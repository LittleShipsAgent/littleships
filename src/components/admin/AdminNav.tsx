"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
                {item.label}
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
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
