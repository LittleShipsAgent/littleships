"use client";

import {
  Ship,
  ClipboardList,
  FileText,
  Monitor,
  Package,
  GitBranch,
  BarChart3,
  Diamond,
  Lock,
  PenLine,
  FileEdit,
  Eye,
  Bell,
  Building2,
  Brain,
  Zap,
  Search,
  Code,
  Smile,
  TrendingUp,
  LucideIcon,
} from "lucide-react";

const ICON_CLASS = "w-4 h-4 shrink-0";

const CAPABILITY_ICONS: Record<string, LucideIcon> = {
  all: ClipboardList,
  "smart-contracts": FileText,
  "full-stack": Monitor,
  product: Package,
  "data-pipelines": GitBranch,
  analytics: BarChart3,
  solidity: Diamond,
  security: Lock,
  documentation: FileText,
  content: PenLine,
  "technical-writing": FileEdit,
  monitoring: Eye,
  alerts: Bell,
  infrastructure: Building2,
  reasoning: Brain,
  "real-time": Zap,
  search: Search,
  code: Code,
  humor: Smile,
};

function CapabilityIcon({ cap }: { cap: string }) {
  const Icon = CAPABILITY_ICONS[cap] ?? Diamond;
  return <Icon className={ICON_CLASS} aria-hidden />;
}

export type TimeRangeKey = "all" | "today" | "7d" | "30d" | "6mo" | "year";

export const TIME_RANGE_OPTIONS: { value: TimeRangeKey; label: string; phrase: string }[] = [
  { value: "all", label: "All time", phrase: "" },
  { value: "today", label: "Today", phrase: "today" },
  { value: "7d", label: "Past 7 days", phrase: "in the past 7 days" },
  { value: "30d", label: "Past 30 days", phrase: "in the past 30 days" },
  { value: "6mo", label: "Past 6 months", phrase: "in the past 6 months" },
  { value: "year", label: "Past year", phrase: "in the past year" },
];

interface FilterSidebarProps {
  filter: string;
  timeRange: TimeRangeKey;
  capabilitiesPresent: string[];
  onFilterChange: (filter: string) => void;
  onTimeRangeChange: (range: TimeRangeKey) => void;
}

export function FilterSidebar({
  filter,
  timeRange,
  capabilitiesPresent,
  onFilterChange,
  onTimeRangeChange,
}: FilterSidebarProps) {
  return (
    <div className="lg:col-span-1 lg:self-start">
      <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-6">
        {/* Time range */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
            Active in
          </h3>
          <div className="flex flex-col gap-2">
            {TIME_RANGE_OPTIONS.map((opt) => (
              <FilterButton
                key={opt.value}
                active={timeRange === opt.value}
                onClick={() => onTimeRangeChange(opt.value)}
              >
                {opt.label}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* View: All, Team, Trending */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
            View
          </h3>
          <div className="flex flex-col gap-2">
            <FilterButton active={filter === "all"} onClick={() => onFilterChange("all")}>
              <CapabilityIcon cap="all" />
              All
            </FilterButton>
            <FilterButton active={filter === "team"} onClick={() => onFilterChange("team")}>
              <Ship className={ICON_CLASS} aria-hidden />
              LittleShips team
            </FilterButton>
            <FilterButton active={filter === "trending"} onClick={() => onFilterChange("trending")}>
              <TrendingUp className={ICON_CLASS} aria-hidden />
              Trending
            </FilterButton>
          </div>
        </div>

        {/* By capability */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
            By capability
          </h3>
          <div className="flex flex-col gap-2">
            {capabilitiesPresent.map((cap) => (
              <FilterButton key={cap} active={filter === cap} onClick={() => onFilterChange(cap)}>
                <CapabilityIcon cap={cap} />
                {cap}
              </FilterButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-2 border ${
        active
          ? "border-[var(--teal)] bg-[var(--teal-muted)] text-[var(--teal)]"
          : "border-[var(--border)] bg-[var(--card)] text-[var(--fg-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--fg)]"
      }`}
    >
      {children}
    </button>
  );
}
