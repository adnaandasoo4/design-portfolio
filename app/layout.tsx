/*
 * Root layout — site metadata/JSON-LD, Manrope, the pre-paint theme-init
 * script (§A5 Theme toggle), and the fixed chrome (RouteVeil, Preloader, Nav)
 * mounted OUTSIDE <SmoothScroll> (§A2 z-layers; the preloader inerts the
 * #smooth-wrapper during its lock window).
 */
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/lib/gsap/SmoothScroll";
import Nav from "@/components/site/Nav";
import Preloader from "@/components/site/Preloader";
import RouteVeil from "@/components/site/RouteVeil";

const manrope = Manrope({
  variable: "--font-manrope-next",
  subsets: ["latin"],
  display: "swap",
});

/* HK Grotesk Wide (§A3) — display face for the giant hero name only */
const hkGroteskWide = localFont({
  src: [
    {
      path: "./fonts/HKGroteskWide-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/HKGroteskWide-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-hkgw-next",
  display: "swap",
});

const SITE_URL = "https://adnaandasoo.com"; // TODO: confirm final domain

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "adnaan dasoo — designer × engineer",
    template: "%s — adnaan dasoo",
  },
  description:
    "Portfolio of Adnaan Dasoo, a Baltimore-based designer and engineer. Visual identities, digital design, and production-grade builds — design and engineering held to the same standard.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "adnaan dasoo — designer × engineer",
    description:
      "Visual identities, digital design, and production-grade builds — design and engineering held to the same standard.",
    url: SITE_URL,
    siteName: "adnaan dasoo",
    images: [{ url: "/assets/og.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "adnaan dasoo — designer × engineer",
    images: ["/assets/og.png"],
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#111214",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Adnaan Dasoo",
  jobTitle: "Designer & Engineer",
  email: "mailto:adnaandasoo@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Baltimore",
    addressRegion: "MD",
    addressCountry: "US",
  },
  url: SITE_URL,
  sameAs: [] as string[], // TODO: real social URLs (§A10 / Open Q5)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${hkGroteskWide.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme init before paint — avoids FOUC (§A5 Theme toggle) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('ad-theme')==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>
        {/* Fixed chrome lives outside the ScrollSmoother transform context
            (position:fixed breaks inside the transformed #smooth-content) */}
        <RouteVeil />
        <Preloader />
        <header>
          <Nav />
        </header>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
