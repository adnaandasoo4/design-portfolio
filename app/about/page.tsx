import type { Metadata } from "next";
import RevealGroup from "@/components/site/RevealGroup";
import AboutOpening from "@/components/about/AboutOpening";
import AboutLead from "@/components/about/AboutLead";
import AboutPortrait from "@/components/about/AboutPortrait";
import AboutFacts from "@/components/about/AboutFacts";
import AboutClosing from "@/components/about/AboutClosing";
import Footer from "@/components/site/Footer";
import { about } from "@/content/about";

/*
 * About (§A9) — rebuilt 2026-09-03, twice. The first attempt ran every
 * section through the shared Spread; consistent, and dead. Four identical
 * two-column blocks with the same rail in each read as a template rather
 * than a page, and the illustration — the only real image in the project —
 * was a thumbnail in a 0.3fr column.
 *
 * This version is built on CONTRAST instead of consistency, because the
 * shared grid is the home page's job and an about page has a different one:
 *
 *   Opening    a full viewport, mostly empty, headline pinned to the floor
 *   Lead       one line, indented deep into the measure, alone on a screen
 *   Portrait   asymmetric — a 9:16 image at 38vw with the narrative
 *              bottom-aligned beside it
 *   Facts      a wide, even, three-across row, the page's only regular grid
 *   Closing    display scale, tight measure, the most air on the page
 *
 * No two of those are the same shape, and the vertical padding is
 * deliberately uneven — generous, generous, tight, medium, widest — so the
 * page has a pulse rather than a constant. Gutters stay at the site's 20px
 * throughout, which is what keeps it recognisably the same site while
 * nothing else repeats.
 *
 * Motion: ONE set piece — the opening headline splits into lines and rises
 * through a mask on load — plus a scrub parallax on the portrait. Every
 * other element uses RevealGroup's ordinary rise. Reduced motion renders
 * everything static.
 *
 * The experience timeline is still NOT here: its data is "20XX / role —
 * tbd" (Open Q5), and three placeholder rows would read as broken. The copy
 * waits in content/about.ts.
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
          <AboutOpening />
          <AboutLead />
          <AboutPortrait />
          <AboutFacts />
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
