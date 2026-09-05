/*
 * Branding masthead — the page's <h1> and its opening paragraph, in the
 * shared Spread. Set uppercase in HK Grotesk Wide to match the home hero
 * rather than the reference's sentence case; this is the same site, and the
 * masthead face is what says so.
 *
 * font-bold here (as on the home h1) is SYNTHESISED — app/fonts/ carries
 * only Regular and SemiBold cuts. Deliberate, per the user; a real Bold OTF
 * would upgrade every masthead at once with no code change.
 */
import Spread from "@/components/site/Spread";
import { branding } from "@/content/branding";

export default function BrandingMasthead() {
  return (
    <Spread eyebrow={branding.eyebrow} note={branding.meta}>
      <h1
        data-reveal=""
        className="font-hkgw text-[clamp(2.75rem,7.4vw,8.25rem)]/[0.9] font-bold tracking-[-0.025em] text-ink uppercase"
      >
        {branding.title}
      </h1>
      <p
        data-reveal=""
        className="mt-[clamp(1.75rem,4vh,3.5rem)] max-w-[54ch] font-manrope text-meta/[1.7] text-muted-2"
      >
        {branding.intro}
      </p>
    </Spread>
  );
}
