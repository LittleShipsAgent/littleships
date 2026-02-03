import { ArtifactType } from "./types";

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Icon key for CategoryIcon (Lucide); used by UI and feed API. */
export function artifactIcon(type: ArtifactType): string {
  switch (type) {
    case "contract":
      return "contract";
    case "github":
      return "github";
    case "dapp":
      return "dapp";
    case "ipfs":
      return "ipfs";
    case "arweave":
      return "arweave";
    case "link":
      return "link";
    default:
      return "link";
  }
}

export function artifactLabel(type: ArtifactType): string {
  switch (type) {
    case "contract":
      return "Contract";
    case "github":
      return "Repo";
    case "dapp":
      return "dApp";
    case "ipfs":
      return "IPFS";
    case "arweave":
      return "Arweave";
    case "link":
      return "Link";
    default:
      return "Artifact";
  }
}

// Ship type (what they shipped) — open string; known slugs get iconKey + label, unknown get fallback
const SHIP_TYPE_MAP: Record<string, { iconKey: string; label: string }> = {
  contract: { iconKey: "contract", label: "Contract" },
  repo: { iconKey: "repo", label: "Repo" },
  app: { iconKey: "app", label: "App" },
  dapp: { iconKey: "dapp", label: "dApp" },
  blog_post: { iconKey: "blog_post", label: "Blog post" },
  website: { iconKey: "website", label: "Website" },
  graphic: { iconKey: "graphic", label: "Graphic" },
  feature: { iconKey: "feature", label: "Feature" },
  doc: { iconKey: "doc", label: "Doc" },
  docs: { iconKey: "docs", label: "Docs" },
  documentation: { iconKey: "document", label: "Documentation" },
  podcast: { iconKey: "podcast", label: "Podcast" },
  video: { iconKey: "video", label: "Video" },
  dataset: { iconKey: "dataset", label: "Dataset" },
  tool: { iconKey: "tool", label: "Tool" },
  game: { iconKey: "game", label: "Game" },
  ipfs: { iconKey: "ipfs", label: "IPFS" },
  arweave: { iconKey: "arweave", label: "Arweave" },
  link: { iconKey: "link", label: "Link" },
};
const SHIP_TYPE_FALLBACK = { iconKey: "package", label: "Ship" };

/** Icon key for CategoryIcon (Lucide); used by UI and feed API. */
export function shipTypeIcon(shipType: string): string {
  const slug = (shipType || "").trim().toLowerCase();
  return slug ? (SHIP_TYPE_MAP[slug]?.iconKey ?? SHIP_TYPE_FALLBACK.iconKey) : SHIP_TYPE_FALLBACK.iconKey;
}

export function shipTypeLabel(shipType: string): string {
  const slug = (shipType || "").trim().toLowerCase();
  if (!slug) return SHIP_TYPE_FALLBACK.label;
  const mapped = SHIP_TYPE_MAP[slug]?.label;
  if (mapped) return mapped;
  // Format slug as Title Case (e.g. research_paper -> Research paper)
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Infer ship_type slug from artifact_type when not provided. */
export function inferShipTypeFromArtifact(artifactType: ArtifactType): string {
  switch (artifactType) {
    case "contract":
      return "contract";
    case "github":
      return "repo";
    case "dapp":
      return "app";
    case "ipfs":
      return "ipfs";
    case "arweave":
      return "arweave";
    case "link":
      return "website";
    default:
      return "link";
  }
}

export function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function truncateUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname !== "/" ? u.pathname : "");
  } catch {
    return url;
  }
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Group receipts into bursts (within 2 hours of each other)
export function groupIntoBursts<T extends { timestamp: string }>(
  items: T[],
  maxGapMs: number = 2 * 60 * 60 * 1000 // 2 hours
): T[][] {
  if (items.length === 0) return [];
  
  const sorted = [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const bursts: T[][] = [[sorted[0]]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i].timestamp).getTime();
    const previous = new Date(sorted[i - 1].timestamp).getTime();
    
    if (previous - current <= maxGapMs) {
      bursts[bursts.length - 1].push(sorted[i]);
    } else {
      bursts.push([sorted[i]]);
    }
  }
  
  return bursts;
}

/** Returns singular or plural form for a count (e.g. "ship" vs "ships"). */
export function pluralWord(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + "s");
}

/** Returns "1 ship" or "2 ships" etc. */
export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${pluralWord(count, singular, plural)}`;
}
