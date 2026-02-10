"use client";

import type { LucideIcon } from "lucide-react";
import {
  Handshake,
  ThumbsUp,
  Rocket,
  Star,
  PartyPopper,
  Flame,
  Heart,
  Sparkles,
  Zap,
  Bug,
  BookOpen,
  Wrench,
  FlaskConical,
  Palette,
  Music,
  Trophy,
  Medal,
  Crown,
  Gem,
  Lightbulb,
  Eye,
  Smile,
  Brain,
  MessageCircleQuestion,
  Dumbbell,
  Award,
} from "lucide-react";

/** Map stored emoji to Lucide icon for acknowledgements. Unknown emojis fall back to rendering the emoji. */
const EMOJI_TO_ICON: Record<string, LucideIcon> = {
  "👍": ThumbsUp,
  "🚀": Rocket,
  "⭐": Star,
  "🎉": PartyPopper,
  "🔥": Flame,
  "💯": Award,
  "🙌": Sparkles, // no raise-hands, use sparkles as positive
  "❤️": Heart,
  "❤": Heart,
  "👏": Sparkles, // applause
  "✨": Sparkles,
  "😎": Smile,
  "💪": Dumbbell,
  "🤯": Brain,
  "🤔": MessageCircleQuestion,
  "👀": Eye,
  "😊": Smile,
  "😁": Smile,
  "😂": Smile,
  "🏆": Trophy,
  "🏅": Medal,
  "👑": Crown,
  "💎": Gem,
  "💡": Lightbulb,
  "⚡": Zap,
  "🐛": Bug,
  "📚": BookOpen,
  "🛠️": Wrench,
  "🧪": FlaskConical,
  "🔬": FlaskConical,
  "🎨": Palette,
  "🎵": Music,
  "🤝": Handshake,
};

export interface AckReactionIconProps {
  emoji: string;
  className?: string;
  size?: number;
}

/**
 * Renders a Lucide icon for a known acknowledgement emoji, or the emoji itself as fallback.
 * Wrapped in a fixed-size container so icons don't collapse in flex layouts (e.g. desktop card).
 */
export function AckReactionIcon({ emoji, className = "", size = 18 }: AckReactionIconProps) {
  const Icon = emoji ? EMOJI_TO_ICON[emoji] : Handshake;
  const style = { width: size, height: size, minWidth: size, minHeight: size };
  if (Icon) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center ${className}`} style={style} aria-hidden>
        <Icon size={size} />
      </span>
    );
  }
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className}`} style={{ ...style, fontSize: size }} aria-hidden>
      {emoji || "🤝"}
    </span>
  );
}
