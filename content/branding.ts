/*
 * Branding service page (user-directed, 2026-09-02; reference =
 * ethansuero.com/services/branding). The STRUCTURE follows that reference —
 * a masthead with an intro, then a four-cell grid of what the work covers —
 * but every word here is written for Adnaan's own practice. Nothing is
 * lifted from the reference, which sells B2B consultancy, not identity
 * design by one person who also builds the front end.
 *
 * Voice matches content/copy.ts: first person, specific, no agency filler.
 */

export const branding = {
  eyebrow: "( branding )",
  /** Page masthead — rendered uppercase in the display face */
  title: "Branding",
  intro:
    "A brand is the story your market tells when you're not in the room. I build identity systems that make that story specific — and that survive contact with a real product, because the same person designs them and builds them.",
  /** Rail note under the hairline */
  meta: "Identity systems for brands\nthat sweat the details.",

  servicesEyebrow: "( what it covers )",
  services: [
    {
      title: "Brand Strategy",
      body: "Before anything gets drawn, we settle who you're for, what you stand for, and why that matters in a category getting louder every year. Everything downstream — the site, the deck, a new hire's first week — then points at one decision instead of arguing with it.",
    },
    {
      title: "Visual Identity",
      body: "Logo, colour, type, motion, and the rules that hold them together. Built to read as credible in a room and distinct in a feed, and specified tightly enough that it still looks like you when somebody else applies it.",
    },
    {
      title: "Messaging",
      body: "The language your product actually earns. I translate what it does into words your buyers already use, in a framework that flexes across a site, a deck and a post without going vague in the process.",
    },
    {
      title: "Digital Systems",
      body: "Most identities break the moment they meet a real website. I hand over tokens, components and motion rules a front end can implement literally — because I build the front end too, and I know what a PDF leaves out.",
    },
  ],

  bandImage: "/assets/disc-brand-strategy-2.png",
  bandCaption: "( identity work )",

  processEyebrow: "( how it runs )",
  process: [
    {
      numeral: "01",
      title: "Audit",
      body: "Everything you have already shipped, read the way a stranger reads it. Competitors, category, and the distance between what you mean and what actually lands.",
    },
    {
      numeral: "02",
      title: "Direction",
      body: "Two or three routes, argued rather than decorated. You choose a position, not a picture — and you can say why in one sentence.",
    },
    {
      numeral: "03",
      title: "System",
      body: "The chosen route built out: type scale, palette, motion, and the rules that keep it coherent when it is under pressure from real content.",
    },
    {
      numeral: "04",
      title: "Handoff",
      body: "Files, tokens and documentation — and, if you want it, the build itself, so nothing is lost in translation between the design and the thing people use.",
    },
  ],

  galleryEyebrow: "( in practice )",
  gallery: [
    {
      image: "/assets/disc-digital-design-2.png",
      caption: "Identity applied across a digital product surface.",
    },
    {
      image: "/assets/disc-development-3.png",
      caption: "The same system, specified for the people building it.",
    },
  ],
};
