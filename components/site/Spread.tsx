/*
 * Spread — the site's two-column editorial format, in one place.
 *
 * The home page's About section and every section of the Branding page are
 * the same layout: the hero's 20px gutters so the grid runs unbroken down
 * the site, a rail on the left holding a mono label, a hairline and an
 * optional note, and the content on the right. It lives here rather than in
 * either consumer because "the About format" is now a thing the site has,
 * not a thing one section does — and two hand-kept copies of a grid drift
 * the first time anyone adjusts one of them.
 *
 * The rail is marked [data-reveal], so it rises with whatever reveal the
 * host page runs: RevealGroup on the Branding page, About's own scroll
 * trigger on home. Neither has to know about the other.
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
  id,
  ariaLabel,
  railExtra,
}: {
  /** Mono label at the top of the rail, e.g. "( branding )" */
  eyebrow: string;
  /** Optional line(s) under the rail's hairline; \n breaks are honoured */
  note?: string;
  /** Optional block at the FOOT of the rail — an image, a stat, a link.
   *  Sits inside the rail's reveal, so it rises with the label above it. */
  railExtra?: ReactNode;
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
          {railExtra}
        </div>

        <div>{children}</div>
      </div>
    </section>
  );
}
