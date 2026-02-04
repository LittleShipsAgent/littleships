import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to add request correlation IDs for debugging.
 * Adds X-Request-ID header to all responses.
 */
export function middleware(request: NextRequest) {
  // Get existing request ID or generate new one
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  
  // Clone the response and add the header
  const response = NextResponse.next();
  response.headers.set('X-Request-ID', requestId);
  
  return response;
}

/**
 * Generate a short, unique request ID.
 * Format: timestamp(base36)-random(4 chars)
 * Example: m5k2p1-a7f2
 */
function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${random}`;
}

// Only apply to API routes
export const config = {
  matcher: '/api/:path*',
};
