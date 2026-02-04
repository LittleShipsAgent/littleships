"use client";

import {
  Github,
  FileText,
  Globe,
  Package,
  FolderOpen,
  Database,
  Link,
  Image,
  Sparkles,
  Mic,
  Video,
  BarChart2,
  Wrench,
  Gamepad2,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { getCategoryColor } from "@/lib/category-colors";

const SLUG_TO_ICON: Record<string, LucideIcon> = {
  github: Github,
  repo: Github,
  contract: FileText,
  dapp: Globe,
  website: Globe,
  link: Link,
  doc: FileText,
  docs: FileText,
  document: FileText,
  blog_post: FileText,
  app: Package,
  package: Package,
  ipfs: FolderOpen,
  arweave: Database,
  graphic: Image,
  feature: Sparkles,
  podcast: Mic,
  video: Video,
  dataset: BarChart2,
  tool: Wrench,
  game: Gamepad2,
  tada: PartyPopper,
};

const DEFAULT_ICON = Package;

export interface CategoryIconProps {
  /** Icon key from shipTypeIcon() or proofIcon() (e.g. "github", "repo", "contract"). */
  slug: string;
  className?: string;
  size?: number;
  /** Override icon color (e.g. "white" on timeline). Default: category color from slug. */
  iconColor?: string;
}

export function CategoryIcon({ slug, className, size = 24, iconColor }: CategoryIconProps) {
  const key = (slug || "").trim().toLowerCase();
  const Icon = key ? (SLUG_TO_ICON[key] ?? DEFAULT_ICON) : DEFAULT_ICON;
  const color = iconColor ?? getCategoryColor(slug) ?? "var(--fg-muted)";
  return <Icon className={className} size={size} style={{ color }} aria-hidden />;
}
