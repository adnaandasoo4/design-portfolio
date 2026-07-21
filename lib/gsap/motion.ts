/*
 * Shared motion tokens (§A2) — the GSAP-side mirror of the CSS custom
 * properties in globals.css. Keep this set small and shared.
 */

/** cubic-bezier → GSAP ease mapping (§A2 motion tokens table) */
export const EASE = {
  /** cubic-bezier(.22,1,.36,1) — intro reveals, row clip & track-lift, marquee clip */
  outQuart: "power3.out",
  /** cubic-bezier(.19,1,.22,1) — nav sweep, say-hi swap, back-to-top, copy-icon slide */
  outExpo: "expo.out",
  /** cubic-bezier(.83,0,.17,1) — preloader rect expansion */
  inOutQuint: "expo.inOut",
  /** cubic-bezier(.34,1.56,.64,1) — copy-success check pop */
  back: "back.out(1.6)",
  /** ease — color/opacity micro-fades */
  std: "power1.inOut",
  /** marquee auto-scroll */
  none: "none",
} as const;

/** Durations in seconds (§A2) */
export const DUR = {
  micro: 0.22, // word fill
  hover: 0.3, // footer color
  copy: 0.35,
  copy2: 0.45,
  clip: 0.55, // row reveal
  sweep: 0.72, // nav
  track: 0.7, // row lift
  swap: 0.85, // say-hi
  intro: 0.85, // reveals
  rect: 0.9, // preloader
  veil: 0.32, // route veil
  veilIn: 0.6, // route veil entrance fade
  marquee: 32, // loop
} as const;

/** Named scroll-linked constants (§A2) */
export const SCROLL = {
  /** minimal-name parallax: y = scrollY × −0.38, stops past 1.6 × vh */
  heroNameFactor: -0.38,
  heroNameCapVh: 1.6,
  /** divider band speeds (opposed) */
  bandSpeedTop: 0.12,
  bandSpeedBottom: -0.1,
  /** disciplines image parallax ±7% (image 118% tall, top:-9%) */
  disciplinesParallaxPct: 7,
  /** statement top-half scale 1 + 0.20·p; bottom-half 1 + 0.20·p^1.6 */
  statementScaleAmt: 0.2,
  statementBottomExp: 1.6,
  /** smoke-variant reel cursor follow (deferred) */
  reelLerp: 0.055,
} as const;

/** matchMedia conditions — author ALL motion inside gsap.matchMedia() (§A7) */
export const MQ = {
  /** full experience gate: smooth scroll + choreography */
  desktop: "(min-width: 701px)",
  /** native scroll, pins released, type down-steps */
  mobile: "(max-width: 700px)",
  /** opted-in fallback branch — instant/opacity-only */
  reduced: "(prefers-reduced-motion: reduce)",
  /** default experience — never degraded for non-opted-in users */
  motionOk: "(prefers-reduced-motion: no-preference)",
} as const;
