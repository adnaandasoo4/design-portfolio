/*
 * Spread — the two-column rhythm the whole Branding page is built on.
 *
 * This IS the About-section layout the user asked for, captured once
 * instead of retyped per section: the page's gutters (20px, matching the
 * hero, so the grid runs unbroken down the site), a rail on the left
 * holding a mono label, a hairline and an optional note, and the content
 * on the right. Because every section renders through it, the label
 * positions, the column split and the vertical rhythm are identical from
 * the masthead to the gallery — which is the whole point of reusing the
 * format rather than approximating it four times.
 *
 * Below 860px the columns stack, since a 0.3fr rail is not a column any
 * more at that width.
 */
import type { ReactNode } from "react";

export default function Spread({
  eyebrow,
  note,
  children,
  className = "",
  tight = false,
}: {
  /** Mono label at the top of the rail, e.g. "( branding )" */
  eyebrow: string;
  /** Optional line(s) under the rail's hairline; \n breaks are honoured */
  note?: string;
  children: ReactNode;
  className?: string;
  /** Half the vertical padding — for sections that follow a full-bleed band */
  tight?: boolean;
}) {
  return (
    <section
      className={`relative bg-bg px-5 max-b700:px-4 ${
        tight
          ? "py-[clamp(72px,10vh,130px)] max-b700:py-14"
          : "py-[clamp(140px,20vh,260px)] max-b700:py-24"
      } ${className}`}
    >
      <div className="grid grid-cols-[0.3fr_1fr] gap-x-[6vw] max-b860:grid-cols-1 max-b860:gap-y-12">
        {/* RAIL — label, hairline, note. Mono/grey/--text-meta, the same
            secondary tier the home page's eyebrow and paragraph use. */}
        <div
          data-reveal=""
          className="flex flex-col items-start gap-5 font-mono-ui text-meta/[1.6] text-muted-2"
        >
          <p>{eyebrow}</p>
          <span aria-hidden="true" className="block h-px w-full bg-line-09" />
          {note ? <p className="whitespace-pre-line">{note}</p> : null}
        </div>

        <div>{children}</div>
      </div>
    </section>
  );
}
