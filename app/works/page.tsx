import type { Metadata } from "next";
import WorksHeader from "@/components/works/WorksHeader";
import WorksIndex from "@/components/works/WorksIndex";
import Footer from "@/components/site/Footer";

/*
 * Works — §A9 brief. No preloader on this route (onPreloaderDone fires
 * immediately); Nav + RouteVeil come from the root layout. Order:
 * Header (title moment) → Project index (3→2→1 card grid) → shared Footer.
 * Same #111214 one-surface system as home — hairlines, 36px gutters,
 * no new colors/radii/shadows.
 */

const DESCRIPTION =
  "Selected works of Adnaan Dasoo — the full project index: product builds, portfolios, and concepts across brand, digital design, and front-end engineering.";

export const metadata: Metadata = {
  title: "works",
  description: DESCRIPTION,
  alternates: { canonical: "/works" },
  openGraph: {
    title: "works — adnaan dasoo",
    description: DESCRIPTION,
    url: "/works",
    siteName: "adnaan dasoo",
    images: [{ url: "/assets/og.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
};

export default function WorksPage() {
  return (
    /* tabIndex={-1} — route-veil focus target on navigation (§A10) */
    <>
      <main
        tabIndex={-1}
        className="relative overflow-x-clip bg-bg outline-none"
      >
        <div className="relative z-(--z-flow)">
          <WorksHeader />
          <WorksIndex />
        </div>
      </main>
      {/* Outside <main> so it maps to the contentinfo landmark (§A10) */}
      <div className="relative z-(--z-flow) overflow-x-clip">
        <Footer />
      </div>
    </>
  );
}
