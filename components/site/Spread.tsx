/*
 * Spread — the site's two-column editorial format, in one place.
 *
 * The home page's About section and every section of the Branding page are
 * the same layout: the hero's 20px gutters so the grid runs unbroken down
 * the site, a rail on the left, and the content on the right. It lives here
 * rather than in either consumer because "the About format" is now a thing
 * the site has, not a thing one section does — and two hand-kept copies of
 * a grid drift the first time anyone adjusts one of them.
 *
 * The content column carries a right inset equal to the column gap, so the
 * copy is inset from the page edge by the same 6vw that separates it from
 * the rail. Shared, which means the Branding page's four sections take the
 * measure change too — that is the format doing its job, not a side effect.
 *
 * The rail defaults to a small label, a hairline and an optional note. Pass
 * `rail` to replace that entirely, which is what About does to put its
 * illustration there instead. Either way the rail is a single grid cell
 * under `items-start`, so whatever leads it sits level with whatever leads
 * the content — no margin to hand-tune per breakpoint.
 *
 * The rail is marked [data-reveal] and nothing more, so it rises with
 * whichever reveal the host page runs: RevealGroup on the Branding page,
 * About's own scroll trigger on home. Neither has to know about the other.
 *
 * Below 860px the columns stack, since a 0.3fr rail is not a column any
 * more at that width.
 */
import type { ReactNode } from "react";

export default function Spread({
  eyebrow,
  note,
  rail,
  children,
  className = "",
  tight = false,
  id,
  ariaLabel,
}: {
  /** Label at the top of the default rail, e.g. "( branding )" */
  eyebrow?: string;
  /** Optional line(s) under the default rail's hairline; \n is honoured */
  note?: string;
  /** Replaces the default rail contents outright */
  rail?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Half the vertical padding — for sections that follow a full-bleed band */
  tight?: boolean;
  /** Anchor target, when the section is a scroll destination */
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative bg-bg px-5 max-b700:px-4 ${
        tight
          ? "py-[clamp(72px,10vh,130px)] max-b700:py-14"
          : "py-[clamp(140px,20vh,260px)] max-b700:py-24"
      } ${className}`}
    >
      {/* items-start keeps each column's first element on the row's top edge
          — that alignment is the grid's job, not a margin's.

          The 6vw gutter is used TWICE: once as the column gap, and again as
          the content column's right inset, so the copy ends as far from the
          page edge as it begins from the rail (user, 2026-09-03). The two
          numbers must stay equal — that is the whole point of the rule — so
          treat them as one value in two places. Below 860px the columns
          stack and the inset goes, since there is no rail beside the copy to
          balance against. */}
      <div className="grid grid-cols-[0.3fr_1fr] items-start gap-x-[6vw] max-b860:grid-cols-1 max-b860:gap-y-12">
        <div
          data-reveal=""
          className="flex flex-col items-start gap-5 font-manrope text-meta/[1.6] text-muted-2"
        >
          {rail ?? (
            <>
              {eyebrow ? <p>{eyebrow}</p> : null}
              <span
                aria-hidden="true"
                className="block h-px w-full bg-line-09"
              />
              {note ? <p className="whitespace-pre-line">{note}</p> : null}
            </>
          )}
        </div>

        <div className="pr-[6vw] max-b860:pr-0">{children}</div>
      </div>
    </section>
  );
}
