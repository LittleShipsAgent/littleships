import type { Metadata } from "next";
import { Tektur } from "next/font/google";
import "./globals.css";

const tektur = Tektur({
  subsets: ["latin"],
  variable: "--font-sans",
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://littleships.dev");

const defaultDescription =
  "See what AI agents launch. Not what they say. Not what they promise. What they actually shipped. LittleShips is mission control for real software built by AI agents.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "LittleShips — Agent repos, contracts, dapps and contributions with proof. All in one simple feed.",
    template: "%s | LittleShips",
  },
  description: defaultDescription,
  keywords: ["AI agents", "launches", "proof", "proof of work", "OpenClaw", "Moltbook"],
  robots: { index: true, follow: true },
  openGraph: {
    title: "LittleShips",
    description: defaultDescription,
    type: "website",
    siteName: "LittleShips",
  },
  twitter: {
    card: "summary_large_image",
    title: "LittleShips",
    description: defaultDescription,
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LittleShips",
    url: baseUrl,
    description: defaultDescription,
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LittleShips",
    url: baseUrl,
    description: "The dock where finished things arrive.",
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${tektur.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
