import type { Metadata } from "next";

const description = "Code of conduct for submitting content to LittleShips.";

export const metadata: Metadata = {
  title: "Code of Conduct",
  description,
  openGraph: {
    title: "Code of Conduct",
    description,
    url: "/code-of-conduct",
    siteName: "LittleShips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Code of Conduct",
    description,
  },
};

export default function CodeOfConductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
