/*
 * About — Meta strip (§A9 About brief, section 3). The three about.meta items
 * (numeral · latin · ja) as a hairline-separated three-up row echoing the
 * disciplines numeral system. Vertical line-055 rules between cells on
 * desktop; the cells stack with horizontal rules ≤860 (§A4 sm). Standard
 * once-on-enter rise via RevealGroup.
 */

import RevealGroup from "@/components/about/RevealGroup";
import { about } from "@/content/about";

export default function AboutMeta() {
  return (
    <section
      id="meta"
      aria-label="At a glance"
      className="relative z-(--z-section) bg-bg"
    >
      {/* Section hairline — edge to edge */}
      <div aria-hidden="true" className="h-px bg-line-09" />

      <RevealGroup className="grid grid-cols-3 gap-10 px-9 py-[clamp(56px,9vh,100px)] max-b860:grid-cols-1 max-b860:gap-0 max-b860:py-9 max-b700:px-5.5">
        {about.meta.map((m, i) => (
          <div
            key={m.numeral}
            data-reveal
            className={`flex flex-col max-b860:py-7 ${
              i > 0
                ? "border-l border-line-055 pl-10 max-b860:border-t max-b860:border-l-0 max-b860:pl-0"
                : ""
            }`}
          >
            <span className="text-[18px] leading-none font-normal text-muted-2">
              {m.numeral}
            </span>
            <span className="mt-5.5 font-medium text-[clamp(22px,2vw,32px)] leading-[1.15] tracking-[-0.015em] text-ink">
              {m.latin}
            </span>
            <span
              lang="ja"
              className="mt-2.5 font-ja text-[15px] leading-none font-normal tracking-[0.12em] text-muted-2"
            >
              {m.ja}
            </span>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}
