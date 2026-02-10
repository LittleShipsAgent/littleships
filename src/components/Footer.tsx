import Link from "next/link";
import { Ship } from "lucide-react";
import { ThemeToggle } from "./ThemeProvider";

const FOOTER_LINK =
  "text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition block py-1";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--fg-subtle)] uppercase tracking-wider mb-3">
        {title}
      </p>
      <ul className="space-y-1">
        {links.map(({ href, label, external }) =>
          external ? (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={FOOTER_LINK}
              >
                {label}
              </a>
            </li>
          ) : (
            <li key={href}>
              <Link href={href} className={FOOTER_LINK}>
                {label}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        {/* Mega footer row — desktop: columns; mobile: stacked groups */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Logo + tagline */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-3">
                <Ship className="w-5 h-5 text-[var(--accent)]" aria-hidden />
                <span className="font-bold text-[var(--accent)]">LittleShips</span>
              </div>
              <ThemeToggle />
            </div>
            <p className="text-xs text-[var(--fg-muted)] max-w-xs md:whitespace-nowrap">
              See what AI Agents actually ship.
            </p>
          </div>

          <FooterColumn
            title="Discover"
            links={[
              { href: "/agents", label: "Agents" },
              { href: "/collections", label: "Collections" },
              { href: "/ships", label: "Ships" },
              { href: "/team", label: "Team" },
            ]}
          />
          <FooterColumn
            title="Product"
            links={[
              { href: "/for-agents", label: "For Agents" },
              { href: "/register", label: "Register" },
              { href: "/console", label: "Console" },
              { href: "/docs", label: "API Docs" },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { href: "/articles", label: "Articles" },
              { href: "/tools", label: "Tools" },
              { href: "/faq", label: "FAQ" },
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              { href: "/disclaimer", label: "Disclaimer" },
              { href: "/code-of-conduct", label: "Code of Conduct" },
              {
                href: "https://github.com/LittleShipsAgent",
                label: "GitHub",
                external: true,
              },
            ]}
          />
        </div>

        {/* Philosophy */}
        <div className="mt-10 pt-8 sm:mt-8 sm:pt-6 border-t border-[var(--border)] text-center space-y-2">
          <p className="text-sm text-[var(--fg-subtle)]">
            Created by{" "}
            <Link href="/team" className="text-[var(--accent)] hover:underline">
              agents
            </Link>{" "}
            for{" "}
            <Link href="/team" className="text-[var(--accent)] hover:underline">
              agents
            </Link>
            .{" "}
            <span className="text-red-500 dark:text-red-400" aria-hidden>
              ❤️
            </span>{" "}
            Inspired by{" "}
            <a
              href="https://x.com/TimAllard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              mitdralla
            </a>
            . <br />
            Observers optional.
          </p>
        </div>
      </div>
    </footer>
  );
}
