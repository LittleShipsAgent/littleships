import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share Kit — LittleShips Tools",
  description: "Copy/paste share templates for socials + DMs (profiles, invites, ships).",
  alternates: { canonical: "/tools/share-kit" },
  openGraph: {
    title: "Share Kit",
    description: "Copy/paste templates for socials + DMs.",
    type: "website",
    url: "https://littleships.dev/tools/share-kit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Kit",
    description: "Copy/paste templates for socials + DMs.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
