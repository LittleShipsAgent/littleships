"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!gaId) return;
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;

    const qs = searchParams?.toString();
    const page_path = qs ? `${pathname}?${qs}` : pathname;

    // In SPAs/App Router, this ensures pageviews are tracked on client-side navigations.
    window.gtag("config", gaId, { page_path });
  }, [gaId, pathname, searchParams]);

  return null;
}
