/*
 * Three facts — a horizontal row, and the only place on the page where
 * anything is set in threes.
 *
 * Shape is doing the work here: after a full-height opening, an indented
 * line and a tall asymmetric spread, a wide even row is the first thing
 * that reads as regular. That contrast is what stops the page feeling like
 * one long column, and it is why the numerals sit ABOVE their labels rather
 * than beside them — a horizontal rhythm, where every other numbered list
 * on this site runs vertical.
 */
import { about } from "@/content/about";

export default function AboutFacts() {
  return (
    <section
      aria-label="In three"
      className="relative bg-bg px-5 py-[clamp(100px,16vh,220px)] max-b700:px-4 max-b700:py-20"
    >
      <div
        data-reveal=""
        className="flex items-baseline justify-between gap-6 font-manrope text-meta leading-none text-muted-2"
      >
        <p>{about.metaEyebrow.latin}</p>
        <p lang="ja" className="font-ja tracking-[0.14em]">
          {about.metaEyebrow.ja}
        </p>
      </div>
      <span aria-hidden="true" className="mt-5 block h-px w-full bg-line-09" />

      <ul className="mt-[clamp(44px,7vh,96px)] grid grid-cols-3 gap-x-[clamp(24px,5vw,90px)] max-b860:grid-cols-1 max-b860:gap-y-12">
        {about.meta.map((item) => (
          <li key={item.numeral} data-reveal="" className="flex flex-col">
            <span
              aria-hidden="true"
              className="font-manrope text-meta leading-none text-muted-3 tabular-nums"
            >
              {item.numeral}
            </span>
            <span className="mt-[clamp(16px,2.4vh,32px)] text-[clamp(20px,2.2vw,38px)]/[1.15] font-semibold tracking-[-0.018em] text-ink">
              {item.latin}
            </span>
            <span
              lang="ja"
              className="mt-2.5 font-ja text-meta tracking-[0.14em] text-muted-3"
            >
              {item.ja}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
