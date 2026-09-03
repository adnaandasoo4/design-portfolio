/*
 * About page content (§A9 brief). Narrative copy is verbatim from the
 * reference scaffold (About Adnaan Dasoo V3.dc.html) — the scaffold's
 * LAYOUT is loose reference only, but its copy is real.
 *
 * Restructured 2026-09-03 for the redesigned page. Two notes on what moved:
 *
 * - the scaffold stored its third paragraph and its closing line as the
 *   same sentence, twice. It is stored once here, as `closing`, and the
 *   page renders it once — as the closing. Rendering both would have
 *   repeated a line verbatim two screens apart.
 * - `marquee` belonged to a band the redesign does not have. Kept, unused,
 *   rather than deleted: it is handoff copy, and cheaper to keep than to
 *   rewrite if a marquee ever returns.
 */

export const about = {
  eyebrow: { latin: "( about )", ja: "概要" },
  headline: "Design and engineering, held to the same obsessive standard.",
  opening:
    "It all comes down to the first touch. On the pitch it sets up everything that follows; on screen it’s the first moment someone lands.",
  paragraphs: [
    "I’m Adnaan — a semi-pro footballer who spends the rest of his time designing and building for the web. The two aren’t as far apart as they sound: both reward instinct, timing, and an almost annoying refusal to settle.",
    "I work end-to-end — visual direction, interaction, and the front-end build — and I don’t hand something off until the details feel inevitable. Motion with purpose, interfaces that respond, the small stuff you feel more than notice.",
  ],
  /** Shared with the home About section — the only real image in the project */
  image: {
    src: "/assets/about-desk-night.png",
    alt: "Illustration of a figure working at a desk late at night, lit by a monitor and a full moon through the window.",
    caption: { latin: "Fig. 01 — off the clock", ja: "オフショット" },
  },
  metaEyebrow: { latin: "( in three )", ja: "三つ" },
  meta: [
    { numeral: "01", latin: "Semi-pro footballer", ja: "サッカー選手" },
    { numeral: "02", latin: "Design × Engineering", ja: "設計と実装" },
    { numeral: "03", latin: "Relentless iterator", ja: "反復の鬼" },
  ],
  closing:
    "The first touch is the whole thing. Get it right and everything after has somewhere to go.",

  /* NOT RENDERED — real data still outstanding (Open Q5). Three rows of
     "20XX / role — tbd" would read as a broken section, so the timeline is
     held here until the values are real; the page has a slot ready for it. */
  timeline: [
    { year: "20XX", role: "role — tbd", org: "organization — tbd" },
    { year: "20XX", role: "role — tbd", org: "organization — tbd" },
    { year: "20XX", role: "role — tbd", org: "organization — tbd" },
  ],
  /* NOT RENDERED — see the header note. */
  marquee: { latin: "ABOUT ME", ja: "アバウトミー" },
};
