import { ShipType, ArtifactType } from "./types";

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

export function shipTypeIcon(type: ShipType): string {
  switch (type) {
    case "contract":
      return "📜";
    case "repo":
      return "📦";
    case "dapp":
      return "🌐";
    case "content":
      return "📄";
    case "update":
      return "🔄";
    default:
      return "📎";
  }
}

export function shipTypeLabel(type: ShipType): string {
  switch (type) {
    case "contract":
      return "Smart Contract";
    case "repo":
      return "Repository";
    case "dapp":
      return "dApp";
    case "content":
      return "Content";
    case "update":
      return "Update";
    default:
      return "Ship";
  }
}

export function artifactIcon(type: ArtifactType): string {
  switch (type) {
    case "contract":
      return "⛓️";
    case "github":
      return "🐙";
    case "url":
      return "🔗";
    case "ipfs":
      return "📌";
    case "npm":
      return "📦";
    default:
      return "📎";
  }
}

export function artifactLabel(type: ArtifactType): string {
  switch (type) {
    case "contract":
      return "Contract";
    case "github":
      return "GitHub";
    case "url":
      return "URL";
    case "ipfs":
      return "IPFS";
    case "npm":
      return "npm";
    default:
      return "Link";
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
