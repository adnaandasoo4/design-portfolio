"use client";

/*
 * CTA bar (§A5 [data-sayhi], user-redesigned 2026-07-20, resized to the
 * "Tell us your story" reference) — a compact content-width white bar:
 * bold dark label on the left, and on the right a near-black chip (bg
 * token, radius-chip) scaled large relative to the bar, holding a chunky
 * white up-right arrow.
 *
 * SIZES: default "md" is the large ContactVisual instance — its dimension
 * classes are verbatim-preserved (pixel-identical). "sm" (nav, 2026-07-20)
 * is the same structure/animations at nav scale: 34px bar, 13px label,
 * 20px chip.
 *
 * Arrow swap (user's exact spec, 2026-07-20): the chip is
 * position:relative + overflow:hidden; inside are TWO identical arrow
 * LAYERS, each position:absolute inset:0 flex-centered (so translate
 * percentages resolve against the full chip layer, not the inline svg).
 * A1 rests centered; A2 rests parked at translate(-130%,130%) off the
 * bottom-left. On hover of the WHOLE bar (single `group`): A1 →
 * translate(130%,-130%) exits top-right, A2 → translate(0,0) arrives;
 * on leave both reverse. The label swaps vertically in the same breath
 * (base → translateY(-105%), overlay 105% → 0).
 *
 * SYNC CONTRACT: every moving piece transitions ONLY the `transform`
 * property — `transition-[transform]` + shared --dur-swap (0.85s) +
 * --ease-out-expo (cubic-bezier(0.19,1,0.22,1)) — so label and arrow
 * start and end together. Tailwind v4 pitfall avoided deliberately:
 * translate-* utilities set the CSS `translate` property, so all rest
 * and hover states here use arbitrary [transform:...] utilities instead;
 * the property that changes is exactly the one being transitioned.
 *
 * Reduced motion (§A7 "instant"): every hover transform is
 * motion-safe-gated — nothing moves, base label + centered arrow stay
 * visible and readable. Focus-visible mirrors hover for keyboard users.
 */

import type { MouseEvent } from "react";
import { scrollToSection } from "@/lib/gsap/SmoothScroll";

type CtaSize = "md" | "sm";

/* Per-size dimension classes. md strings are verbatim from the original
   single-size component — do not touch (ContactVisual must stay
   pixel-identical). */
const SIZES: Record<
  CtaSize,
  { root: string; window: string; label: string; chip: string; arrow: string }
> = {
  md: {
    /* max-b700:* additions scale the bar down on phones (the md clamp floors
       overflow a 360px viewport inside px-9 gutters); desktop output is
       untouched — the base classes are verbatim. */
    root: "h-[clamp(54px,6vw,76px)] gap-[clamp(18px,2.2vw,32px)] pl-[clamp(22px,2.6vw,38px)] pr-[clamp(12px,1.4vw,20px)] max-b700:h-[46px] max-b700:gap-[14px] max-b700:pl-[16px] max-b700:pr-[9px]",
    window: "h-[clamp(34px,3.8vw,50px)] max-b700:h-[27px]",
    label:
      "text-[clamp(26px,3vw,40px)] leading-[clamp(34px,3.8vw,50px)] max-b700:text-[20px] max-b700:leading-[27px]",
    chip: "size-[clamp(36px,4vw,50px)] max-b700:size-[28px]",
    arrow: "size-[clamp(18px,2.1vw,26px)] max-b700:size-[15px]",
  },
  sm: {
    root: "h-[34px] gap-[10px] pl-[12px] pr-[6px]",
    window: "h-[19px]",
    label: "text-[13px] leading-[19px]",
    chip: "size-[20px]",
    arrow: "size-[10px]",
  },
};

const LABEL_BASE =
  "col-start-1 row-start-1 block whitespace-nowrap font-bold text-bg " +
  "transition-[transform] duration-(--dur-swap) ease-(--ease-out-expo)";

/* Each arrow layer fills the chip — the LAYER is what translates, so the
   130% swap offsets resolve against the full chip size. */
const ARROW_LAYER =
  "absolute inset-0 flex items-center justify-center " +
  "transition-[transform] duration-(--dur-swap) ease-(--ease-out-expo)";

function ArrowGlyph({ className }: { className: string }) {
  return (
    <svg
      className={`${className} text-ink`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export default function CtaButton({
  label,
  href,
  scrollTarget,
  size = "md",
  className = "",
}: {
  label: string;
  href: string;
  /** When set, clicks smooth-scroll to this selector (Lenis-aware) instead of navigating. */
  scrollTarget?: string;
  /** "md" (default, ContactVisual scale) or "sm" (nav scale). */
  size?: CtaSize;
  className?: string;
}) {
  const s = SIZES[size];
  const onClick = scrollTarget
    ? (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        scrollToSection(scrollTarget);
      }
    : undefined;

  return (
    <a
      data-sayhi=""
      href={href}
      onClick={onClick}
      className={`group pointer-events-auto inline-flex items-center rounded-btn bg-ink ${s.root} ${className}`}
    >
      {/* Vertical label swap — clip window, base + overlay stacked */}
      <span className={`grid overflow-hidden ${s.window}`}>
        <span
          className={`${LABEL_BASE} ${s.label} motion-safe:group-hover:[transform:translateY(-105%)] motion-safe:group-focus-visible:[transform:translateY(-105%)]`}
        >
          {label}
        </span>
        <span
          aria-hidden="true"
          className={`${LABEL_BASE} ${s.label} [transform:translateY(105%)] motion-safe:group-hover:[transform:translateY(0px)] motion-safe:group-focus-visible:[transform:translateY(0px)]`}
        >
          {label}
        </span>
      </span>

      {/* Square chip — relative + overflow-hidden; two inset-0 arrow layers */}
      <span
        aria-hidden="true"
        className={`relative shrink-0 overflow-hidden rounded-chip bg-bg ${s.chip}`}
      >
        {/* A1 — visible at rest, exits top-right on hover */}
        <span
          className={`${ARROW_LAYER} motion-safe:group-hover:[transform:translate(130%,-130%)] motion-safe:group-focus-visible:[transform:translate(130%,-130%)]`}
        >
          <ArrowGlyph className={s.arrow} />
        </span>
        {/* A2 — parked off the bottom-left, arrives center on hover */}
        <span
          className={`${ARROW_LAYER} [transform:translate(-130%,130%)] motion-safe:group-hover:[transform:translate(0px,0px)] motion-safe:group-focus-visible:[transform:translate(0px,0px)]`}
        >
          <ArrowGlyph className={s.arrow} />
        </span>
      </span>
    </a>
  );
}
