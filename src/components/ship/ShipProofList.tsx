"use client";

import { Star, GitFork } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { truncateAddress, proofIcon, proofLabel } from "@/lib/utils";
import type { Proof, ProofItem } from "@/lib/types";

// GitHub language colors (from linguist)
const GITHUB_LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

function parseGitHubOwnerRepo(url: string): { owner: string; repo: string } | null {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/|\.git|$)/i);
  return m ? { owner: m[1], repo: m[2].replace(/\.git$/, "") } : null;
}

function formatGitHubDisplayUrl(url: string): string {
  const ownerRepo = parseGitHubOwnerRepo(url);
  if (!ownerRepo) return url;

  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    // parts: [owner, repo, ...rest]
    const rest = parts.slice(2);

    if (rest.length === 0) return `${ownerRepo.owner} / ${ownerRepo.repo}`;

    // Common GitHub patterns
    if (rest[0] === "commit" && rest[1]) {
      const sha = rest[1];
      return `${ownerRepo.owner} / ${ownerRepo.repo} / commit/${sha.slice(0, 7)}`;
    }

    if (rest[0] === "pull" && rest[1]) {
      return `${ownerRepo.owner} / ${ownerRepo.repo} / pull/${rest[1]}`;
    }

    if (rest[0] === "issues" && rest[1]) {
      return `${ownerRepo.owner} / ${ownerRepo.repo} / issues/${rest[1]}`;
    }

    if (rest[0] === "blob" && rest[1]) {
      const branch = rest[1];
      let suffix = `blob/${branch}/…`;
      if (u.hash && u.hash.startsWith("#L")) suffix += u.hash;
      return `${ownerRepo.owner} / ${ownerRepo.repo} / ${suffix}`;
    }

    // Default: show one extra path segment (and an id if present)
    const extra = rest.slice(0, 2).join("/");
    return `${ownerRepo.owner} / ${ownerRepo.repo} / ${extra}`;
  } catch {
    // Fallback to owner/repo if URL() fails
    return `${ownerRepo.owner} / ${ownerRepo.repo}`;
  }
}

function viewButtonLabel(type: ProofItem["type"]): string {
  switch (type) {
    case "github":
      return "View repo";
    case "contract":
      return "View contract";
    case "dapp":
      return "View dapp";
    case "ipfs":
      return "View IPFS";
    case "arweave":
      return "View Arweave";
    case "link":
      return "View link";
    default:
      return "View";
  }
}

function ProofItemCard({ item }: { item: ProofItem }) {
  const isGithub = item.type === "github";
  const ownerRepo = isGithub ? parseGitHubOwnerRepo(item.value) : null;
  const langColor = item.meta?.language ? GITHUB_LANG_COLORS[item.meta.language] : undefined;

  return (
    <a
      href={item.value}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 py-3 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] transition group min-h-[44px]"
    >
      {/* Icon in circle */}
      <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--card-hover)] text-[var(--fg-muted)] group-hover:bg-[var(--border-hover)] transition">
        <CategoryIcon slug={proofIcon(item.type)} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[var(--fg)] font-medium text-base">
            {item.meta?.name || proofLabel(item.type)}
          </span>
          {item.meta?.verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 text-sm font-medium shrink-0">
              Verified
            </span>
          )}
        </div>
        <div className={`text-sm truncate font-mono mt-0.5 ${isGithub && ownerRepo ? "text-[var(--fg-subtle)]" : "text-[var(--fg-muted)]"}`}>
          {item.type === "contract" && item.chain && (
            <span className="text-[var(--fg-subtle)]">{item.chain}: </span>
          )}
          {item.type === "contract"
            ? truncateAddress(item.value)
            : isGithub
              ? formatGitHubDisplayUrl(item.value)
              : item.value}
        </div>
        {/* GitHub meta: language, stars, forks */}
        {isGithub && (item.meta?.language || item.meta?.stars != null || item.meta?.forks != null) && (
          <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-[var(--fg-muted)]">
            {item.meta?.language && (
              <span className="inline-flex items-center gap-1.5">
                {langColor && (
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: langColor }}
                    aria-hidden
                  />
                )}
                <span>{item.meta.language}</span>
              </span>
            )}
            {item.meta?.stars != null && item.meta.stars >= 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5" aria-hidden />
                {item.meta.stars}
              </span>
            )}
            {item.meta?.forks != null && item.meta.forks >= 0 && (
              <span className="inline-flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5" aria-hidden />
                {item.meta.forks}
              </span>
            )}
          </div>
        )}
        {item.meta?.description && (
          <p className="text-sm text-[var(--fg-subtle)] mt-1 line-clamp-2">
            {item.meta.description}
          </p>
        )}
      </div>
      <span className="shrink-0 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-hover)] text-sm font-medium text-[var(--fg-muted)] group-hover:bg-[var(--border-hover)] group-hover:text-[var(--fg)] group-hover:border-[var(--border-hover)] transition">
        {viewButtonLabel(item.type)}
      </span>
    </a>
  );
}

interface ShipProofListProps {
  proof: Proof;
}

export function ShipProofList({ proof }: ShipProofListProps) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-4">
        Proof ({proof.proof.length})
      </h2>
      <div className="space-y-3">
        {proof.proof.map((item, i) => (
          <ProofItemCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
