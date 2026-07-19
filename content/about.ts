/*
 * About page content (§A9 brief). Narrative copy is verbatim from the
 * reference scaffold (About Adnaan Dasoo V3.dc.html) — the scaffold's
 * LAYOUT is loose reference only, but its copy is real.
 */

export const about = {
  marquee: { latin: "ABOUT ME", ja: "アバウトミー" },
  opening:
    "It all comes down to the first touch. On the pitch it sets up everything that follows; on screen it’s the first moment someone lands.",
  eyebrow: { latin: "( about )", ja: "概要" },
  headline: "Design and engineering, held to the same obsessive standard.",
  paragraphs: [
    "I’m Adnaan — a semi-pro footballer who spends the rest of his time designing and building for the web. The two aren’t as far apart as they sound: both reward instinct, timing, and an almost annoying refusal to settle.",
    "I work end-to-end — visual direction, interaction, and the front-end build — and I don’t hand something off until the details feel inevitable. Motion with purpose, interfaces that respond, the small stuff you feel more than notice.",
    "The first touch is the whole thing. Get it right and everything after has somewhere to go.",
  ],
  portrait: {
    src: "/assets/about-portrait.png",
    alt: "Adnaan Dasoo",
    /** aspect ratio from the scaffold figure */
    ratio: "1122 / 1402",
    caption: { latin: "Fig. 01 — off the clock", ja: "オフショット" },
  },
  meta: [
    { numeral: "01", latin: "Semi-pro footballer", ja: "サッカー選手" },
    { numeral: "02", latin: "Design × Engineering", ja: "設計と実装" },
    { numeral: "03", latin: "Relentless iterator", ja: "反復の鬼" },
  ],
  /**
   * Experience timeline (§A9 suggested section 3) — REAL DATA TBD (Open Q5).
   * Labeled placeholders at the intended shape: year · role · org.
   */
  timeline: [
    { year: "20XX", role: "role — tbd", org: "organization — tbd" },
    { year: "20XX", role: "role — tbd", org: "organization — tbd" },
    { year: "20XX", role: "role — tbd", org: "organization — tbd" },
  ],
  closing:
    "The first touch is the whole thing. Get it right and everything after has somewhere to go.",
};
