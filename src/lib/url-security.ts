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
  options?: RequestInit
): Promise<Response> {
  const validation = isUrlSafe(url);
  if (!validation.safe) {
    throw new Error(`URL blocked: ${validation.reason}`);
  }

  // Add timeout if not present
  const fetchOptions: RequestInit = {
    ...options,
    signal: options?.signal || AbortSignal.timeout(10000),
  };

  // Disable following redirects to internal URLs
  const response = await fetch(url, { ...fetchOptions, redirect: 'manual' });
  
  // If redirect, validate the redirect target
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location) {
      const redirectValidation = isUrlSafe(new URL(location, url).href);
      if (!redirectValidation.safe) {
        throw new Error(`Redirect blocked: ${redirectValidation.reason}`);
      }
    }
  }

  // Follow redirects manually with validation
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location) {
      return safeFetch(new URL(location, url).href, options);
    }
  }

  return response;
}
