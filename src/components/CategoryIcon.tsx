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
  /** Icon key from shipTypeIcon() or artifactIcon() (e.g. "github", "repo", "contract"). */
  slug: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ slug, className, size = 24 }: CategoryIconProps) {
  const key = (slug || "").trim().toLowerCase();
  const Icon = key ? (SLUG_TO_ICON[key] ?? DEFAULT_ICON) : DEFAULT_ICON;
  return <Icon className={className} size={size} aria-hidden />;
}
