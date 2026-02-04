import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to add request correlation IDs and security headers.
 */
export function middleware(request: NextRequest) {
  // Get existing request ID or generate new one
  const requestId = request.headers.get('x-request-id') || generateRequestId();
  
  const response = NextResponse.next();
  
  // Request correlation ID
  response.headers.set('X-Request-ID', requestId);
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP for API routes (restrictive)
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'"
    );
  }
  
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

// Apply to all routes
export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
