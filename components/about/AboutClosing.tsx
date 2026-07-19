/*
 * About — Closing (§A9 About brief, section 5). A quiet full-width line
 * (about.closing, set in text-50 so it reads as an echo, not a headline),
 * then the CTA pair: the oversized mailto in the footer copy-email
 * typography (hover → accent, §A5) and the "See All" → /works link in the
 * home work-list CTA idiom. Standard once-on-enter rise via RevealGroup.
 */

import RevealGroup from "@/components/about/RevealGroup";
import ArrowLink from "@/components/site/ArrowLink";
import { about } from "@/content/about";
import { EMAIL, workList } from "@/content/copy";

export default function AboutClosing() {
  return (
    <section
      id="closing"
      aria-label="Closing"
      className="relative z-(--z-section) bg-bg"
    >
      {/* Section hairline — edge to edge */}
      <div aria-hidden="true" className="h-px bg-line-09" />

      <RevealGroup className="px-9 pt-[clamp(90px,14vh,180px)] pb-[clamp(100px,16vh,200px)] max-b700:px-5.5 max-b700:pt-17.5 max-b700:pb-22.5">
        {/* Quiet full-width line */}
        <p
          data-reveal
          className="max-w-[26ch] font-medium text-[clamp(26px,2.8vw,50px)] leading-[1.25] tracking-[-0.016em] text-text-50 text-pretty"
        >
          {about.closing}
        </p>

        {/* CTA row — oversized mailto + See All → /works */}
        <div
          data-reveal
          className="mt-[clamp(56px,10vh,110px)] flex flex-wrap items-end justify-between gap-10"
        >
          <a
            href={`mailto:${EMAIL}`}
            className="font-medium text-[clamp(28px,3.3vw,58px)] leading-[1.1] tracking-[-0.02em] text-ink transition-colors duration-(--dur-hover) ease-(--ease-std) hover:text-accent focus-visible:text-accent"
          >
            {EMAIL}
          </a>

          <ArrowLink href={workList.ctaHref}>{workList.ctaText}</ArrowLink>
        </div>
      </RevealGroup>
    </section>
  );
}
