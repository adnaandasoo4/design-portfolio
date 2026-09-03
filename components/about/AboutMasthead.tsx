/*
 * About masthead — the page's <h1> and its opening line, in the site's
 * shared Spread. Same rail-and-content rhythm as the Branding page and the
 * home About section, on the same 20px gutters, so /about is recognisably
 * the same site rather than a page that happens to share a palette.
 *
 * The rail carries the bilingual label; the JP line is the site's own
 * device (the footer sign-off, the work marquee) rather than an import.
 */
import Spread from "@/components/site/Spread";
import { about } from "@/content/about";

export default function AboutMasthead() {
  return (
    <Spread
      ariaLabel="About"
      rail={
        <>
          <p>{about.eyebrow.latin}</p>
          <span aria-hidden="true" className="block h-px w-full bg-line-09" />
          <p lang="ja" className="font-ja tracking-[0.14em] text-muted-3">
            {about.eyebrow.ja}
          </p>
        </>
      }
    >
      <h1
        data-about-headline=""
        className="font-hkgw text-[clamp(28px,3.6vw,62px)]/[1.02] font-bold tracking-[-0.02em] text-ink uppercase"
      >
        {about.headline}
      </h1>
      <p
        data-reveal=""
        className="mt-[clamp(28px,4vh,56px)] font-mono-ui text-meta/[1.85] text-muted-2"
      >
        {about.opening}
      </p>
    </Spread>
  );
}
