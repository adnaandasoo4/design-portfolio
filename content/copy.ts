/*
 * Site-level copy (§A6) — all strings verbatim from the reference design.
 */

export const EMAIL = "adnaandasoo@gmail.com";

/* Preloader is purely visual (stills + off-black expand) — no copy. */

/*
 * Hero — centred showreel over a stacked statement block (user-directed,
 * 2026-09-02). Three text slots below the reel: a mono eyebrow, the giant
 * masthead headline (the page's single h1), and a right-aligned paragraph
 * that bottoms out with the headline's last line.
 *
 * !! PLACEHOLDER COPY (user request, 2026-09-02) !!
 * eyebrow / headline / paragraph are currently the REFERENCE SITE's own
 * words, lifted verbatim so the layout can be judged at the right measure
 * ("the exact same as the reference photo for now"). They describe another
 * agency's B2B positioning, not Adnaan's, and MUST be replaced before this
 * goes anywhere public. The previous draft — eyebrow "for brands that
 * sweat every detail", headline "design & engineering held to the same
 * standard", paragraph from aboutBlurb — is the fallback if nothing else
 * arrives.
 */
export const hero = {
  /** Mono eyebrow — one array item per display line */
  eyebrow: ["For B2B tech teams that have", "outgrown their website"],
  /** Masthead headline — one array item per display line */
  headline: ["BRANDING & WEBSITES", "THAT MOVE B2B TECH", "TEAMS FORWARD"],
  /** Right-hand paragraph, bottom-aligned to the headline */
  paragraph:
    "We partner with ambitious B2B teams, scale-ups and brands to unlock their true potential and growth through strategy, design and technology.",
  /** Showreel — the branding reel, plus the captions on its bottom edge.
   *  brand-reel.mp4 is 1920×1080 (exactly the card's 16:9) and 6.5s, so it
   *  loops without a letterbox. showreel-2.mp4 in the same folder is a
   *  byte-identical duplicate.
   *
   *  No poster: assets/reel-poster.png is itself a placeholder graphic (it
   *  literally reads "brand showreel — poster (16:10)", and at 16:10 it is
   *  the wrong shape for this card anyway), so it would flash placeholder
   *  artwork before the reel starts. The card's vermilion fill is the
   *  loading state instead. */
  reel: {
    src: "/assets/brand-reel.mp4",
    /** Accessible name for the video */
    alt: "Branding showreel",
    /** Caption under the card — label left, action right. Set in the mono
     *  face at --text-meta so it reads as one tier with the hero's eyebrow
     *  and paragraph. The parentheses match the footer's eyebrows. */
    label: "( projects showreel )",
    note: "watch",
  },
};

/*
 * About section, home page (§A6 #2). Named aboutSection, not `about`:
 * content/about.ts already exports an `about` for the /about PAGE, and two
 * different things under one name in one folder is an import waiting to go
 * to the wrong file.
 *
 * No eyebrow and no note: the section index and the location line were both
 * removed (user, 2026-09-03), leaving the illustration alone in the left
 * column.
 *
 * `statement` is the §A6 blurb's opening sentence, kept verbatim, and takes
 * the section's h2. The paragraphs beneath it are new (user, 2026-09-03) —
 * a personal piece rather than a service description, built on the parallel
 * the user gave: in football everything runs through the first touch, and
 * the same is true of a page.
 */
export const aboutSection = {
  /** Left column of the section. The file is 736x1308 (9:16); it is
   *  displayed at 4:5 and top-anchored, so the crop comes off the BOTTOM —
   *  the desk, window and moon survive, the bed and floor do not. */
  image: "/assets/about-desk-night.png",
  imageAlt:
    "Illustration of a figure working at a desk late at night, lit by a monitor and a full moon through the window.",
  statement:
    "The goal has always been to close the gap between design and engineering.",
  paragraphs: [
    "I have always been pulled toward how things look. Not decoration — proportion, weight, the reason one version of a thing feels settled and the next one doesn't. Long before I had a word for it, I was moving things a few pixels at a time until they sat right.",
    "Football taught me the rest of it. Everything in that game runs through the first touch. Not the finish, not the pass after it — the touch. Take it cleanly and the next moment opens up in front of you. Take it badly and you spend the rest of the play recovering from yourself. You cannot fake it and you cannot rush it; you earn it by taking it ten thousand times, alone, against a wall.",
    "Design is the same discipline in different clothes. The first touch is the first second on the page — the moment someone decides, before they have read a word, whether you are serious. It has to be clean. So I iterate, and iterate, and iterate again. Not because I am unsure, but because the version that lands is almost never the first one, and the distance between close and clean is the entire job.",
  ],
};

/** §A6 #2 blurb — retained verbatim as the handoff record. The section now
 *  runs the longer personal piece above; only its first sentence is
 *  rendered, as aboutSection.statement. */
