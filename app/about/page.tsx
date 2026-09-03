import type { Metadata } from "next";
import RevealGroup from "@/components/site/RevealGroup";
import AboutMasthead from "@/components/about/AboutMasthead";
import AboutBio from "@/components/about/AboutBio";
import AboutMeta from "@/components/about/AboutMeta";
import AboutClosing from "@/components/about/AboutClosing";
import Footer from "@/components/site/Footer";
import { about } from "@/content/about";

/*
 * About (§A9) — rebuilt 2026-09-03 on the site's shared format.
 *
 * The previous build predated the revamp: 36px gutters nobody else uses, a
 * marquee band, a pinned SplitText opening and a portrait parallax — two
 * signature motion moments designed when the page was meant to be the
 * slow, editorial outlier. It is not the outlier any more; home, Branding
 * and this page now share one grid, and looking different was the only
 * thing keeping /about from looking like the same site.
 *
 * Every section runs through components/site/Spread — the same rail-and-
 * content rhythm on the same 20px gutters as the home hero — except the
 * closing, which drops the rail on purpose so the break reads as emphasis.
 *
 * Order: masthead → bio (illustration in the rail) → three-line summary →
 * closing → footer. The experience timeline is NOT here: its data is still
 * "20XX / role — tbd" (Open Q5), and three placeholder rows would read as a
 * broken section. The copy is held in content/about.ts, ready.
 *
 * Motion is now the site's ordinary vocabulary rather than two bespoke set
 * pieces: RevealGroup rises anything marked [data-reveal] once on enter,
 * and reduced motion renders everything static.
 */

export const metadata: Metadata = {
  // layout template appends the site name → "about — Adnaan Dasoo"
  title: "about",
  description: about.opening,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "about — Adnaan Dasoo",
    description: about.headline,
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    // tabIndex={-1}: the route veil moves focus to <main> on arrival (§A10);
    // outline-none suppresses the programmatic-focus ring on the page itself.
    <>
      <main
        tabIndex={-1}
        className="relative overflow-x-clip bg-bg outline-none"
      >
        <RevealGroup className="relative z-(--z-flow)">
          <AboutMasthead />
          <AboutBio />
          <AboutMeta />
          <AboutClosing />
        </RevealGroup>
      </main>
      {/* Outside <main> so it maps to the contentinfo landmark (§A10) */}
      <div className="relative z-(--z-flow) overflow-x-clip">
        <Footer />
      </div>
    </>
  );
}
