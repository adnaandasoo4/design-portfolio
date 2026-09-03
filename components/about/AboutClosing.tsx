/*
 * Closing statement — the page's one section without a rail.
 *
 * Deliberate: after three spreads the two-column rhythm is established well
 * enough that dropping it reads as emphasis. The Branding page uses its
 * full-bleed band the same way. This runs at display size and then hands
 * over to the footer.
 *
 * The line is the scaffold's closing sentence, which it also stored as a
 * third body paragraph; it appears here and nowhere else (content/about.ts).
 */
import { about } from "@/content/about";

export default function AboutClosing() {
  return (
    <section
      aria-label="Closing"
      className="relative bg-bg px-5 py-[clamp(120px,18vh,220px)] max-b700:px-4 max-b700:py-20"
    >
      <p
        data-reveal=""
        className="max-w-[22ch] font-hkgw text-[clamp(28px,4.4vw,76px)]/[1.02] font-semibold tracking-[-0.02em] text-ink uppercase"
      >
        {about.closing}
      </p>
    </section>
  );
}
