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

export const statement = {
  word: "CONTACT",
  topCrop: "13.5vw",
  bottomCrop: "8.5vw",
  barRows: [
    ["EACH", "PROJECT", "STARTS", "WITH", "A", "CONVERSATION."],
    ["DESIGN", "AND", "ENGINEERING,", "HELD", "TO", "THE", "SAME", "STANDARD."],
  ],
};

/** Prefilled bio prompt for the footer ask-AI links (verbatim). */
export const askAiPrompt =
  "Who is Adnaan Dasoo? Tell me about this Baltimore-based designer and engineer — his visual identity work, digital brand projects, and how he blends design with front-end engineering.";

export const footer = {
  metaLatin: "designer  ×  engineer",
  metaJa: "デザイナー × エンジニア",
  est: "est. 2026 · baltimore, md",
  socialsEyebrow: "(my socials)",
  socials: [
    // TODO: real URLs (Open Q5) — placeholder "#" in the reference
    { label: "github", href: "#" },
    { label: "linkedin", href: "#" },
    { label: "instagram", href: "#" },
  ],
  askAiEyebrow: "(ask ai about me)",
  askAi: [
    { label: "claude", base: "https://claude.ai/new?q=", aria: "ask claude about adnaan" },
    { label: "chatgpt", base: "https://chatgpt.com/?q=", aria: "ask chatgpt about adnaan" },
    { label: "gemini", base: "https://www.google.com/search?udm=50&q=", aria: "ask gemini about adnaan" },
    { label: "grok", base: "https://grok.com/?q=", aria: "ask grok about adnaan" },
  ],
  jaParagraph:
    "デザインとエンジニアリングを、同じ基準で。最初のアイデアから完成まで、一緒に作りましょう。",
  backToTop: "back to top",
  reelPoster: "/assets/reel-poster.png",
  reelSrc: "/assets/brand-reel.mp4" as string | null,
};

export const nav = {
  brand: "adnaan dasoo",
  links: [
    { label: "home", type: "scroll", target: "#hero" },
    { label: "about", type: "route", target: "/about" },
    { label: "work", type: "route", target: "/works" },
    { label: "contact", type: "mailto", target: `mailto:${EMAIL}` },
  ] as const,
  sayHi: "say hi",
};
