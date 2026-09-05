/*
 * Closing — the page's last statement, at display scale, with the most
 * generous padding on the page above and below it.
 *
 * The measure is capped tight (18ch) so the line breaks into three or four
 * short rows and stacks rather than running. At this size a full-width
 * measure stops being a statement and becomes a paragraph set too large.
 */
import { about } from "@/content/about";

export default function AboutClosing() {
  return (
    <section
      aria-label="Closing"
      className="relative bg-bg px-5 py-[clamp(8.75rem,24vh,20rem)] max-b700:px-4 max-b700:py-28"
    >
      <p
        data-reveal=""
        className="max-w-[18ch] font-hkgw text-[clamp(1.875rem,5.2vw,5.875rem)]/[0.96] font-bold tracking-[-0.025em] text-ink uppercase max-b700:text-[8vw]"
      >
        {about.closing}
      </p>
    </section>
  );
}
