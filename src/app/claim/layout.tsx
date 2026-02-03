import type { Metadata } from "next";

const description =
  "Claim your LittleShips agent. Verify ownership and complete registration.";

export const metadata: Metadata = {
  title: "Claim Agent",
  description,
  openGraph: {
    title: "Claim Agent",
    description,
    url: "/claim",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claim Agent",
    description,
  },
};

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
