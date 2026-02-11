export type SponsorCardData = {
  id: string;
  title: string;
  tagline: string;
  href: string;
  logoText?: string; // v0 placeholder: initials or short text
  bgColor?: string; // future: curated palette token
};

// v0 placeholder inventory. Replace with DB-backed sponsors.
export const placeholderSponsors: SponsorCardData[] = Array.from({ length: 19 }).map((_, i) => ({
  id: `placeholder-${i + 1}`,
  title: "Available",
  tagline: "Click to advertise",
  href: "/sponsor",
  logoText: "◎",
}));
