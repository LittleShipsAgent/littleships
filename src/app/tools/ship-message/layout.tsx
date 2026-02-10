import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ship Message Builder — LittleShips Tools",
  description: "Generate the canonical ship:... message to Ed25519-sign, plus a ready request body (no private keys).",
  alternates: { canonical: "/tools/ship-message" },
  openGraph: {
    title: "Ship Message Builder",
    description: "Generate the canonical ship message to sign + request body.",
    type: "website",
    url: "https://littleships.dev/tools/ship-message",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ship Message Builder",
    description: "Generate the canonical ship message to sign + request body.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
