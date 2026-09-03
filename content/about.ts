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
 *
 * 2026-09-03, second pass: this file is now the SINGLE source for the
 * personal narrative. The home page's About section used to carry three
 * paragraphs of its own; the user cut it back to a teaser plus a "read
 * more", so the full piece lives here and the home section renders
 * `homeTeaser` — the same strings, not copies of them. Two hand-kept
 * versions of the same prose would have drifted the first time either was
 * edited.
 *
 * Third pass, same day: THE_OFFER joins the narrative as its closing
 * argument and the home teaser as its second paragraph. The piece read as
 * biography and stopped — it said how the two halves came to be held
 * together but never what holding them together is FOR.
 */

/* The two paragraphs the home About section shows. Declared above `about`
   so the page and the home section point at one string each, never a copy.
   THE EYE is the personal beat; THE OFFER is what the two halves add up to
   in practice, and it closes the page's narrative as well as the home
   section (user, 2026-09-03). */
const THE_EYE =
  "I have always been pulled toward how things look. Not decoration — proportion, weight, the reason one version of a thing feels settled and the next one doesn’t. Long before I had a word for it, I was moving things a few pixels at a time until they sat right.";

const THE_OFFER =
  "Holding both halves is the point. Design taste on its own draws things that cannot be built the way they were drawn; engineering on its own builds things that are correct and forgettable. Together they let me take a brand the whole way — visual direction, identity and the system that carries it, through to the site itself — with no handoff in the middle for the intent to leak out of. That is worth most to brands who have outgrown their digital presence: the ones whose product has moved on and whose website has not.";

export const about = {
  eyebrow: { latin: "( about )", ja: "概要" },
  headline: "Design and engineering, held to the same obsessive standard.",
  opening:
    "It all comes down to the first touch. On the pitch it sets up everything that follows; on screen it’s the first moment someone lands.",
  /* The narrative, in order: who, the eye, the football, the transfer, the
     work, the offer. The middle three came off the home page (user,
     2026-09-03) — see the header note — and slot between the two that were
     already here, which is the order the argument actually runs in.
     "Football taught me the rest of it" depends on the paragraph before it,
     so the sequence is load-bearing, not decorative. THE_OFFER goes last
     because it is the conclusion the five before it earn. */
  paragraphs: [
    "I’m Adnaan — a semi-pro footballer who spends the rest of his time designing and building for the web. The two aren’t as far apart as they sound: both reward instinct, timing, and an almost annoying refusal to settle.",
    THE_EYE,
    "Football taught me the rest of it. Everything in that game runs through the first touch. Not the finish, not the pass after it — the touch. Take it cleanly and the next moment opens up in front of you. Take it badly and you spend the rest of the play recovering from yourself. You cannot fake it and you cannot rush it; you earn it by taking it ten thousand times, alone, against a wall.",
    "Design is the same discipline in different clothes. The first touch is the first second on the page — the moment someone decides, before they have read a word, whether you are serious. It has to be clean. So I iterate, and iterate, and iterate again. Not because I am unsure, but because the version that lands is almost never the first one, and the distance between close and clean is the entire job.",
    "I work end-to-end — visual direction, interaction, and the front-end build — and I don’t hand something off until the details feel inevitable. Motion with purpose, interfaces that respond, the small stuff you feel more than notice.",
    THE_OFFER,
  ],
  /** Rendered TWICE, deliberately: each appears once here in sequence and
   *  once on the home page, which shows these two and nothing else. They are
   *  the beats that work standing alone — the eye, then what it is for —
   *  which is what a teaser has to do. */
  homeTeaser: [THE_EYE, THE_OFFER],
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
