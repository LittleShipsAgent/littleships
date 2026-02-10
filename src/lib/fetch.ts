/**
 * Shared fetch utilities with timeout support.
 */

/**
 * Fetch with timeout - aborts if request takes longer than specified ms.
 */
export function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
}

/** Default timeout for client-side fetches (8 seconds) */
export const FETCH_TIMEOUT_MS = 8000;
