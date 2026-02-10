"use client";

import { useState } from "react";

// Code tabs with copy functionality
type CodeTab = { label: string; code: string; copyKey: string };

export function CodeTabs({
  tabs,
  copiedKey,
  onCopy,
}: {
  tabs: CodeTab[];
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const [active, setActive] = useState(0);
  const current = tabs[active];
  return (
    <div className="mb-4 last:mb-0 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card-hover)]">
        <div className="flex">
          {tabs.map((tab, i) => (
            <button
              key={tab.copyKey}
              type="button"
              onClick={() => setActive(i)}
              className={`px-3 py-2 text-xs font-medium uppercase tracking-wider transition ${
                i === active
                  ? "text-[var(--fg)] border-b-2 border-[var(--accent)] bg-[var(--card)]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onCopy(current.code, current.copyKey)}
          className="mr-2 px-2 py-1 rounded border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)] transition"
        >
          {copiedKey === current.copyKey ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm text-[var(--fg-muted)] overflow-x-auto font-mono whitespace-pre">{current.code}</pre>
    </div>
  );
}

// Method colors shared by badge and nav pills
export const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  POST: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  PATCH: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  PUT: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  DELETE: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

// HTTP method badge
export function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${METHOD_COLORS[method] ?? METHOD_COLORS.GET}`}>
      {method}
    </span>
  );
}

// Error status table
function statusColor(code: number): string {
  if (code >= 500) return "bg-rose-500/15 text-rose-600 dark:text-rose-400";
  if (code === 429) return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  if (code === 401) return "bg-red-500/15 text-red-600 dark:text-red-400";
  if (code === 404) return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
  if (code === 409) return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
}

export function ErrorTable({ rows }: { rows: { code: number; description: string }[] }) {
  return (
    <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--card-hover)]">
        <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Errors</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="px-3 py-2 font-medium text-[var(--fg)] w-24">Code</th>
              <th className="px-3 py-2 font-medium text-[var(--fg)]">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} className="border-b border-[var(--border)] last:border-0">
                <td className="px-3 py-2">
                  <span className={`inline-flex font-mono text-xs font-semibold px-2 py-0.5 rounded ${statusColor(row.code)}`}>
                    {row.code}
                  </span>
                </td>
                <td className="px-3 py-2 text-[var(--fg-muted)]">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Parameter table
type ParamRow = { name: string; type: string; required?: boolean; description: string };

export function ParamTable({
  title,
  params,
  caption,
  showRequired = true,
}: {
  title: "Path parameters" | "Query parameters" | "Body parameters" | "Response";
  params: ParamRow[];
  caption?: string;
  showRequired?: boolean;
}) {
  return (
    <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--card-hover)]">
        <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">{title}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="px-3 py-2 font-medium text-[var(--fg)]">Name</th>
              <th className="px-3 py-2 font-medium text-[var(--fg)]">Type</th>
              {showRequired && <th className="px-3 py-2 font-medium text-[var(--fg)] w-20">Required</th>}
              <th className="px-3 py-2 font-medium text-[var(--fg)]">Description</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p) => (
              <tr key={p.name} className="border-b border-[var(--border)] last:border-0">
                <td className="px-3 py-2 font-mono text-[var(--fg-muted)]">{p.name}</td>
                <td className="px-3 py-2 text-[var(--fg-muted)]">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-[var(--bg-muted)] font-mono text-xs">{p.type}</span>
                </td>
                {showRequired && <td className="px-3 py-2 text-[var(--fg-muted)]">{p.required !== false ? "Yes" : "No"}</td>}
                <td className="px-3 py-2 text-[var(--fg-muted)]">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <p className="px-3 py-2 text-xs text-[var(--fg-subtle)] border-t border-[var(--border)]">{caption}</p>}
    </div>
  );
}

// Endpoint section wrapper
export function EndpointSection({
  id,
  method,
  path,
  title,
  description,
  children,
}: {
  id: string;
  method: string;
  path: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-28">
      <div className="flex items-center gap-3 mb-2">
        <MethodBadge method={method} />
        <code className="text-sm font-mono text-[var(--fg-muted)] bg-[var(--bg-muted)] px-2 py-0.5 rounded">{path}</code>
      </div>
      <h2 className="text-xl font-bold text-[var(--fg)] mb-2">{title}</h2>
      {description && <p className="text-[var(--fg-muted)] mb-4">{description}</p>}
      {children}
    </section>
  );
}

// Navigation item
export type DocsNavItem = {
  id: string;
  label: string;
  method: string;
  path: string;
};

export function DocsNav({
  items,
  activeId,
  onSelect,
}: {
  items: readonly DocsNavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={() => onSelect?.(item.id)}
          className={`block px-3 py-2 rounded-lg text-sm transition ${
            activeId === item.id
              ? "bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
              : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)]"
          }`}
        >
          <span className="flex items-center gap-2">
            <MethodBadge method={item.method} />
            <span className="truncate">{item.label}</span>
          </span>
        </a>
      ))}
    </nav>
  );
}
