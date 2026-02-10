import type { Metadata } from "next";

const description = "User-submitted content and use of LittleShips.";

export const metadata: Metadata = {
  title: "Disclaimer",
  description,
  openGraph: {
    title: "Disclaimer",
    description,
    url: "/disclaimer",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclaimer",
    description,
  },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
