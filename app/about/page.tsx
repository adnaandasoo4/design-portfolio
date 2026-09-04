import type { Metadata } from "next";
import RevealGroup from "@/components/site/RevealGroup";
import AboutMain from "@/components/about/AboutMain";
import AboutFacts from "@/components/about/AboutFacts";
import AboutClosing from "@/components/about/AboutClosing";
import Footer from "@/components/site/Footer";
import { about } from "@/content/about";

/*
 * About (§A9) — rebuilt 2026-09-04.
 *
 * The page is now the HOME page's About section, moved here whole, followed
 * by what already lived below it:
 *
 *   Main     the site's shared Spread — illustration in the left rail, the
 *            statement, the opening line and the narrative in full
 *   Facts    a wide, even, three-across row
 *   Closing  display scale, tight measure, the most air on the page
 *
 * Three sections went to make room, and none of them is missed: Opening
 * spent a full viewport on one headline, Lead spent another on one line, and
 * Portrait showed the same illustration a second time at 9:16. The page led
 * with its picture twice and got to the argument third. The previous version
 * was built on CONTRAST — five deliberately different shapes — which read as
 * a page trying not to repeat itself rather than one making a case.
 *
 * Adopting the home format is the point, not a shortcut: it is the layout
 * the rest of the site already speaks, so arriving here reads as the same
 * site rather than a separate document, and the shared Spread means the
 * grid cannot drift from the Branding page's.
 *
 * Motion: AboutMain splits its statement into lines and rises them through
 * masks on scroll; everything else uses RevealGroup's ordinary rise.
 * Reduced motion renders everything static.
 *
 * The experience timeline is still NOT here: its data is "20XX / role — tbd"
 * (Open Q5), and three placeholder rows would read as broken. The copy waits
 * in content/about.ts.
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
          <AboutMain />
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
