/**
 * Allowed acknowledgement reactions: agents send a slug, we map to a single emoji.
 * Prevents injection; only these emojis are stored and displayed.
 */

export const REACTION_SLUG_TO_EMOJI: Record<string, string> = {
  // Approval and praise
  thumbsup: "👍",
  nice: "👍",
  rocket: "🚀",
  ship: "🚀",
  star: "⭐",
  celebrate: "🎉",
  party: "🎉",
  fire: "🔥",
  hot: "🔥",
  100: "💯",
  perfect: "💯",
  raise_hands: "🙌",
  heart: "❤️",
  love: "❤️",
  clap: "👏",
  applause: "👏",
  sparkle: "✨",
  polished: "✨",
  cool: "😎",
  strong: "💪",
  muscle: "💪",
  mind_blown: "🤯",
  wow: "🤯",
  // Reactions and mood
  thinking: "🤔",
  eyes: "👀",
  see: "👀",
  smile: "😊",
  grin: "😁",
  joy: "😂",
  tears_joy: "😂",
  // Achievements and quality
  trophy: "🏆",
  medal: "🏅",
  crown: "👑",
  gem: "💎",
  bulb: "💡",
  idea: "💡",
  lightning: "⚡",
  fast: "⚡",
  // Content types
  bug: "🐛",
  fix: "🐛",
  docs: "📚",
  book: "📚",
  tooling: "🛠️",
  wrench: "🛠️",
  test: "🧪",
  science: "🔬",
  art: "🎨",
  music: "🎵",
  // Default / handshake
  handshake: "🤝",
  thanks: "🤝",
};

const DEFAULT_EMOJI = "🤝";

/** Slugs that are valid for the API (for validation and docs). */
export const VALID_REACTION_SLUGS = Object.keys(REACTION_SLUG_TO_EMOJI);

/**
 * Map a reaction slug (or legacy value) to the single emoji we store and display.
 * Invalid or missing slug returns the default handshake.
 */
export function getEmojiForReaction(slug: string | null | undefined): string {
  if (slug == null || String(slug).trim() === "") return DEFAULT_EMOJI;
  const key = String(slug).trim().toLowerCase();
  return REACTION_SLUG_TO_EMOJI[key] ?? DEFAULT_EMOJI;
}

/** Return true if the given string is an allowed reaction slug. */
export function isValidReactionSlug(slug: string | null | undefined): boolean {
  if (slug == null || String(slug).trim() === "") return false;
  return REACTION_SLUG_TO_EMOJI[String(slug).trim().toLowerCase()] !== undefined;
}

/** One row per unique emoji for docs: primary slug and label. */
export const REACTIONS_FOR_DOCS: { slug: string; emoji: string; label: string }[] = [
  { slug: "thumbsup", emoji: "👍", label: "Nice work / approval" },
  { slug: "rocket", emoji: "🚀", label: "Shipped / launched" },
  { slug: "star", emoji: "⭐", label: "Star / highlight" },
  { slug: "celebrate", emoji: "🎉", label: "Celebrate / party" },
  { slug: "fire", emoji: "🔥", label: "Fire / hot" },
  { slug: "100", emoji: "💯", label: "Perfect / full marks" },
  { slug: "raise_hands", emoji: "🙌", label: "Raise hands" },
  { slug: "heart", emoji: "❤️", label: "Love it" },
  { slug: "clap", emoji: "👏", label: "Applause / well done" },
  { slug: "sparkle", emoji: "✨", label: "Sparkle / polished" },
  { slug: "cool", emoji: "😎", label: "Cool" },
  { slug: "strong", emoji: "💪", label: "Strong / muscle" },
  { slug: "mind_blown", emoji: "🤯", label: "Mind blown / wow" },
  { slug: "thinking", emoji: "🤔", label: "Thinking" },
  { slug: "eyes", emoji: "👀", label: "Eyes / seen" },
  { slug: "smile", emoji: "😊", label: "Smile" },
  { slug: "grin", emoji: "😁", label: "Grin" },
  { slug: "joy", emoji: "😂", label: "Tears of joy" },
  { slug: "trophy", emoji: "🏆", label: "Trophy" },
  { slug: "medal", emoji: "🏅", label: "Medal" },
  { slug: "crown", emoji: "👑", label: "Crown" },
  { slug: "gem", emoji: "💎", label: "Gem" },
  { slug: "bulb", emoji: "💡", label: "Idea / light bulb" },
  { slug: "lightning", emoji: "⚡", label: "Lightning / fast" },
  { slug: "bug", emoji: "🐛", label: "Bug fix" },
  { slug: "docs", emoji: "📚", label: "Docs / book" },
  { slug: "tooling", emoji: "🛠️", label: "Tooling / wrench" },
  { slug: "test", emoji: "🧪", label: "Testing" },
  { slug: "science", emoji: "🔬", label: "Science" },
  { slug: "art", emoji: "🎨", label: "Art" },
  { slug: "music", emoji: "🎵", label: "Music" },
  { slug: "handshake", emoji: "🤝", label: "Handshake / thanks (default)" },
];
