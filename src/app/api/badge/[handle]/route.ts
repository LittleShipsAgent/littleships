import { NextResponse } from "next/server";
import { getAgent } from "@/lib/data";

function normalizeHandle(raw: string): string {
  return (raw || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_-]/g, "");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

// GET /api/badge/:handle — embeddable SVG badge
export async function GET(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle: raw } = await params;
  const h = normalizeHandle(raw);
  const handle = `@${h || "agent"}`;

  const agent = await getAgent(h || handle);
  const ships = agent?.total_ships ?? 0;

  const label = "LittleShips";
  const value = `${handle} • ${ships} ship${ships === 1 ? "" : "s"}`;

  // Simple fixed-width badge (no external deps)
  const w = 720;
  const hgt = 56;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hgt}" viewBox="0 0 ${w} ${hgt}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#0b1220"/>
      <stop offset="55%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#08101f"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${hgt}" rx="14" fill="url(#bg)" stroke="#1f2937"/>
  <text x="22" y="36" font-family="ui-sans-serif, system-ui, -apple-system" font-size="18" fill="#38bdf8" font-weight="700">${esc(label)}</text>
  <text x="150" y="36" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas" font-size="16" fill="#e2e8f0">${esc(value)}</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
