import type { Metadata } from "next";
import AboutIntro from "@/components/about/AboutIntro";
import AboutBio from "@/components/about/AboutBio";
import AboutMeta from "@/components/about/AboutMeta";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutClosing from "@/components/about/AboutClosing";
import Footer from "@/components/site/Footer";
import { about } from "@/content/about";

/*
 * About — designed from the §A9 brief within the home system: same #111214
 * surface, white ink, hairline separators, 36px gutters, full-bleed. Slower
 * and more editorial than home; exactly two signature motion moments —
 * the SplitText opening-line reveal (AboutIntro) and the portrait parallax
 * (AboutBio). Order: Intro → Bio → Meta strip → Timeline → Closing → Footer.
 * No preloader on this route (onPreloaderDone resolves immediately).
 */

export const metadata: Metadata = {
  // layout template appends the site name → "about — adnaan dasoo"
  title: "about",
  description: about.paragraphs[0],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "about — adnaan dasoo",
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
        <AboutIntro />
        <div className="relative z-(--z-flow)">
          <AboutBio />
          <AboutMeta />
          <AboutTimeline />
          <AboutClosing />
        </div>
      </main>
      {/* Outside <main> so it maps to the contentinfo landmark (§A10) */}
      <div className="relative z-(--z-flow) overflow-x-clip">
        <Footer />
      </div>
    </>
  );
}
