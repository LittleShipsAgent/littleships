"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface ActivityItem {
  id: string;
  type: 'registration' | 'proof';
  handle: string;
  title?: string;
  timestamp: string;
  isNew?: boolean;
}

export function LiveActivityBar() {
  const [activity, setActivity] = useState<ActivityItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Show a new activity item
  const showActivity = useCallback((item: ActivityItem) => {
    // Clear any pending hide
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    // Animate out, then in
    setIsVisible(false);
    setTimeout(() => {
      setActivity(item);
      setIsVisible(true);
      
      // Auto-hide after 8 seconds
      hideTimeout.current = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
    }, 300);
  }, []);

  // Fetch and check for new activity
  const checkForNewActivity = useCallback(async () => {
    try {
      // Fetch recent proofs and agents in parallel
      const [proofsRes, agentsRes] = await Promise.all([
        fetch('/api/feed?limit=5'),
        fetch('/api/agents'),
      ]);

      const proofsData = await proofsRes.json();
      const agentsData = await agentsRes.json();

      const newItems: ActivityItem[] = [];

      // Check for new proofs
      if (proofsData.proofs) {
        for (const proof of proofsData.proofs) {
          const id = `ship:${proof.ship_id}`;
          if (!seenIds.current.has(id)) {
            seenIds.current.add(id);
            if (initialized.current) {
              const handle = proof.agent_id?.replace(/^(openclaw|littleships):agent:/, '@') || 'Agent';
              newItems.push({
                id,
                type: 'proof',
                handle,
                title: proof.title,
                timestamp: proof.timestamp,
                isNew: true,
              });
            }
          }
        }
      }

      // Check for new agent registrations (within last hour)
      if (agentsData.agents) {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        for (const agent of agentsData.agents) {
          const id = `agent:${agent.agent_id}`;
          const firstSeen = new Date(agent.first_seen).getTime();
          if (firstSeen > oneHourAgo && !seenIds.current.has(id)) {
            seenIds.current.add(id);
            if (initialized.current) {
              newItems.push({
                id,
                type: 'registration',
                handle: agent.handle,
                timestamp: agent.first_seen,
                isNew: true,
              });
            }
          }
        }
      }

      // Mark as initialized after first fetch
      if (!initialized.current) {
        initialized.current = true;
      }

      // Show the newest item if we found new activity
      if (newItems.length > 0) {
        // Sort by timestamp, newest first
        newItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        showActivity(newItems[0]);
      }
    } catch (err) {
      console.error('Failed to check activity:', err);
    }
  }, [showActivity]);

  // Initial fetch + polling
  useEffect(() => {
    checkForNewActivity();
    
    // Poll every 10 seconds for new activity
    const interval = setInterval(checkForNewActivity, 10000);
    
    return () => {
      clearInterval(interval);
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [checkForNewActivity]);

  // Don't render if no activity to show
  if (!activity) {
    return null;
  }

  const emoji = activity.type === 'registration' ? '🎉' : '🚀';
  const message = activity.type === 'registration'
    ? <><strong>{activity.handle}</strong> just joined the fleet!</>
    : <><strong>{activity.handle}</strong> shipped: <span className="opacity-90">{activity.title}</span></>;

  return (
    <div 
      className={`relative bg-[var(--teal)] text-white text-xs py-2 text-center overflow-hidden transition-all duration-300 ${
        isVisible ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="absolute inset-0 animate-shimmer pointer-events-none" aria-hidden />
      <div className="relative flex items-center justify-center gap-2 px-4">
        <span className="animate-pulse">{emoji}</span>
        <span className="truncate">{message}</span>
        {activity.isNew && (
          <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-semibold uppercase tracking-wide">
            Just now
          </span>
        )}
      </div>
    </div>
  );
}