export const aboutBlurb =
  "The goal has always been to close the gap between design and engineering. I build visual identities and digital brands for businesses that want every touchpoint to feel considered — then iterate relentlessly, refining until the details disappear into the whole.";

export const divider = {
  /** [text, color, speed, preOffset marginLeft] */
  bands: [
    { text: "Introduction", color: "#ffffff", speed: 0.12, offset: "-6vw" },
    { text: "Works", color: "#37373b", speed: -0.1, offset: "-115vw" },
  ],
};

export const workList = {
  headerLeft: "Industry",
  headerRight: "Timeline",
  ctaText: "See All",
  ctaHref: "/works",
};

/*
 * Contact visual (user-directed, 2026-07-19; copy revised 2026-07-20) —
 * full-viewport monochrome desk photo with a stacked white statement and
 * a large say-hi CTA. One array item per display line; no arrow glyphs in
 * the headline. No eyebrow — the "( contact )" label was removed 2026-07-20.
 */
export const contactVisual = {
  lines: ["helping brands", "establish their", "visual presence."],
  /** Large CTA pill below the statement — scrolls to #footer. Deliberately
   *  the same words as the footer's closing CTA (user, 2026-09-02); no
   *  arrow in the label here, since the button carries its own arrow chip. */
  cta: "Let's Collaborate",
  imageSrc: "/assets/contact-desk-3.png",
};

/** Prefilled bio prompt for the footer ask-AI links (verbatim). */
export const askAiPrompt =
  "Who is Adnaan Dasoo? Tell me about this Baltimore-based designer and engineer — his visual identity work, digital brand projects, and how he blends design with front-end engineering.";

/*
 * Footer — 100svh redesign (user-directed, 2026-07-19; reference = MONOLOG
 * footer screenshots). Top: "Navigation" big-link list + details/socials/
 * ask-AI columns + meta row (clock · back-to-top/booking · copyright).
 * Bottom: WebGL gradient band with brand + tagline overlay.
 */
export const footer = {
  navEyebrow: "( navigation )",
  /* Footer links deliberately DO NOT live here — Footer.tsx renders
     `nav.links` below, so the footer and the top menu can never disagree
     about what the site's navigation is (user, 2026-09-02). */
  detailsEyebrow: "( my details )",
  basedIn: "Based in Baltimore, MD.\nWorking worldwide.",
  /** Large closing CTA at the foot of the footer's right column, opening a
   *  mail draft — a different action from the copy-to-clipboard address in
   *  ( my details ), not a second button for the same one. The arrow is
   *  drawn, not typed: it rides the same per-letter swap as the words. */
  collaborate: "Let's Collaborate",
  socialsEyebrow: "( my socials )",
  socials: [
    // TODO: real URLs (Open Q5) — placeholder "#" in the reference
    { label: "Github", href: "#" },
    { label: "Linkedin", href: "#" },
    { label: "Instagram", href: "#" },
  ],
  askAiEyebrow: "( ask ai about me )",
  askAi: [
    { label: "openai", base: "https://chatgpt.com/?q=", aria: "ask chatgpt about adnaan" },
    { label: "claude", base: "https://claude.ai/new?q=", aria: "ask claude about adnaan" },
    { label: "gemini", base: "https://www.google.com/search?udm=50&q=", aria: "ask gemini about adnaan" },
    { label: "grok", base: "https://grok.com/?q=", aria: "ask grok about adnaan" },
  ],
  /** Live clock — city label + IANA zone it ticks in */
  clockCity: "Baltimore",
  clockZone: "America/New_York",
  backToTop: "Back to top",
  /** Meta-row bilingual sign-off (restored from the pre-redesign footer) */
  metaLatin: "designer × engineer",
  metaJa: "デザイナー × エンジニア",
};

/*
 * Top chrome (user-redirected, 2026-09-02) — two elements, one per side:
 *   ADNAAN DASOO  ……………………………………………………  [Menu +]
 * The bilingual vermilion banner and the split wordmark were both dropped:
 * the full name now sits whole on the left, and the Menu owns the right.
 */
export const nav = {
  /** Full wordmark, left side. The nav renders it uppercase. */
  wordmark: "Adnaan Dasoo",
  menuLabel: "Menu",
  /** Menu panel links, shared with the footer. */
  links: [
    { label: "Home", type: "scroll", target: "#hero" },
    { label: "About", type: "route", target: "/about" },
    { label: "Work", type: "route", target: "/works" },
    { label: "Branding", type: "route", target: "/branding" },
    { label: "Disciplines", type: "scroll", target: "#disciplines" },
    { label: "Contact", type: "scroll", target: "#footer" },
  ] as const,
  /** Theme toggle, bottom-right */
  themeToggleLabel: "Switch between light and dark mode",
};
