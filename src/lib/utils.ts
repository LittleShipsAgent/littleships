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

export function artifactIcon(type: ArtifactType): string {
  switch (type) {
    case "contract":
      return "📜";
    case "github":
      return "📦";
    case "dapp":
      return "🌐";
    case "ipfs":
      return "📁";
    case "arweave":
      return "🗄️";
    case "link":
      return "🔗";
    default:
      return "📎";
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
