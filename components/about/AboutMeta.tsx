/*
 * Three-line summary — numbered, ruled rows.
 *
 * Reuses the numeral device the nav menu and the Branding process both run
 * on: mono, tabular-nums, in its own column so the labels stay on one left
 * edge however wide the numerals get. Each row takes a top rule except the
 * first, which would otherwise double the rail's own hairline.
 */
import Spread from "@/components/site/Spread";
import { about } from "@/content/about";

export default function AboutMeta() {
  return (
    <Spread
      tight
      rail={
        <>
          <p>{about.metaEyebrow.latin}</p>
          <span aria-hidden="true" className="block h-px w-full bg-line-09" />
          <p lang="ja" className="font-ja tracking-[0.14em] text-muted-3">
            {about.metaEyebrow.ja}
          </p>
        </>
      }
    >
      <ul className="flex flex-col">
        {about.meta.map((item, i) => (
          <li
            key={item.numeral}
            data-reveal=""
            className={`grid grid-cols-[auto_1fr] items-baseline gap-x-[clamp(20px,3vw,56px)] py-[clamp(20px,2.8vh,38px)] ${
              i === 0 ? "pt-0" : "border-t border-line-09"
            }`}
          >
            <span
              aria-hidden="true"
              className="font-mono-ui text-meta leading-[1.6] text-muted-2 tabular-nums"
            >
              {item.numeral}
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="text-[clamp(20px,1.7vw,28px)]/[1.2] font-semibold tracking-[-0.015em] text-ink">
                {item.latin}
              </span>
              <span
                lang="ja"
                className="font-ja text-meta tracking-[0.14em] text-muted-3"
              >
                {item.ja}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Spread>
  );
}
