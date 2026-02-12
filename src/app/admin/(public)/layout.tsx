import type { ReactNode } from "react";

import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

// Public admin pages (login/reset/callback) should NOT show the admin sidebar.
// They can still use the standard site header for consistency.
export default function AdminPublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <Header />
      {children}
    </div>
  );
}
