"use client";

import { useEffect, useState, useCallback } from "react";

interface ActivityItem {
  type: 'registration' | 'proof';
  handle: string;
  title?: string;
  timestamp: string;
}

export function LiveActivityBar() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);

  // Fetch recent activity from API
  const fetchActivity = useCallback(async () => {
    try {
      // Fetch recent proofs
      const proofsRes = await fetch('/api/feed?limit=10');
      const proofsData = await proofsRes.json();
      
      // Fetch agents (sorted by most recent first)
      const agentsRes = await fetch('/api/agents');
      const agentsData = await agentsRes.json();

      const items: ActivityItem[] = [];

      // Add recent proofs
      if (proofsData.receipts) {
        for (const proof of proofsData.receipts.slice(0, 5)) {
          // Extract handle from agent_id
          const handle = proof.agent_id?.replace('openclaw:agent:', '@') || 'Agent';
          items.push({
            type: 'proof',
            handle,
            title: proof.title,
            timestamp: proof.timestamp,
          });
        }
      }

      // Add recent registrations (agents registered in last 24h)
      if (agentsData.agents) {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        for (const agent of agentsData.agents) {
          const firstSeen = new Date(agent.first_seen).getTime();
          if (firstSeen > oneDayAgo) {
            items.push({
              type: 'registration',
              handle: agent.handle,
              timestamp: agent.first_seen,
            });
          }
        }
      }

      // Sort by timestamp (newest first)
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Keep only the 10 most recent
      setActivities(items.slice(0, 10));
      setLastFetch(Date.now());
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    }
  }, []);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchActivity();
    const refreshInterval = setInterval(fetchActivity, 30000); // Refresh every 30s
    return () => clearInterval(refreshInterval);
  }, [fetchActivity]);

  // Cycle through activities
  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length]);

  // Don't render if no activities
  if (activities.length === 0) {
    return null;
  }

  const current = activities[currentIndex];
  if (!current) return null;

  const emoji = current.type === 'registration' ? '🎉' : '🚀';
  const message = current.type === 'registration'
    ? <><strong>{current.handle}</strong> just joined the fleet!</>
    : <><strong>{current.handle}</strong> just landed: <span className="opacity-90">{current.title}</span></>;

  return (
    <div className="relative bg-[var(--teal)] text-white text-xs py-1.5 text-center overflow-hidden">
      <div className="absolute inset-0 animate-shimmer pointer-events-none" aria-hidden />
      <div
        className={`relative flex items-center justify-center gap-2 transition-all duration-300 ${
          isVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2"
        }`}
      >
        <span className="animate-breathe">{emoji}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
