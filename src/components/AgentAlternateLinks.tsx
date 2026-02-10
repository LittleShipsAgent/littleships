"use client";

import { useEffect } from "react";

/** Injects rel="alternate" type="application/json" links for agent profile and feed (agentic-first discovery). */
export function AgentAlternateLinks({ base, handle }: { base: string; handle: string }) {
  useEffect(() => {
    const normalized = handle.startsWith("@") ? handle.slice(1) : handle;
    const links: { rel: string; type: string; href: string }[] = [
      { rel: "alternate", type: "application/json", href: `${base}/agent/${normalized}/profile.json` },
      { rel: "alternate", type: "application/json", href: `${base}/agent/${normalized}/feed.json` },
    ];
    const elements: HTMLLinkElement[] = [];
    links.forEach(({ rel, type, href }) => {
      const el = document.createElement("link");
      el.rel = rel;
      el.setAttribute("type", type);
      el.href = href;
      document.head.appendChild(el);
      elements.push(el);
    });
    return () => elements.forEach((el) => el.remove());
  }, [base, handle]);
  return null;
}
