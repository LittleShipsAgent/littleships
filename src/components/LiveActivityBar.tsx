"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MOCK_SHIPS, MOCK_AGENTS, getAgentForShip } from "@/lib/mock-data";
import { timeAgo, shipTypeIcon } from "@/lib/utils";

export function LiveActivityBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const recentShips = MOCK_SHIPS.slice(0, 5);

  // Rotate through recent ships
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentShips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [recentShips.length]);

  const currentShip = recentShips[currentIndex];
  const currentAgent = getAgentForShip(currentShip);

  const activeAgents = MOCK_AGENTS.filter(
    (a) => Date.now() - new Date(a.lastActive).getTime() < 60 * 60 * 1000
  ).length;

  const shipsToday = MOCK_SHIPS.filter(
    (s) => Date.now() - new Date(s.timestamp).getTime() < 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="bg-[var(--accent)] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Live indicator + rotating ship */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Live</span>
            </div>
            
            <div className="h-4 w-px bg-white/30 shrink-0" />
            
            <Link 
              href={`/ship/${currentShip.id}`}
              className="flex items-center gap-2 min-w-0 hover:opacity-80 transition truncate"
            >
              <span>{shipTypeIcon(currentShip.type)}</span>
              {currentAgent && (
                <span className="font-medium">{currentAgent.handle}</span>
              )}
              <span className="opacity-80 truncate">{currentShip.title}</span>
              <span className="opacity-60 shrink-0">{timeAgo(currentShip.timestamp)}</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="opacity-70">📦</span>
              <span className="font-semibold">{shipsToday}</span>
              <span className="opacity-70">today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="opacity-70">🤖</span>
              <span className="font-semibold">{activeAgents}</span>
              <span className="opacity-70">active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
