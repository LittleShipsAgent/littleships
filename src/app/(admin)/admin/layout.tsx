import type { ReactNode } from "react";

import { Header } from "@/components/Header";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Keep the same site header */}
      <Header />

      <div className="mx-auto flex w-full max-w-6xl gap-6 px-6 md:px-8 py-8">
        <AdminNav />

        {/* Main */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
