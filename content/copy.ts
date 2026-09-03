/*
 * Site-level copy (§A6) — all strings verbatim from the reference design.
 */

export const EMAIL = "adnaandasoo@gmail.com";

/* Preloader is purely visual (stills + off-black expand) — no copy. */

/*
 * Hero — centered showreel over a stacked statement block (user-directed,
 * 2026-09-02). Three text slots below the reel: a mono eyebrow, the giant
 * masthead headline (the page's single h1), and a right-aligned paragraph
 * that bottoms out with the headline's last line.
 *
 * All three are drawn from copy the site already owned: the eyebrow from
 * the old hero statement, the headline from the site's own OG description
 * ("design and engineering held to the same standard"), the paragraph from
 * the About blurb.
 */
export const hero = {
  /** Mono eyebrow — one array item per display line */
  eyebrow: ["FOR BRANDS THAT SWEAT", "EVERY DETAIL"],
  /** Masthead headline — one array item per display line */
  headline: ["DESIGN & ENGINEERING", "HELD TO THE SAME", "STANDARD"],
  /** Right-hand paragraph, bottom-aligned to the headline */
  paragraph:
    "I build visual identities and digital brands for businesses that want every touchpoint to feel considered — then iterate relentlessly, refining until the details disappear into the whole.",
  /** Showreel captions, sitting on the reel's bottom edge */
  reel: {
    label: "Projects Showreel",
    action: "Watch",
    /** Screen-reader description of the placeholder card */
    alt: "Projects showreel — coming soon",
  },
};

/** About blurb — preserve verbatim (§A6 #2); rendered static at full ink. */
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
  /** Large CTA pill below the statement — scrolls to #footer */
  cta: "let's collaborate",
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
  /** Big footer nav links (reference-cased) */
  links: [
    { label: "Home", type: "scroll", target: "#hero" },
    { label: "About", type: "route", target: "/about" },
    { label: "Work", type: "route", target: "/works" },
    { label: "Disciplines", type: "scroll", target: "#disciplines" },
    { label: "Contact", type: "scroll", target: "#footer" },
  ] as const,
  detailsEyebrow: "( my details )",
  basedIn: "Based in Baltimore, MD.\nWorking worldwide.",
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
  /** Cursor pill shown while hovering the gradient band */
  holdLabel: "hold",
  /** Live clock — city label + IANA zone it ticks in */
  clockCity: "Baltimore",
  clockZone: "America/New_York",
  backToTop: "Back to top",
  /** Meta-row bilingual sign-off (restored from the pre-redesign footer) */
  metaLatin: "designer × engineer",
  metaJa: "デザイナー × エンジニア",
};

/*
 * Top chrome (user-directed, 2026-09-02) — four elements across one row:
 *   ADNAAN · [designer × engineer banner] … [Menu +] · DASOO
 * The name is split across the header as a single wordmark; both halves
 * lead home. Links live behind the Menu, which opens downward on hover.
 */
export const nav = {
  /** The wordmark, split left/right across the header */
  wordmarkFirst: "Adnaan",
  wordmarkLast: "Dasoo",
  /** Vermilion banner beside the first name */
  bannerLatin: "designer × engineer",
  bannerJa: "デザイナー × エンジニア",
  menuLabel: "Menu",
  /** Menu panel links. "Branding" has no destination yet (Open Q, 2026-09-02)
   *  — type "pending" renders the row and its hover, with no navigation. */
  links: [
    { label: "Home", type: "scroll", target: "#hero" },
    { label: "About", type: "route", target: "/about" },
    { label: "Work", type: "route", target: "/works" },
    { label: "Branding", type: "pending", target: "#" },
    { label: "Disciplines", type: "scroll", target: "#disciplines" },
    { label: "Contact", type: "scroll", target: "#footer" },
  ] as const,
  /** Theme toggle, bottom-right */
  themeToggleLabel: "Switch between light and dark mode",
};
