// Artifact enrichment per SPEC §3.3
// Validates: URL responds 200, GitHub repo exists, contract has code (stubbed without RPC)

import type { Artifact, ArtifactType, EnrichedCard, ProofStatus } from "./types";
import { isUrlSafe, safeFetch } from "./url-security";
import { sanitizeScrapedContent } from "./sanitize";

export interface EnrichResult {
  status: ProofStatus;
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

async function readTextWithLimit(res: Response, maxBytes: number): Promise<string> {
  // If no body (or already consumed), fall back.
  if (!res.body) {
    return await res.text();
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;

    const nextTotal = total + value.byteLength;
    if (nextTotal > maxBytes) {
      // Push only up to limit.
      const slice = value.slice(0, Math.max(0, maxBytes - total));
      if (slice.byteLength > 0) chunks.push(slice);
      total = maxBytes;
      try {
        reader.cancel();
      } catch {}
      break;
    }

    chunks.push(value);
    total = nextTotal;
  }

  const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  return buf.toString("utf8");
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
      return { ok: false };
    }

    // Some hosts (notably npmjs and others) may block/deny HEAD requests.
    // We treat a failed HEAD as non-fatal and fall back to GET.
    try {
      const headRes = await safeFetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
      // If HEAD is ok, great; if not ok, we'll still try GET below.
      void headRes;
    } catch {
      // ignore HEAD failures
    }

    const getRes = await safeFetch(url, { signal: AbortSignal.timeout(8000) });

    // Some sites (notably npmjs.com) block server-side fetches with 403 even though the URL is valid.
    // Treat this as reachable for proof purposes.
    const host = new URL(url).hostname.toLowerCase();
    if (!getRes.ok) {
      if (getRes.status === 403 && (host === "npmjs.com" || host.endsWith(".npmjs.com"))) {
        return { ok: true };
      }
      return { ok: false };
    }

    const contentType = (getRes.headers.get("content-type") || "").toLowerCase();
    const isHtml = contentType.includes("text/html") || contentType.includes("application/xhtml");
    if (!isHtml) {
      // Only parse HTML for metadata extraction.
      return { ok: true };
    }

    const html = await readTextWithLimit(getRes, 256 * 1024); // 256KB cap
    
    // Extract and sanitize metadata
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) || html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
    const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) || html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i);
    const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    const faviconMatch = html.match(/<link[^>]+rel="(?:shortcut )?icon"[^>]+href="([^"]+)"/i) || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="(?:shortcut )?icon"/i);
    
    // Resolve and validate image URLs
    let imageUrl: string | undefined;
    if (ogImage) {
      const resolved = resolveUrl(url, ogImage[1].trim());
      const imgCheck = isUrlSafe(resolved);
      if (imgCheck.safe && resolved.startsWith("http")) {
        imageUrl = resolved;
      }
    }
    
    let favicon: string | undefined;
    if (faviconMatch) {
      const resolved = resolveUrl(url, faviconMatch[1].trim());
      const favCheck = isUrlSafe(resolved);
      if (favCheck.safe && resolved.startsWith("http")) {
        favicon = resolved;
      }
    }

    // Sanitize scraped text content
    const title = titleMatch ? sanitizeScrapedContent(titleMatch[1]).clean.slice(0, 120) : undefined;
    const description = descMatch ? sanitizeScrapedContent(descMatch[1]).clean.slice(0, 200) : undefined;

    return {
      ok: true,
      title: title || undefined,
      description: description || undefined,
      imageUrl,
      favicon,
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
    
    // Sanitize owner/repo to prevent injection
    const safeOwner = owner.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    const safeRepo = repo.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 100);
    if (!safeOwner || !safeRepo) return { ok: false };

    const [repoRes, ownerRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${safeOwner}/${safeRepo}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
        signal: AbortSignal.timeout(6000),
      }),
      fetch(`https://api.github.com/users/${safeOwner}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
        signal: AbortSignal.timeout(6000),
      }),
    ]);
    if (!repoRes.ok) return { ok: false };
    const data = (await repoRes.json()) as { name?: string; full_name?: string; description?: string; stargazers_count?: number; forks_count?: number; language?: string; owner?: { avatar_url?: string } };
    const ownerData = ownerRes.ok ? ((await ownerRes.json()) as { avatar_url?: string }) : null;
    
    // Validate avatar URL
    let imageUrl: string | undefined;
    const avatarUrl = ownerData?.avatar_url ?? data.owner?.avatar_url;
    if (avatarUrl) {
      const avatarCheck = isUrlSafe(avatarUrl);
      if (avatarCheck.safe) {
        imageUrl = avatarUrl;
      }
    }
    if (!imageUrl) {
      imageUrl = `https://github.com/${safeOwner}.png`;
    }

    // Sanitize description
    const sanitizedDesc = data.description 
      ? sanitizeScrapedContent(data.description).clean 
      : undefined;

    return {
      ok: true,
      name: data.full_name || data.name || `${safeOwner}/${safeRepo}`,
      description: sanitizedDesc?.slice(0, 200) || undefined,
      meta: {
        name: data.full_name || `${safeOwner}/${safeRepo}`,
        description: sanitizedDesc || undefined,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language ?? undefined,
      },
      imageUrl,
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
  shipTitle: string
): Promise<EnrichResult> {
  const enriched: Artifact[] = [];
  let allReachable = true;
  let primaryCard: EnrichedCard = { title: shipTitle, summary: "" };

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

  const status: ProofStatus = allReachable ? "reachable" : "unreachable";
  if (primaryCard.summary === "" && shipTitle) {
    primaryCard = { title: shipTitle, summary: "Submitted proof" };
  }

  return { status, enriched_card: primaryCard, proof: enriched };
}
