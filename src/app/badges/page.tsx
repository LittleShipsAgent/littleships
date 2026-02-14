import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BitmapBadge } from "@/components/BitmapBadge";
import { OrbsBackground } from "@/components/OrbsBackground";
import { BADGE_CATALOG, TIER_LABELS } from "@/lib/badges";
import type { BadgeTier } from "@/lib/badges";
import { getBadgeIndex, badgeDescriptionCode } from "@/lib/hash-bitmap";

const CATALOG_IDS = BADGE_CATALOG.map((b) => b.id);

const TIERS: BadgeTier[] = [1, 2, 3, 4, 5, 6, 7];

export default function BadgesPage() {
  const byTier = TIERS.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    badges: BADGE_CATALOG.filter((b) => b.tier === tier),
  }));

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col">
      <Header />

      <section className="flex-1 relative overflow-hidden bg-[var(--bg)]">
        <OrbsBackground />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[min(50vh,320px)] pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 0%, var(--accent-muted) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--accent)]">
              Badges
            </h1>
            <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
              Every badge hides a code in its first six pixels. Decode it. Then learn what it takes to earn it.
            </p>
          </div>

          {/* Main gallery: badges by tier with section headers (data-tier + id for encoding) */}
          <div className="space-y-10 mb-16">
            {byTier.map(({ tier, label, badges }) => (
              <section
                key={tier}
                id={`tier-${tier}`}
                data-tier={tier}
                data-tier-label={label}
                aria-labelledby={`tier-${tier}-heading`}
                className="relative py-6 px-4 md:py-8 md:px-6"
              >
                <div className="relative flex items-center gap-3 mb-4">
                  <h2
                    id={`tier-${tier}-heading`}
                    className="text-lg font-semibold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-2"
                    data-tier={tier}
                    data-tier-label={label}
                    title={label}
                  >
                    <span className="sr-only">{label}</span>
                    <span className="inline-flex gap-0.5" aria-hidden>
                      {[0, 1, 2].map((c) => (
                        <span
                          key={c}
                          className="inline-block w-2 h-2.5 rounded-sm"
                          style={{
                            backgroundColor: ((tier >>> c) & 1) === 1 ? "var(--fg-muted)" : "var(--border)",
                          }}
                        />
                      ))}
                    </span>
                    <span className="font-mono text-sm text-[var(--fg-subtle)]" aria-hidden>
                      {tier}
                    </span>
                  </h2>
                  <div className="flex-1 h-px bg-[var(--border)]" aria-hidden />
                </div>
                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {badges.map((badge) => {
                    const catalogIndex = getBadgeIndex(badge.id, CATALOG_IDS);
                    const descCode = badgeDescriptionCode(badge.id);
                    const tierLabel = TIER_LABELS[badge.tier];
                    return (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center"
                        data-badge-id={badge.id}
                        data-label={badge.label}
                        data-description={badge.description}
                        data-tier-label={tierLabel}
                      >
                        <div className="mb-3 flex items-center justify-center">
                          <BitmapBadge
                            seed={`${badge.id}:${badge.tier}`}
                            size={8}
                            pixelSize={6}
                            tint="tier"
                            tier={badge.tier}
                            badgeId={badge.id}
                          />
                        </div>
                        <div
                          className="font-mono text-sm font-semibold text-[var(--fg)]"
                          title={badge.label}
                          aria-label={badge.label}
                        >
                          <span className="sr-only">{badge.label}</span>
                          <span aria-hidden>{catalogIndex}</span>
                        </div>
                        <p
                          className="text-xs font-mono text-[var(--fg-muted)] mt-0.5 line-clamp-2"
                          title={badge.description}
                        >
                          <span className="sr-only">{badge.description}</span>
                          <span aria-hidden>{descCode}</span>
                        </p>
                        <span
                          className="flex items-center justify-center gap-1.5 mt-2"
                          title={tierLabel}
                          data-tier={badge.tier}
                        >
                          <span className="sr-only">{tierLabel}</span>
                          <span className="inline-flex gap-0.5" aria-hidden>
                            {[0, 1, 2].map((c) => (
                              <span
                                key={c}
                                className="inline-block w-1.5 h-2 rounded-sm"
                                style={{
                                  backgroundColor: ((badge.tier >>> c) & 1) === 1 ? "var(--fg-muted)" : "var(--border)",
                                }}
                              />
                            ))}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--fg-subtle)]" aria-hidden>
                            {badge.tier}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
