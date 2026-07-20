/*
 * Site-level copy (§A6) — all strings verbatim from the reference design.
 */

export const EMAIL = "adnaandasoo@gmail.com";

/*
 * Preloader welcome line — reads "it's all (image) about the / first touch"
 * with the slide frame inline in the first row. Swap the strings to change
 * the phrase; the frame always sits between line1Before and line1After.
 */
export const preloader = {
  line1Before: "it's all",
  line1After: "about the",
  line2: "first touch",
};

/*
 * Hero — panel layout (user-directed redesign, 2026-07-19): raised panel
 * with intro text + showreel, giant name spanned across the bottom.
 */
export const hero = {
  /** Left-panel intro statements (short declarative + supporting line) */
  intro: [
    "I'm Adnaan — a designer and engineer.",
    "I help brands find their visual identity — and build the digital products that carry it everywhere.",
  ],
  showreelSrc: "/assets/slider-video-02.mp4",
  /** Giant bottom name — spanned edge-to-edge like the reference */
  giantName: "ADNAAN DASOO",
  scrollCue: "scroll down",
};

/** About blurb — preserve verbatim (§A6 #2); split by words for the fill. */
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
 * Contact visual (user-directed, 2026-07-19) — replaces the big CONTACT
 * statement: full-viewport monochrome desk photo with a stark white line.
 */
export const contactVisual = {
  eyebrow: "( contact )",
  heading: "LET'S TALK",
  /** Supporting line — carried over from the retired Statement section */
  sub: "Each project starts with a conversation.",
  imageSrc: "/assets/contact-desk.png",
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
    { label: "claude", base: "https://claude.ai/new?q=", aria: "ask claude about adnaan" },
    { label: "chatgpt", base: "https://chatgpt.com/?q=", aria: "ask chatgpt about adnaan" },
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

export const nav = {
  brand: "adnaan dasoo",
  links: [
    { label: "home", type: "scroll", target: "#hero" },
    { label: "about", type: "route", target: "/about" },
    { label: "work", type: "route", target: "/works" },
    { label: "contact", type: "scroll", target: "#footer" },
  ] as const,
  sayHi: "say hi",
};
