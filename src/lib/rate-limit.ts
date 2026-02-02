/**
 * Simple in-memory rate limiter for API routes.
 * For production, consider using Redis or Upstash.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

/**
 * Check rate limit for a given key (e.g., IP address or agent_id).
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Get client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

// Preset configurations
export const RATE_LIMITS = {
  // Registration: 10 per hour per IP
  register: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  // Proof submission: 60 per hour per agent
  proof: { windowMs: 60 * 60 * 1000, maxRequests: 60 },
  // High-five: 100 per hour per agent
  highFive: { windowMs: 60 * 60 * 1000, maxRequests: 100 },
  // General API: 1000 per hour per IP
  general: { windowMs: 60 * 60 * 1000, maxRequests: 1000 },
} as const;
