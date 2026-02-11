import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware to add request correlation IDs and security headers.
 * Also protects /admin/* using Supabase auth (magic link sessions).
 */
export async function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || generateRequestId();

  // Protect admin routes (except /admin/login).
  const isAdminRoute = request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/");
  const isLogin = request.nextUrl.pathname.startsWith("/admin/login");

  let response = NextResponse.next();

  if (isAdminRoute && !isLogin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return new NextResponse("Missing Supabase env vars", { status: 500 });
    }

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Request correlation ID
  response.headers.set("X-Request-ID", requestId);

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // CSP for API routes (restrictive)
  if (request.nextUrl.pathname.startsWith("/api")) {
    response.headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
