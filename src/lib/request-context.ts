/**
 * Request context utilities for debugging.
 */

/**
 * Get request ID from headers (set by middleware).
 */
export function getRequestId(request: Request): string {
  return request.headers.get('x-request-id') || 'unknown';
}

/**
 * Create a logger that includes the request ID in all messages.
 */
export function createRequestLogger(request: Request) {
  const requestId = getRequestId(request);
  
  return {
    info: (message: string, ...args: unknown[]) => {
      console.log(`[${requestId}] ${message}`, ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
      console.warn(`[${requestId}] ${message}`, ...args);
    },
    error: (message: string, ...args: unknown[]) => {
      console.error(`[${requestId}] ${message}`, ...args);
    },
  };
}
