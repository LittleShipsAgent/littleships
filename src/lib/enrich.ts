// Artifact enrichment per SPEC §3.3
// Validates: URL responds 200, GitHub repo exists, contract has code (stubbed without RPC)

import type { Artifact, ArtifactType, EnrichedCard, ReceiptStatus } from "./types";
import { isUrlSafe, safeFetch } from "./url-security";

export interface EnrichResult {
  status: ReceiptStatus;
  enriched_card: EnrichedCard;
  proof: Artifact[];
}

function inferArtifactType(value: string): ArtifactType {
  if (/^0x[a-fA-F0-9]{40}$/.test(value)) return "contract";
  if (value.includes("github.com")) return "github";
  if (value.startsWith("ipfs://") || value.includes("ipfs.io/ipfs/") || value.includes("/ipfs/")) return "ipfs";
  if (value.includes("arweave.net") || value.startsWith("ar://")) return "arweave";
  if (value.startsWith("http://") || value.startsWith("https://")) return "link";
  return "link";
}

interface UrlPreview {
  ok: boolean;
  title?: string;
  description?: string;
  imageUrl?: string;
  favicon?: string;
}

function resolveUrl(base: string, path: string): string {
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

async function validateUrl(url: string): Promise<UrlPreview> {
  try {
    // SSRF protection: validate URL before fetching
    const urlCheck = isUrlSafe(url);
    if (!urlCheck.safe) {
      console.warn(`URL blocked by SSRF protection: ${url} - ${urlCheck.reason}`);
      return { ok: false };
    }

    const res = await safeFetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { ok: false };
    const getRes = await safeFetch(url, { signal: AbortSignal.timeout(5000) });
    const html = await getRes.text();
    const baseUrl = new URL(url).origin + "/";
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) || html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
    const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) || html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i);
    const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    const imageUrl = ogImage ? resolveUrl(url, ogImage[1].trim()) : undefined;
    const faviconMatch = html.match(/<link[^>]+rel="(?:shortcut )?icon"[^>]+href="([^"]+)"/i) || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="(?:shortcut )?icon"/i);
    const favicon = faviconMatch ? resolveUrl(url, faviconMatch[1].trim()) : undefined;
    return {
      ok: true,
      title: titleMatch ? titleMatch[1].trim().slice(0, 120) : undefined,
      description: descMatch ? descMatch[1].trim().slice(0, 200) : undefined,
      imageUrl: imageUrl?.startsWith("http") ? imageUrl : undefined,
      favicon: favicon?.startsWith("http") ? favicon : undefined,
    };
  } catch {
    return { ok: false };
  }
}

interface GitHubPreview {
  ok: boolean;
  name?: string;
  description?: string;
  meta?: Artifact["meta"];
  imageUrl?: string;
  favicon?: string;
}

async function validateGitHub(url: string): Promise<GitHubPreview> {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/|$)/);
    if (!match) return { ok: false };
    const [, owner, repo] = match;
    const [repoRes, ownerRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
        signal: AbortSignal.timeout(6000),
      }),
      fetch(`https://api.github.com/users/${owner}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
        signal: AbortSignal.timeout(6000),
      }),
    ]);
    if (!repoRes.ok) return { ok: false };
    const data = (await repoRes.json()) as { name?: string; full_name?: string; description?: string; stargazers_count?: number; forks_count?: number; language?: string; owner?: { avatar_url?: string } };
    const ownerData = ownerRes.ok ? ((await ownerRes.json()) as { avatar_url?: string }) : null;
    const imageUrl = ownerData?.avatar_url ?? data.owner?.avatar_url;
    return {
      ok: true,
      name: data.full_name || data.name || `${owner}/${repo}`,
      description: data.description?.slice(0, 200) || undefined,
      meta: {
        name: data.full_name || `${owner}/${repo}`,
        description: data.description || undefined,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language ?? undefined,
      },
      imageUrl: imageUrl ?? `https://github.com/${owner}.png`,
      favicon: "https://github.com/favicon.ico",
    };
  } catch {
    return { ok: false };
  }
}

/** Contract validation: optional chain RPC (eth_getCode). When RPC not configured, stub returns ok. */
async function validateContract(
  value: string,
  chain?: string
): Promise<{ ok: boolean; title?: string; summary?: string }> {
  const { getRpcUrl, validateContractAddress } = await import("./contract-validate");
  const rpcChain = chain || "base";
  if (getRpcUrl(rpcChain)) {
    const ok = await validateContractAddress(rpcChain, value);
    return {
      ok,
      title: chain ? `Contract on ${chain}` : "Contract",
      summary: ok
        ? (chain ? `Address has code on ${chain}` : "Contract address")
        : (chain ? `No code at address on ${chain}` : "No code at address"),
    };
  }
  return {
    ok: true,
    title: chain ? `Contract on ${chain}` : "Contract",
    summary: chain ? `Address on ${chain}` : "Contract address",
  };
}

/** Enrich proof: validate each item, build enriched_card from primary, set status. */
export async function enrichProof(
  proof: Artifact[],
  primaryType: ArtifactType = "link",
  receiptTitle: string
): Promise<EnrichResult> {
  const enriched: Artifact[] = [];
  let allReachable = true;
  let primaryCard: EnrichedCard = { title: receiptTitle, summary: "" };

  for (const art of proof) {
    const type = art.type || inferArtifactType(art.value);
    let ok = false;
    let meta = art.meta;

    if (type === "contract") {
      const r = await validateContract(art.value, art.chain);
      ok = r.ok;
      if (ok && art === proof[0] && primaryType === "contract") {
        primaryCard = { title: r.title || "Contract", summary: r.summary || "" };
      }
    } else if (type === "github") {
      const r = await validateGitHub(art.value);
      ok = r.ok;
      if (r.meta) meta = { ...art.meta, ...r.meta };
      if (ok && (primaryType === "github" || !primaryCard.summary)) {
        primaryCard = {
          title: r.name || art.meta?.name || "Repo",
          summary: r.description || art.meta?.description || "GitHub repository",
          preview: (r.imageUrl || r.favicon) ? { imageUrl: r.imageUrl, favicon: r.favicon } : undefined,
        };
      }
    } else if (type === "ipfs" || type === "arweave") {
      ok = true;
      if (primaryType === type || !primaryCard.summary) {
        primaryCard = {
          title: art.meta?.name || (type === "ipfs" ? "IPFS" : "Arweave"),
          summary: art.meta?.description || (type === "ipfs" ? "Content on IPFS" : "Content on Arweave"),
        };
      }
    } else {
      const r = await validateUrl(art.value);
      ok = r.ok;
      if (ok && (primaryType === "dapp" || primaryType === "link" || !primaryCard.summary)) {
        primaryCard = {
          title: r.title || new URL(art.value).hostname,
          summary: r.description || art.value,
          preview: (r.imageUrl || r.favicon) ? { imageUrl: r.imageUrl, favicon: r.favicon } : undefined,
        };
      }
    }

    if (!ok) allReachable = false;
    enriched.push({ ...art, type, meta });
  }

  const status: ReceiptStatus = allReachable ? "reachable" : "unreachable";
  if (primaryCard.summary === "" && receiptTitle) {
    primaryCard = { title: receiptTitle, summary: "Submitted proof" };
  }

  return { status, enriched_card: primaryCard, proof: enriched };
}
