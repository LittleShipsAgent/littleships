/**
 * URL security utilities to prevent SSRF attacks.
 * Blocks internal IPs, localhost, and dangerous protocols.
 */

// Private/internal IP ranges (RFC 1918, RFC 5737, etc.)
const BLOCKED_IP_PATTERNS = [
  /^127\./,                          // Loopback
  /^10\./,                           // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private Class B
  /^192\.168\./,                     // Private Class C
  /^169\.254\./,                     // Link-local
  /^0\./,                            // Current network
  /^100\.(6[4-9]|[7-9][0-9]|1[0-2][0-7])\./,  // Carrier-grade NAT
  /^192\.0\.(0|2)\./,                // IETF Protocol Assignments
  /^198\.(1[8-9])\./,                // Benchmark testing
  /^203\.0\.113\./,                  // TEST-NET-3
  /^224\./,                          // Multicast
  /^240\./,                          // Reserved
  /^255\./,                          // Broadcast
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 unique local
  /^fe80:/i,                         // IPv6 link-local
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  '0.0.0.0',
  '127.0.0.1',
  '[::1]',
  'metadata.google.internal',        // GCP metadata
  'metadata.google.com',
  '169.254.169.254',                 // AWS/cloud metadata
];

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

const DEFAULT_MAX_REDIRECTS = 5;

export interface UrlValidationResult {
  safe: boolean;
  reason?: string;
}

/**
 * Check if a URL is safe to fetch (not internal/private).
 */
export function isUrlSafe(urlString: string): UrlValidationResult {
  try {
    const url = new URL(urlString);

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return { safe: false, reason: `Blocked protocol: ${url.protocol}` };
    }

    // Check hostname against blocklist
    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.some(blocked => hostname === blocked || hostname.endsWith('.' + blocked))) {
      return { safe: false, reason: 'Blocked hostname' };
    }

    // Check if hostname looks like an IP and matches blocked patterns
    if (BLOCKED_IP_PATTERNS.some(pattern => pattern.test(hostname))) {
      return { safe: false, reason: 'Blocked IP range' };
    }

    // Block URLs with credentials
    if (url.username || url.password) {
      return { safe: false, reason: 'URLs with credentials not allowed' };
    }

    // Block non-standard ports that might be internal services
    const port = url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80);
    const allowedPorts = [80, 443, 8080, 8443, 3000];
    if (!allowedPorts.includes(port)) {
      return { safe: false, reason: `Port ${port} not allowed` };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: 'Invalid URL' };
  }
}

/**
 * Safe fetch wrapper that validates URLs before fetching.
 */
export async function safeFetch(
  url: string,
  options?: RequestInit,
  redirectCount = 0,
  maxRedirects = DEFAULT_MAX_REDIRECTS
): Promise<Response> {
  const validation = isUrlSafe(url);
  if (!validation.safe) {
    throw new Error(`URL blocked: ${validation.reason}`);
  }

  // Block hostnames that resolve to private/internal IPs (DNS rebinding defense).
  // Note: we do this here (async) so callers don't need to remember to separately resolve DNS.
  await assertHostnameResolvesToPublicIps(url);

  if (redirectCount > maxRedirects) {
    throw new Error(`Too many redirects (>${maxRedirects})`);
  }

  // Add timeout if not present
  const fetchOptions: RequestInit = {
    ...options,
    signal: options?.signal || AbortSignal.timeout(10000),
  };

  // Disable following redirects automatically; we follow manually with validation.
  const response = await fetch(url, { ...fetchOptions, redirect: "manual" });

  // If redirect, validate the redirect target before following.
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (location) {
      const nextUrl = new URL(location, url).href;
      const redirectValidation = isUrlSafe(nextUrl);
      if (!redirectValidation.safe) {
        throw new Error(`Redirect blocked: ${redirectValidation.reason}`);
      }
      // Also DNS-check the redirect target.
      await assertHostnameResolvesToPublicIps(nextUrl);

      return safeFetch(nextUrl, options, redirectCount + 1, maxRedirects);
    }
  }

  return response;
}

async function assertHostnameResolvesToPublicIps(urlString: string): Promise<void> {
  const { hostname } = new URL(urlString);
  const host = hostname.toLowerCase();

  // Fast-path: if host is already a blocked hostname or matches blocked IP patterns, isUrlSafe() covers it.
  // Here we handle the DNS resolution case for domain names.
  if (BLOCKED_HOSTNAMES.includes(host)) {
    throw new Error("URL blocked: Blocked hostname");
  }

  // If it looks like an IP literal, rely on existing checks.
  if (BLOCKED_IP_PATTERNS.some((pattern) => pattern.test(host))) {
    throw new Error("URL blocked: Blocked IP range");
  }

  // Resolve A/AAAA and block if any result is private/internal.
  // In environments where DNS is unavailable, fail closed (safer for SSRF surface).
  try {
    const dns = await import("node:dns/promises");
    const results = await dns.lookup(host, { all: true, verbatim: true });
    for (const r of results) {
      const addr = String((r as any).address ?? "").toLowerCase();
      if (!addr) continue;
      if (BLOCKED_IP_PATTERNS.some((pattern) => pattern.test(addr))) {
        throw new Error("URL blocked: Host resolves to blocked IP range");
      }
    }
  } catch (e) {
    // If the hostname can't be resolved, treat as unsafe for server-side fetching.
    throw new Error("URL blocked: DNS resolution failed");
  }
}
