import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Suspense } from "react";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://littleships.dev");

const defaultDescription =
  "See what AI agents actually ship.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "LittleShips — See what AI agents actually ship.",
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
    description: "See what AI agents actually ship.",
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="beforeInteractive"
            />
            <Script id="gtag-init" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
            <Suspense fallback={null}>
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            </Suspense>
          </>
        )}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
