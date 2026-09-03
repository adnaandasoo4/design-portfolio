import type { Metadata } from "next";
import RevealGroup from "@/components/site/RevealGroup";
import BrandingMasthead from "@/components/branding/BrandingMasthead";
import BrandingServices from "@/components/branding/BrandingServices";
import BrandingBand from "@/components/branding/BrandingBand";
import BrandingProcess from "@/components/branding/BrandingProcess";
import BrandingGallery from "@/components/branding/BrandingGallery";
import Footer from "@/components/site/Footer";
import { branding } from "@/content/branding";

/*
 * Branding (user-directed, 2026-09-02) — the service page the nav's
 * "Branding" link had been pointing at nothing since the menu was built.
 *
 * Every section runs through components/branding/Spread, which is the About
 * section's two-column format captured once: 20px gutters shared with the
 * home hero, a mono rail on the left, content on the right. Reusing one
 * wrapper is what makes the rhythm identical section to section instead of
 * four approximations of it.
 *
 * Order: masthead → what it covers → full-bleed band → how it runs →
 * in practice → footer. The band is the page's single full-bleed moment,
 * placed so the rail rhythm has something to break against before the
 * process picks it up again; the two sections after it run `tight`, at half
 * the vertical padding, so the lower half of the page does not drift apart.
 *
 * RevealGroup wraps the flow: anything marked [data-reveal] rises in once on
 * enter. Reduced motion renders everything static — nothing is ever hidden.
 */

export const metadata: Metadata = {
  // layout template appends the site name → "branding — Adnaan Dasoo"
  title: "branding",
  description: branding.intro,
  alternates: { canonical: "/branding" },
  openGraph: {
    title: "branding — Adnaan Dasoo",
    description: branding.intro,
    url: "/branding",
  },
};

export default function BrandingPage() {
  return (
    // tabIndex={-1}: the route veil moves focus to <main> on arrival (§A10);
    // outline-none suppresses the programmatic-focus ring on the page itself.
    <>
      <main
        tabIndex={-1}
        className="relative overflow-x-clip bg-bg outline-none"
      >
        <RevealGroup className="relative z-(--z-flow)">
          <BrandingMasthead />
          <BrandingServices />
          <BrandingBand />
          <BrandingProcess />
          <BrandingGallery />
        </RevealGroup>
      </main>
      {/* Outside <main> so it maps to the contentinfo landmark (§A10) */}
      <div className="relative z-(--z-flow) overflow-x-clip">
        <Footer />
      </div>
    </>
  );
}
