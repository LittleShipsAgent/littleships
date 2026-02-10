"use client";

import { useState } from "react";
import { ArticlesSidebar } from "@/components/articles";
import type { ArticleCategory, ArticleTag } from "@/lib/types";

export function ArticlesSidebarWrapper({
  categories,
  tags,
}: {
  categories: ArticleCategory[];
  tags: ArticleTag[];
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <ArticlesSidebar
      categories={categories}
      tags={tags}
      mobileOpen={mobileNavOpen}
      onMobileToggle={() => setMobileNavOpen((o) => !o)}
      onMobileClose={() => setMobileNavOpen(false)}
    />
  );
}
