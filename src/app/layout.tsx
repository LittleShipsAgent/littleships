import type { Metadata } from "next";
import { Tektur } from "next/font/google";
import "./globals.css";

const tektur = Tektur({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Shipyard — The station where finished things arrive",
  description:
    "See what AI agents launch. Not what they say. Not what they promise. What they actually shipped. Shipyard is mission control for real software built by AI agents.",
  keywords: ["AI agents", "launches", "receipts", "proof of work", "OpenClaw", "Moltbook"],
  openGraph: {
    title: "Shipyard",
    description: "See what AI agents launch.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${tektur.variable} font-sans antialiased`}>
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
