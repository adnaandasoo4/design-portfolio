/*
 * About — Experience timeline (§A9 About brief, section 4). Vertical
 * hairline-separated rows (year · role · org) in the work-list row idiom:
 * each row carries its own top line-09 rule, year sits in the numeral gutter,
 * org right-aligned at the far gutter like a work-row side label. Rows rise
 * in once on enter via RevealGroup (stagger .06).
 *
 * DATA IS PLACEHOLDER — content/about.ts timeline is marked TBD (Open Q5);
 * rendered honestly as "20XX · role — tbd · organization — tbd" until the
 * real experience data is supplied.
 */

import RevealGroup from "@/components/about/RevealGroup";
import { about } from "@/content/about";

export default function AboutTimeline() {
  return (
    <section
      id="timeline"
      aria-label="Experience"
      className="relative z-(--z-section) bg-bg pb-[clamp(56px,9vh,110px)]"
    >
      <RevealGroup>
        <ol className="list-none p-0 m-0">
          {about.timeline.map((t, i) => (
            <li
              key={i}
              data-reveal
              className="grid grid-cols-[clamp(120px,15vw,300px)_1.32fr_1fr] items-baseline gap-10 border-t border-line-09 px-9 py-[clamp(28px,4.5vh,46px)] max-b700:grid-cols-1 max-b700:gap-2 max-b700:px-5.5 max-b700:py-5.5"
            >
              {/* year — numeral-gutter idiom */}
              <span className="text-[18px] leading-none font-normal text-muted-2">
                {t.year}
              </span>

              {/* role */}
              <span className="font-medium text-[clamp(20px,1.8vw,26px)] leading-[1.2] tracking-[-0.01em] text-ink">
                {t.role}
              </span>

              {/* org — right-aligned at the far gutter (side-label idiom) */}
              <span className="text-right text-[18px] leading-[1.4] font-normal text-muted-1 max-b700:text-left">
                {t.org}
              </span>
            </li>
          ))}
        </ol>
      </RevealGroup>
    </section>
  );
}
