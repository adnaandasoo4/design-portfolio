/*
 * Site-level copy (§A6) — all strings verbatim from the reference design.
 */

export const EMAIL = "adnaandasoo@gmail.com";

/* Preloader is purely visual (stills + off-black expand) — no copy. */

/*
 * Hero — centred showreel over a stacked statement block (user-directed,
 * 2026-09-02). Three text slots below the reel: an eyebrow, the giant
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
  /** Eyebrow — one array item per display line on desktop. On the phone the
   *  lines run together and wrap to the measure instead (user, 2026-09-03):
   *  breaks authored for a desktop column just wrap a second time there. */
  eyebrow: ["For B2B tech teams that have", "outgrown their website"],
  /* Masthead headline — one array item per DESKTOP line, exactly as it has
     always been, so the desktop DOM is three block spans and nothing else.
     The inner array splits a line at the point the PHONE breaks it: those
     splits become <br> elements that only display below 700px, and the
     spans go inline there so the halves either side of a split can join
     across lines.

       desktop (3)   BRANDING & WEBSITES / THAT MOVE B2B TECH / TEAMS FORWARD
       phone   (4)   BRANDING & / WEBSITES THAT / MOVE B2B TECH / TEAMS FORWARD

     Four on the phone at the user's direction (2026-09-03), authored rather
     than left to wrap: at 9.4vw each desktop line broke again, which is five
     or six ragged rows.

     An earlier attempt stored the whole headline as one flat run of
     segments and <br>s. It produced the same four lines but replaced the
     three block spans with inline text, which changed how the h1 sizes as a
     flex item next to the paragraph — and broke the desktop line breaks it
     was not supposed to touch. Hence this shape: the phone's breaks live
     INSIDE a desktop line, never across the structure of one. */
  headline: [
    ["BRANDING &", "WEBSITES"],
    ["THAT", "MOVE B2B TECH"],
    ["TEAMS FORWARD"],
  ],
  /** Right-hand paragraph, bottom-aligned to the headline */
  paragraph:
    "We partner with ambitious B2B teams, scale-ups and brands to unlock their true potential and growth through strategy, design and technology.",
  /** Showreel — the branding reel, plus the captions on its bottom edge.
   *  1920×1080 (exactly the card's 16:9) and 6.5s, so it loops without a
   *  letterbox. (showreel-2.mp4 was a byte-identical copy and is deleted,
   *  2026-09-03.)
   *
   *  FASTSTART, and the filename says so on purpose. The original had its
   *  `moov` atom — the index a decoder needs before it can draw anything —
   *  at byte 2,087,838 of a 2,091,411-byte file, i.e. last. A browser
   *  therefore had to fetch essentially the WHOLE 2MB before it could show
   *  one frame, and on the home page that request queues behind the
   *  preloader's six stills, the fonts and the JS. The card sat empty long
   *  after the hero had finished animating in. Remuxed so moov leads: same
   *  bytes, reordered, decodable within a few KB.
   *
   *  If this is ever re-exported, export it faststart (ffmpeg -movflags
   *  +faststart) or the card goes blank again.
   *
   *  No poster, and no poster FILE: assets/reel-poster.png was itself a
   *  placeholder graphic — it literally read "brand showreel — poster
   *  (16:10)", and at 16:10 it was the wrong shape for this card anyway — so
   *  it would have flashed placeholder artwork before the reel starts. It is
   *  deleted too. The card's own fill is the loading state. */
  reel: {
    src: "/assets/brand-reel-faststart.mp4",
    /** Accessible name for the video */
    alt: "Branding showreel",
    /** Caption under the card — label left, action right. Set at
     *  --text-meta so it reads as one tier with the hero's eyebrow and
     *  paragraph. Title case and unbracketed (user, 2026-09-03); it no
     *  longer borrows the footer eyebrows' parenthesised lowercase. */
    label: "Projects Showreel",
    note: "Watch",
  },
};

/*
 * About section, home page (§A6 #2). Named aboutSection, not `about`:
 * content/about.ts already exports an `about` for the /about PAGE, and two
 * different things under one name in one folder is an import waiting to go
 * to the wrong file.
 *
 * REBUILT as a scroll set piece (user, 2026-09-04). The section used to be a
 * teaser — statement, two borrowed paragraphs, a "read more" — and all of
 * that moved to /about, which now runs the personal piece in full. What is
 * left here is one statement and one picture, and the section earns its
 * place on the home page through MOTION rather than through more copy: the
 * words settle out of a compressed state and the illustration falls the
 * height of the column, both scrubbed to the scroll.
 *
 * !! PLACEHOLDER COPY (user request, 2026-09-04) !!
 * `statement` is the REFERENCE SITE's own paragraph, lifted verbatim so the
 * setting, the measure and the motion can be judged against the thing they
 * are being matched to. It is another designer's positioning, not Adnaan's,
 * and it MUST be replaced before this goes anywhere public — the same
 * standing condition the hero copy above is under. The user has said the
 * personal rewrite comes next.
 *
 * Whatever replaces it has to stay about this long. Both moves depend on it:
 * the gaps need lines to open between, and the pinned picture needs the
 * paragraph's height to hold against. A six-line statement gave the pin
 * roughly 150px of travel, which reads as nothing at all.
 */
export const aboutSection = {
  /** Rail index, over the illustration. */
  eyebrow: "Myself",
  /** Right column. Landscape (1199x674), shown in a tall-ish frame with
   *  object-cover, so the crop comes off the sides — the desk, the screens
   *  and the window stay centred. The night-desk illustration stays on
   *  /about; the two pages no longer share a picture either (2026-09-04). */
  image: "/assets/about-desk-coding.png",
  imageAlt:
    "Illustration of a figure at a two-screen desk setup in headphones, coding, with a bright sky through the window beside them.",
  statement:
    "Passionate about merging design and engineering, I craft smooth, interactive experiences with purpose. With a focus on motion, performance, and detail, I help bring digital products to life for forward-thinking brands around the world.",
};

/** §A6 #2 blurb — retained verbatim as the handoff record. Only its first
 *  sentence is rendered, as aboutSection.statement; the personal piece that
 *  replaced the rest of it lives in content/about.ts. */
export const aboutBlurb =
  "The goal has always been to close the gap between design and engineering. I build visual identities and digital brands for businesses that want every touchpoint to feel considered — then iterate relentlessly, refining until the details disappear into the whole.";

export const divider = {
  /* `tone` names a SEMANTIC token, not a colour: the bands used to carry raw
     hexes (#ffffff / #37373b), which pinned "Introduction" to white and left
     it invisible on the light theme's near-white page. Divider maps the tone
     to a text-* utility so both bands invert with everything else. */
  /** [text, tone, speed, preOffset marginLeft] */
  bands: [
    { text: "Introduction", tone: "ink", speed: 0.12, offset: "-6vw" },
    { text: "Works", tone: "band-dark", speed: -0.1, offset: "-115vw" },
  ],
} as const;

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
