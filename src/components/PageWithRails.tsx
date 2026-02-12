import type { ReactNode } from "react";
import { SponsorsRail } from "@/components/SponsorsRail";

export function PageWithRails({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex gap-0">
        <SponsorsRail side="left" />
        <div className="min-w-0 flex-1">{children}</div>
        <SponsorsRail side="right" />
      </div>
    </div>
  );
}
