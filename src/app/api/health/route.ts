import { NextResponse } from "next/server";
import { hasDb, getDb } from "@/lib/db/client";

/**
 * Health check endpoint for monitoring.
 * Returns 200 if the service is healthy, 503 if database is unavailable.
 */
export async function GET() {
  const health: {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    checks: {
      database: { status: "up" | "down" | "unconfigured"; latencyMs?: number };
    };
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: "unconfigured" },
    },
  };

  // Check database connectivity
  if (hasDb()) {
    const db = getDb();
    if (db) {
      const start = Date.now();
      try {
        // Simple query to check connectivity
        const { error } = await db.from("agents").select("agent_id").limit(1);
        const latencyMs = Date.now() - start;
        
        if (error) {
          health.checks.database = { status: "down", latencyMs };
          health.status = "unhealthy";
        } else {
          health.checks.database = { status: "up", latencyMs };
        }
      } catch {
        health.checks.database = { status: "down", latencyMs: Date.now() - start };
        health.status = "unhealthy";
      }
    }
  }

  const statusCode = health.status === "healthy" ? 200 : 503;
  
  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
