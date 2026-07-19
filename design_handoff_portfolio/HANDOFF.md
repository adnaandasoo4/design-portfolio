# Adnaan Dasoo — Portfolio · Engineering Handoff (§A1–§A10)

> Exact, measurable values throughout. Home page = fully designed (hifi). About/Works = design briefs only (§A9).
> Target stack: Next.js (App Router) + TS + TailwindCSS + GSAP (ScrollTrigger / ScrollSmoother / SplitText via `@gsap/react`). WebGL/3D deferred.

---

## §A1 — Project Brief & Design Principles

A personal portfolio for **Adnaan Dasoo**, a Baltimore-based **designer × engineer**. Its job is to prove craft through the experience itself: a dark, near-black canvas; oversized restrained typography; and scroll-driven motion where every transition is deliberate. The site reads as a single continuous surface — sections butt edge-to-edge with hairline rules, not cards — and the perceived quality of the motion *is* the portfolio. It is content-light and confidence-heavy: a masthead, a mission blurb, a work index, three disciplines, a closing statement, and a footer. Nothing decorative earns its place unless it sharpens that impression.

**Design principles the build must preserve:**
1. **Restraint over decoration.** One near-black background (`#111214`), one white ink, a single lilac accent. No gradients, no shadows, no rounded "card + accent-border" tropes. Negative space is the primary material.
2. **Typographic focus.** Manrope for everything structural; HK Grotesk Wide only for the two hero display moments. Type is oversized and set tight; hierarchy comes from scale and weight, never color noise.
3. **Motion as craft.** Every animation is scrubbed to scroll or eased on a named curve — nothing snaps. Reveals are directional and quiet; the "wow" is precision (perfect seams, no jank), not spectacle.
4. **Rhythm & continuity.** Full-bleed sections with 36px gutters and hairline dividers create one uninterrupted vertical read. Japanese sub-labels and mono micro-labels recur as a quiet system motif.
5. **Considered in every state.** Hover, focus-visible, copy-confirmation, reduced-motion — each is designed, not defaulted.

---

## §A2 — Design Tokens (Tailwind `theme.extend`-ready)

### Color palette (semantic)
Dark is the default theme. A light theme exists as a **full-canvas CSS `invert(1)`** toggle (media elements counter-inverted) — see §A5 · Theme Toggle.

| Token | Value | Usage |
|---|---|---|
| `bg` / `ink-inverse` | `#111214` | Page background everywhere (never pure `#000`). Also ink on light surfaces. |
| `bg-raise` | `#15151a` | Disciplines outer card (base) |
| `bg-raise-2` | `#1d1d21` | Disciplines card (applied), nav-hover block (applied) |
| `bg-panel` | `#111114` → rendered `#111214` | Disciplines inner panel |
| `bg-slot` | `#1c1c20` | Image-slot placeholder (disciplines media) |
| `bg-slot-2` | `#1a1a1e` | Video placeholder (footer/reel) |
| `bg-preloader` | `#f7f6f4` | Preloader stage background |
| `bg-preloader-slide` | `#26262b` | Preloader image-slide backing |
| `hero-dim` | `#050506` | Hero dim overlay (smoke variant only) |
| `ink` | `#ffffff` | Primary white ink (display, key headings) |
| `ink-soft` | `#ecebe8` | Optional softened white (via `pureWhite=false`) |
| `ink-1` | `#d5d3ce` | Work-row side labels |
| `ink-2` | `#b8b8be` | Discipline tag text |
| `muted-1` | `#9a9aa0` | Discipline descriptions |
| `muted-2` | `#8a8a8e` | Eyebrows, numerals, meta, apostrophes |
| `muted-3` | `#77777d` | Work-list header labels, footer AI icons (rest), footer JP |
| `muted-ja` | `#3d3d42` | Japanese labels inside white marquee |
| `band-dark` | `#37373b` | Second divider band ("Works") |
| `accent` | `#c7c2ce` | Lilac — copy-success, check icon, grid/accent lines |
| `surface-light` | `#f2f1ef` | Light-theme surface / marquee fill / About·Works base |
| `link-light` | `#111214` | Link ink on light pages |
| `link-light-hover` | `#6b6b70` | Link hover on light pages |

**Alpha inks (white-on-dark):** `text-50 = rgba(255,255,255,.5)` · `text-38 = rgba(255,255,255,.38)` · `text-24 = rgba(255,255,255,.24)` (About-blurb unfilled word).
**Hairlines:** `line-055 = rgba(255,255,255,.055)` (disciplines row rule) · `line-09 = rgba(255,255,255,.09)` (work rows, footer top) · `line-13 = rgba(255,255,255,.13)` (tag border) · `line-14 = rgba(255,255,255,.14)` (hero rule).
**Fill:** `fill-035 = rgba(255,255,255,.035)` (tag background).
**Selection (dark pages):** background `#ffffff`, color `#111214`.

### Spacing scale (px)
Base gutter is **36px**. Recommended Tailwind scale (rem @16px root): `4 / 7 / 9 / 12 / 14 / 16 / 18 / 20 / 22 / 26 / 30 / 32 / 34 / 36 / 40 / 44 / 48 / 58 / 62 / 80 / 96 / 108`. Section-level vertical padding uses **`clamp()`**, not fixed steps (see §A6). Side gutter = `36px` (16px on Disciplines section, 12px < 700px).

### Border radius
`3px` (nav buttons / say-hi pill) · `2px` (say-hi arrow chip) · `6px` (discipline tags) · `10px` (discipline media) · `14px` (disciplines inner panel) · `18px` (disciplines outer card) · `999px` (marquee pill images).

### Border widths
`1px` for every hairline and the tag border. No other border weights.

### Shadows / elevation
**None.** The design deliberately uses zero drop-shadows. Depth comes from value (near-black layering: `#111214` → `#15151a`/`#1d1d21`) and from motion parallax. Do not introduce shadows.

### Z-index layers
| Layer | z-index |
|---|---|
| `z-livebg` (fixed background) | `0` |
| `z-about` (pinned about track) | `1` |
| `z-flow` (in-flow content) | `2` |
| `z-hero-inner` (hero elements) | `2` |
| `z-section` (standard sections) | `4` |
| `z-hero` (hero section) | `4` |
| `z-hero-dim` (hero dim overlay) | `6` |
| `z-nav` (fixed top nav) | `120` |
| `z-page-veil` (route transition) | `150` |
| `z-preloader` | `200` |

### Motion tokens (canonical — reuse everywhere)
Bespoke reference uses cubic-beziers + a rAF loop; map to GSAP eases below. **Keep this set small and shared.**

| Name | cubic-bezier | GSAP ease | Where used |
|---|---|---|---|
| `ease-out-quart` | `cubic-bezier(.22,1,.36,1)` | `power3.out` (≈`expo.out`) | Intro reveals, work-row clip & track-lift, marquee clip |
| `ease-out-expo` | `cubic-bezier(.19,1,.22,1)` | `expo.out` | Nav highlight sweep, say-hi swap, back-to-top, copy-icon slide |
| `ease-in-out-quint` | `cubic-bezier(.83,0,.17,1)` | `expo.inOut` | Preloader rect expansion |
| `ease-back` | `cubic-bezier(.34,1.56,.64,1)` | `back.out(1.6)` | Copy-success check pop |
| `ease-std` | `ease` | `power1.inOut` | Color/opacity micro-fades (theme filter, word fill, hovers) |
| `linear` | `linear` | `none` | Marquee auto-scroll |

**Durations (s):** `micro .22` (word fill) · `hover .30` (footer color) · `copy .35 / .45` · `clip .55` (row reveal) · `sweep .72` (nav) · `track .70` (row lift) · `swap .85` (say-hi) · `intro .85` (reveals) · `rect .90` (preloader) · `theme .65` (light toggle) · `veil .32` (route veil, +`.34` navigation delay) · `marquee 32s` (loop).
**Stagger:** intro reveals fire together on load (no stagger); recommend `.06–.08` stagger when re-authored as SplitText line/word reveals.
**Smooth-scroll (reference = Lenis; ship = ScrollSmoother):** Lenis `lerp .045`, `wheelMultiplier .9`, `touchMultiplier 1.4`, `smoothWheel true`; desktop only (native < 700px). ScrollSmoother mapping in §A7.
**Named scroll-linked constants:** hero-wipe span `0.4 × vh`; minimal-name parallax `y = scrollY × −0.38` (stops past `1.6 × vh`); divider band speeds `+0.12` / `−0.10`; disciplines image parallax `±7%` (image is `118%` tall, `top:-9%`); statement top-half scale `1 + 0.20·p`, bottom-half `1 + 0.20·p^1.6` (`p = clamp(sectionTop/vh, 0..1)`); reel-follow `lerp .055`.

---

## §A3 — Typography Specification

### Families & loading
| Family | Weights/styles used | Role | Loading |
|---|---|---|---|
| **Manrope** | 400, 500, 600, 700, (800 available) | Body, UI, all headings except hero display | `next/font/google` — `Manrope`, subset `latin`, `display: swap`, expose `--font-manrope` |
| **HK Grotesk Wide** | 600 (primary), 400 (available) | Hero masthead display + Statement giant word only | `next/font/local` (self-host the OTF: `HKGroteskWide-SemiBold.otf`, `-Regular.otf`), `display: swap`, `--font-hkgw`. *(License note in Open Questions.)* |
| Japanese fallback stack | 400/500 | `lang="ja"` sub-labels | System: `'Hiragino Kaku Gothic ProN','Yu Gothic','Noto Sans JP',sans-serif`. Optionally self-host **Noto Sans JP** (400/500) via `next/font` for cross-platform consistency. |
| Monospace | 500 | Statement bar micro-caps | System stack: `ui-monospace,'SF Mono',Menlo,monospace` |

Global font-smoothing: `-webkit-font-smoothing: antialiased`. Default body family: `var(--font-manrope), 'Helvetica Neue', sans-serif`.

### Type scale (exact — family / weight / size / line-height / letter-spacing)
Sizes marked `clamp/min/vw` are fluid; the CSS is authoritative.

| Step | Family / Wt | Size | LH | LS | Notes |
|---|---|---|---|---|---|
| Hero masthead (smoke variant) | HK GW / 600 | `clamp(40px,7.4vw,220px)` | 0.9 | 0.005em | `text-transform: uppercase`, split left/right (`ADNAAN` · `DASOO`) |
| Hero name (minimal variant) | Manrope / 400 | `clamp(32px,2.7vw,58px)` | 1.12 | −0.01em | lowercase, stacked `adnaan` / `dasoo` (2nd line `margin-left:1.15em`) |
| Statement giant word | Manrope / 400 | `24vw` | 0.94 | −0.015em | `CONTACT`, split into two clipped halves (`13.5vw` top / `8.5vw` bottom crops) |
| Divider band words | Manrope / 400 | `55vh` | 1 | −0.03em | `Introduction` / `Works`, horizontal drift |
| Work-row name | Manrope / 500 | `clamp(52px,6.2vw,126px)` | 1 | −0.02em | centered project name |
| About blurb | Manrope / 500 | `clamp(28px,3.9vw,62px)` | 1.2 | −0.016em | per-word gray→white fill |
| Disciplines intro line | Manrope / 500 | `min(50px,3.25vw)` | 1.26 | −0.015em | |
| Disciplines role name | Manrope / 500 | `min(46px,3vw)` | 1.08 | −0.02em | |
| Footer copy-email | Manrope / 500 | `clamp(28px,3.3vw,58px)` | 1.1 | −0.02em | oversized interactive |
| Marquee project name | Manrope / 600 | `clamp(24px,2.1vw,36px)` | 1 | −0.01em | ink `#111214` on white band |
| "See all" link | Manrope / 500 | `clamp(20px,1.8vw,26px)` | 1 | — | with arrow icon |
| Work-row side label | Manrope / 400 | 20px | 1 | — | `#d5d3ce` |
| Nav brand | Manrope / 500 | 18px | 1.3 | — | |
| Nav links | Manrope / 500 | 17px | 1.3 | — | home/about/work/contact |
| scroll-down cue | Manrope / 400 | 18px | 1.4 | — | `text-50` |
| Hero meta (designer×engineer / location) | Manrope / 400 | 16px | 1.4 | — | `text-50` |
| Footer socials | Manrope / 400 | 19px | 1 | 0.02em | `#8a8a8e`→`#ffffff` |
| Footer back-to-top | Manrope / 400 | 17px | 1 | 0.02em | |
| Disciplines desc | Manrope / 400 | 18px | 1.7 | — | `#9a9aa0`, `max-width:34ch` |
| say-hi label | Manrope / 600 | 15px | 20px | — | vertical swap |
| Disciplines eyebrow | Manrope / 500 | 14px | 1 | 0.10em | uppercase, `#8a8a8e` |
| Disciplines numeral / JP / desc-JP | Manrope / 400 | 18px / 15px | 1 | 0.12em (JP) | |
| Hero JP sub-label | Manrope / 400 | 13px | 1.4 | 0.14em | `text-38` |
| Work-list header labels | Manrope / 400 | 13px | 1 | 0.04em | `#77777d` |
| Discipline tags | Manrope / 400 | 13px | 1 | 0.04em | pill, `#b8b8be` |
| Footer eyebrow `(my socials)` | Manrope / 400 | 12px | 1 | 0.18em | `#8a8a8e` |
| Statement bar mono-caps | mono / 500 | 11px | 1 | 0.08em | `#111214`, justified rows |

### Responsive scaling
Fluid type is `clamp()`/`min()`/viewport-unit based (values above), so most steps scale continuously with no breakpoint overrides. Explicit `< 700px` overrides (from the reference media query): hero name `clamp(44px,12.6vw,90px)`; disciplines role name `30px`; work-row name `38px`, row height `110px`, side label `11px`; divider band `25vw`; statement bar mono `8px`/`ls .04em`.

### Special treatments
- **SplitText targets:** About blurb (**by words** — scrubbed gray→white fill); recommended additionally for the Disciplines intro line and section eyebrows (**by lines/chars**, reveal on enter). Smoke-variant hero masthead → **by chars** if that variant is built.
- **Oversized display:** hero masthead (`≤220px`), statement word (`24vw`), divider bands (`55vh`) — all set tight (LH ≤1, negative tracking). Guard against overflow with `overflow: clip` on their sections.
- **Recurring micro-system:** every major bilingual label pairs Latin (Manrope) with a Japanese line (`lang="ja"`, wider tracking, dimmer). Keep as a component (§A5 · BiLabel).

---

## §A4 — Layout & Responsive System

### Grid & container
- **No central max-width.** The site is **full-bleed** with a global **36px** side gutter (`left/right: 36px`); the hero masthead and hairlines run edge-to-edge. Treat "container" as `padding-inline: 36px` (16px on Disciplines, 12px < 700px).
- **Section-internal grids** (not a global 12-col):
  - Disciplines row: `grid-template-columns: clamp(120px,15vw,300px) 1.32fr 1fr 1fr; gap:40px` (numeral gutter · title+JP · desc+tags · 16:10 media).
  - Disciplines intro: `clamp(120px,15vw,300px) 1fr; gap:40px`.
  - Footer main: `1.25fr 1fr; gap:48px` (socials/AI · reel video).
  - Work rows: single-column stack of full-width rows (`height: clamp(128px,21vh,196px)`), centered name with absolutely-positioned side labels at the 36px gutters.
- **Gutters/gaps:** use flex/grid `gap` (values in §A2). Never source-whitespace spacing.

### Breakpoints
| Name | Width | Primary effect |
|---|---|---|
| `mobile` | `≤ 700px` | **Native scroll** (Lenis/ScrollSmoother off); nav center links hidden; hero → static (no wipe/pin); About pin released; many type down-steps (§A3); disciplines & rows stack to 1 col; footer grid → 1 col; hero reel & scroll-cue hidden. |
| `sm` | `≤ 860px` | (About/Works scaffolds) info grids → 1–2 col; editorial/meta grids stack. |
| `lg` | `≤ 1024px` | (Works scaffold) works grid `4 → 2` col (→ `1` at 860). |
| `desktop` | `> 1024px` | Full experience: smooth scroll, all choreography, multi-col grids. |

### Responsive strategy per section
- **Hero (minimal):** flows normally at all sizes; name recenters, parallax stays; meta row wraps to gutters. **(Smoke variant, if built):** `≤700px` becomes a static relative block, wipe/reel disabled.
- **About blurb:** desktop drives fill by scroll; `≤700px` drives by element rect, pin removed, padding `90px 22px`.
- **Divider bands:** shrink to `38vh` section height, `25vw` words `≤700px`.
- **Work list:** rows shorten to `110px`; side labels move to left/right gutters at `22px`; marquee still plays on hover (pointer devices).
- **Disciplines:** 4-col row → single column, media drops below text; card padding tightens.
- **Statement:** `24vw` word scales down naturally; bar mono → `8px`.
- **Footer:** 2-col → 1-col; reel video full-width.

### Vertical rhythm
No strict baseline grid. Rhythm is created by **`clamp()` section padding** + full-height (`100vh`) beats (hero, divider, pinned about in smoke mode). Keep the "one continuous surface" feel: sections share `#111214`, separated by hairlines, not margins.

---

## §A5 — Component Inventory

Site-level and reusable components. States listed only where they apply. All interactive elements need a visible **`:focus-visible`** ring (design adds none today — see §A10 / Open Questions; use a 2px `accent`/`ink` outline with offset).

### Fixed Top Nav (`[data-topnav]`)
- **Purpose:** persistent wayfinding. Fixed, full-width, `padding:16px 36px`, `mix-blend-mode: difference` (auto-contrasts over any background), `z-nav (120)`. Left brand (`adnaan dasoo`), center links (`home / about / work / contact`), right cluster (theme toggle + "say hi").
- **States:** default; **link hover** = dark block (`#1d1d21`) sweeps in L→R (`scaleX 0→1`, origin-left) and retracts to the right on leave (origin-right), text stays white — `sweep .72 / ease-out-expo`. Center links hidden `≤700px`. **Intro:** slides down from top on load (`data-intro-from="top"`).
- **Responsive:** center group `display:none ≤700px`; brand + right cluster persist.
- **Micro-interaction:** the sweep is directional (enters left, exits right) — preserve the asymmetry.

### "Say hi" button (`[data-sayhi]`)
- White pill (`radius 3px`, `#ffffff`), label `say hi` (`#111214`) + dark arrow chip (`radius 2px`, `#111214`, white ↗ icon).
- **Hover:** label swaps vertically (base `translateY(-105%)`, overlay `0`); arrow swaps **diagonally** toward top-right (a1 `translate(130%,-130%)`, a2 `0`) — `swap .85 / ease-out-expo`. **Focus-visible:** add ring. Links `mailto:`.

### Theme toggle (`[data-themetoggle]`)
- 34×34 white button, half-filled circle icon. Toggles `html[data-theme="light"]` → **whole-canvas `filter: invert(1)`** with `transition: filter .65s`; `img/video/[url(uploads)]` counter-inverted so media stays true. Persists to `localStorage['ad-theme']`. **In React:** implement as a `next-themes`-style class/attr toggle applying the same invert strategy (or a proper token swap — see Open Questions); persist and read on mount to avoid FOUC.

### Nav link / scroll anchor (`[data-scrollto]`, `[data-navlink]`)
- Same sweep as nav. `[data-scrollto]` smooth-scrolls to a section id (`hero`, etc.) — ship via ScrollSmoother `scrollTo(target, true)` / ScrollTrigger. `.dc.html` links trigger the **page veil** (§ Route transition).

### Preloader (`[data-preloader]`)
- **Purpose:** intro. Full-screen `#f7f6f4`, centered `300×384` frame. Eight image slides (`uploads/1–8.PNG`, minus 6) cascade in (`opacity 0→1`, staggered `380 + i·120ms`), then the frame **expands to 100% × 100%** (`rect .90 / ease-in-out-quint`) revealing the site; a `mix-blend-mode: difference` name (`adnaan`/`dasoo`) rides the cascade and lands as the minimal hero name. Scroll is **locked** during preload (wheel/touch/keys blocked), released on finish; nav + intro reveals fire after. Fade out `.55s`, then `display:none`.
- **States:** loading (cascade) → expanding → done. **Reduced-motion:** skip cascade/expand; show name briefly or hide immediately, unlock scroll.
- **Note:** honor `decode()` of images before starting; hard fallback timer `1200ms`.

### Living background (`[data-fixedbg]` + `canvas[data-livebg]`) — DEFERRED (WebGL)
- **Purpose:** fixed fluid-smoke field behind the hero (near-black `#111214` with faint warm wisps) + a 1:1 grain overlay; cursor stirs it (Navier-Stokes / fallback advection). **This is the deferred WebGL feature.** **v1:** render a flat `#111214` background (optionally a very subtle static grain via a tiled PNG/CSS) and omit the shader entirely. Fully specified in the reference for the later pass.

### Big-word Divider (`[data-band-section]`, `[data-band]`)
- Two full-width rows (`Introduction` white, `Works` `#37373b`) at `55vh`, drifting horizontally with scroll at speeds `+0.12` / `−0.10` (opposed). `100vh` section. **Reduced-motion:** static, no drift.

### Work-list Row (`[data-wrow]`) — project index item
- **Purpose:** link to a project. Full-width row (`clamp(128px,21vh,196px)`), top hairline `line-09`, centered **project name**, side labels (industry left, `'YY` timeline right at 36px gutters).
- **Hover:** a white (`#f2f1ef`/`#ffffff`) **marquee band** wipes open vertically (`clip-path: inset(50% 0) → inset(0)`, `clip .55 / ease-out-quart`) while its **track lifts** `translate: 0 30px → 0` (`track .70`); the track auto-scrolls infinitely (`marquee 32s linear`), showing pill image + project name + JP name repeated. **Default:** just the centered name on dark. Cursor `pointer`.
- **Content (4 rows):** Ronny (`Brand`, '24) · Elkhateeb → "Salem Elkhateeb" (`Portfolio`, '26) · Nike Clone (`Concept`, '25) · Sofive → "Sofive Tracker" (`Product`, '26).
- **Responsive:** `110px` tall `≤700px`; labels to gutters. **Reduced-motion:** name → static reveal; suppress marquee, show a still image swap on hover/focus.

### Marquee (`[data-wrow-track]`, `[data-wrow-marq]`)
- Infinite horizontal track (`animation: wlistMarq 32s linear infinite`, `translateX 0 → -50%`, duplicated content for seamless loop). Pill images `radius 999px`, `clamp(184px,21vw,272px) × clamp(74px,13vh,118px)`. **Reduced-motion:** freeze.

### Disciplines Row (`[data-xp-row]`)
- 4-col grid (numeral · name+JP · desc+tag-pills · 16:10 media). Row hairline `line-055` (rows 2–3 only, via `r.line`). Media has scroll **parallax** (`±7%`). Tag pills: `radius 6px`, `border line-13`, `fill-035`, `pad 10px 15px`. Data-driven (`roles[]`, §A6). **Reduced-motion:** kill parallax (static image).

### BiLabel (recurring pattern)
- Latin line (Manrope) + Japanese line (`lang="ja"`, dimmer, wider tracking). Used in hero meta, footer, disciplines, work rows. Componentize.

### Statement block (`#statement`, `[data-ct-word]`, `[data-ct-bar]`)
- Giant `CONTACT` split into two viewport-cropped halves around a **white bar** of justified mono micro-caps ("EACH PROJECT STARTS WITH A CONVERSATION. / DESIGN AND ENGINEERING, HELD TO THE SAME STANDARD."). On scroll the two halves **scale at different rates** and resolve into perfect alignment as the section leaves. **Reduced-motion:** render aligned/static.

### Footer (`#footer`)
- Top hairline; BiLabel (designer×engineer) + `est. 2026 · baltimore, md`; 2-col grid: **socials** (github/linkedin/instagram, `#8a8a8e`→`#ffffff` on hover, `hover .30`) and **ask-ai** row (Claude / ChatGPT / Gemini / Grok icons → open each tool prefilled with a bio prompt, `#77777d`→`#ffffff`); **reel video** card + JP paragraph; bottom row = oversized **copy-email** + **back-to-top**.
- **Copy-email (`[data-foot-copy]`):** hover → color `accent` + copy icon slides in; **click** → writes to clipboard, icon morphs copy→check (`ease-back`), text nudges `scale .98→1`, reverts after `1700ms`. `role="button"`, `tabindex=0` (add key handler — Open Questions).
- **Back-to-top (`[data-back-top]`):** raises `translateY(-4px)` on hover; scrolls to `#hero`.
- **Reduced-motion:** keep hovers (color only), drop transforms.

### Route transition veil (`html::before`)
- Fixed `#111214` overlay, `z 150`. On in-site `.dc.html` navigation: set `[data-pageleave]` → veil `opacity 0→1` (`veil .32`), navigate after `340ms`; on arrival veil animates `1→0` (`adPageIn .6s`). **In Next.js:** implement with `next/link` + a GSAP overlay timeline in a route-transition provider (App Router `template.tsx` or a `usePathname` effect). **Reduced-motion:** instant swap, no veil.

---

## §A6 — Page & Section Specifications (Home)

Order: **Preloader → Nav → Hero → About → Divider → Work List → Disciplines → Statement → Footer.** Background is a single `#111214` surface; sections carry their own `z-index` (§A2). All motion is scroll-linked via the master rAF loop in the reference — ship as ScrollTrigger (§A7).

### 0. Preloader
- **(a) Layout/content:** full-screen `#f7f6f4`; centered `300×384` frame; 8 stacked image slides; centered `mix-blend-mode:difference` name (`adnaan`/`dasoo`, Manrope 400, `clamp(32px,2.7vw,58px)`).
- **(b) Responsive:** frame fixed px; centers at all sizes.
- **(c) Choreography:** on load, lock scroll; after `decode()` (or `1200ms` fallback), slides fade in staggered `380 + i·120ms`; at `380 + 8·120 + 300ms` the frame expands `width/height → 100%` (`rect .90 / ease-in-out-quint`); at `+900ms` finish → reveal nav, fire intro reveals, fade preloader out `.55s`. The difference-blend name lands exactly on the minimal hero name (seamless handoff).

### 1. Hero — **PRIMARY = minimal variant** (`#hero`, `[data-hero-v="minimal"]`)
> The reference ships two variants behind a `heroStyle` prop; **v1 builds `minimal`** (flat dark, normal scroll — WebGL smoke deferred). `smoke reel` documented as an alternate/later beat below.
- **(a) Layout/content:** `100vh` section, background flat `#111214`. Dead-center **stacked lowercase name** `adnaan` / `dasoo` (Manrope 400, `clamp(32px,2.7vw,58px)`, LH 1.12, LS −0.01em; 2nd line indented `1.15em`). Bottom-left BiLabel `designer × engineer` + JP `デザイナー × エンジニア`; bottom-right `baltimore, md / 39°17'N 76°36'W` (both `text-50`, `16px`, at 36px gutters, `bottom:26px`). Center-bottom scroll cue: `scroll down` + arrow (masked `uploads/arrow-mask.png`, `scaleX(-1)`), `bottom:26px`.
- **(b) Responsive:** flows normally; hides nothing critical; name `clamp(44px,12.6vw,90px)` `≤700px` (per reference override for hero-name — for minimal, keep the `clamp(32,2.7vw,58)` and let it shrink; verify on device). Scroll cue hidden `≤700px`.
- **(c) Choreography:**
  - **Name parallax** (`[data-min-name]`): `transform: translate3d(0, scrollY × −0.38, 0)`; disabled past `scrollY > 1.6·vh`. Ship as ScrollTrigger scrub `y: -38%`-ish over the hero's scroll span. It lifts faster than the page → depth.
  - **Intro reveals:** meta + scroll cue ease in on load from bottom (`data-intro-from="bottom"`, `+32px`→0, `opacity 0→1`, `intro .85 / ease-out-quart`).
  - **No pin, no wipe.** About begins immediately after.

- **Alternate — `smoke reel` variant** (`[data-hero-v="smoke"]`, later pass): HK Grotesk Wide **masthead** `ADNAAN … DASOO` split edge-to-edge (`clamp(40px,7.4vw,220px)`, uppercase, LS 0.005em) above a hairline rule (`line-14`); cursor-following **reel video** (`min(22vw,380px)`, 16:10) that lerps toward the cursor (`.055`) then rests right; over the fluid-smoke background. **Curtain-wipe on scroll:** hero is `position:fixed`-style (`margin-bottom:-100vh`), and over `0.4·vh` of scroll it translates down (`translateY min(scrollY,vh)`) while `clip-path: inset(0 0 p·100% 0)` wipes it away bottom-up; `visibility:hidden` at `p≥1`. Requires WebGL + is **deferred**.

### 2. About (`#about`, `[data-about-track]` / `[data-about-pin]`)
- **(a) Layout/content:** centered mission blurb, `padding:0 36px`, `font: Manrope 500 clamp(28px,3.9vw,62px)/1.2, LS −0.016em`. Each word is a `[data-abw]` span, base `text-24`. Copy (full): *"The goal has always been to close the gap between design and engineering. I build visual identities and …"* (complete string in reference — preserve verbatim).
- **(b) Responsive:** **minimal-hero build = no pin** — the blurb sits right after the hero as a normal block, `padding: clamp(110px,16vh,200px) 36px`. `≤700px`: `padding:90px 22px`, fill driven by rect.
- **(c) Choreography — word fill:** words turn `text-24 → #ffffff` one-by-one as you scroll (`micro .22` color transition each). Fill fraction `p`: **minimal/mobile** `p = (vh·0.88 − wrapTop) / (vh·0.6)`; **(pinned smoke mode)** `p = (scrollY − vh·0.25) / (vh·0.6)`; `n = round(p × wordCount)`. Ship as **SplitText(words) + ScrollTrigger scrub** setting each word's color by progress. **Reduced-motion:** all words `#ffffff` immediately (no scrub).
  - *(Smoke-mode only: About is a sticky `100vh` pin, track height = `pinHeight + vh·0.55`, so the pin releases only after the hero wipe completes. Not used in minimal build.)*

### 3. Divider (`#bands`, `[data-band-section]`)
- **(a) Layout/content:** `100vh`, two stacked band rows: `Introduction` (white) and `Works` (`#37373b`), Manrope 400 `55vh`, LS −0.03em, each with inline rule glyphs between repeats; rows pre-offset (`margin-left: -6vw` / `-115vw`).
- **(b) Responsive:** section + rows `38vh`, words `25vw` `≤700px`.
- **(c) Choreography:** horizontal drift tied to section progress `p = clamp((vh − top)/(vh + height), 0..1)`; `translateX = (0.5 − p) × vw × speed × 2`, speeds `+0.12` / `−0.10` (rows move opposite ways). Ship as ScrollTrigger scrub `x`. **Reduced-motion:** static centered.

### 4. Work List (`#worklist`)
- **(a) Layout/content:** header row `Industry` (left) / `Timeline` (right) `#77777d 13px`; then 4 **Work-list Rows** (§A5). Footer CTA: centered `See all →` link → Works page. Section padding `clamp(56px,8vh,110px) 0 clamp(56px,8vh,100px)`; CTA `padding-top: clamp(64px,9vh,120px)`.
- **(b) Responsive:** rows `110px`, labels to 22px gutters `≤700px`.
- **(c) Choreography:** per-row **hover** = marquee reveal (clip `.55`) + track lift (`.70`) + infinite scroll (`32s linear`); see §A5. Optional on-enter: rows fade/rise in (author as batch ScrollTrigger, stagger `.06`). **Reduced-motion:** show static row; no marquee.

### 5. Disciplines (`#disciplines`)
- **(a) Layout/content:** section `padding:70px 16px 130px`. Outer card `#1d1d21` (`radius 18px`), intro grid (empty gutter · eyebrow `disciplines` + intro line *"Strategy, design, and development — one continuous craft from the first idea to the shipped product."*), inner panel `#111214` (`radius 14px`) holding **3 rows** from `roles[]`:
  - `01 · brand strategy · ブランド戦略` — *"Positioning, voice, and visual identity — finding what makes a brand worth noticing and building the system that carries it everywhere."* — tags: identity, positioning, voice & tone, art direction, naming, brand systems.
  - `02 · digital design · デジタルデザイン` — *"Interfaces, motion, and art direction — screens that feel considered in every state, from the first paint to the edge case."* — tags: ui / ux, design systems, motion, prototyping, typography, interaction.
  - `03 · development · 開発` — *"Production-grade builds in React and TypeScript — fast, accessible front-ends where the craft survives contact with real users."* — tags: react, next.js, typescript, gsap, supabase, ci / cd.
  - Each row: numeral (`#8a8a8e 18px`), name (`min(46px,3vw)`) + JP, description (`18px/1.7 #9a9aa0 max 34ch`) + tag pills, and a **16:10 media** slot.
- **(b) Responsive:** `padding:40px 12px 70px`; intro + rows → 1 col; role name `30px` `≤700px`.
- **(c) Choreography:** media **parallax** — inner `[data-xp-img]` is `118%` tall at `top:-9%`, translated `translateY(−p·7%)` where `p = clamp(((rowMid) − vh/2)/((vh+h)/2), −1..1)`. Ship as ScrollTrigger scrub `yPercent ≈ ±7`. Optional row reveal on enter. **Reduced-motion:** no parallax.

### 6. Statement (`#statement`)
- **(a) Layout/content:** `padding-top: clamp(70px,10vh,130px)`, `overflow:hidden`. Top crop `13.5vw` + bottom crop `8.5vw` of a `24vw` `CONTACT` (Manrope 400, LH 0.94, LS −0.015em, `#ffffff`), split by a **white bar** (`padding:9px 36px 10px`) of two justified mono-caps rows (copy above).
- **(b) Responsive:** word scales with `vw`; bar mono `8px`, `ls .04em` `≤700px`.
- **(c) Choreography:** as the section scrolls through, `p = clamp(sectionTop/vh, 0..1)`; **top half** `scale = 1 + 0.20·p` (origin `50% 0`), **bottom half** `scale = 1 + 0.20·p^1.6` (origin `50% 100%`) — the halves are mis-sized while entering and **resolve to aligned** (`p→0`) as the section settles/leaves. Ship as ScrollTrigger scrub on the two halves' scale. **Reduced-motion:** render aligned (both `scale 1`).

### 7. Footer (`#footer`)
- **(a) Layout/content:** `padding:0 36px clamp(40px,5vh,64px)`, `min-height:44vh`, flex column. Top hairline; label row (BiLabel + `est. 2026 · baltimore, md`); 2-col grid (`1.25fr 1fr`): left = `(my socials)` list + `(ask ai about me)` icon row; right = reel **video** card (`min(26vw,380px)`, 16:10) + JP paragraph. Bottom row (pushed via `margin-top:auto`, `padding-top:44px`): oversized **copy-email** `adnaandasoo@gmail.com` + **back-to-top**.
- **(b) Responsive:** grid → 1 col, video full-width, `gap 44px` `≤700px`.
- **(c) Choreography:** social color hovers (`.30`); ask-ai icon color+lift; copy-email hover (icon slide-in) & click (clipboard + check pop `ease-back`, revert `1700ms`); back-to-top raise + smooth scroll to hero. **Reduced-motion:** colors only, no transforms.

---

## §A7 — Animation & Motion Specification (GSAP)

**Rule (state explicitly):** the **default branch of `gsap.matchMedia()` is the full motion design**. `prefers-reduced-motion: reduce` is a **separate branch** with instant/opacity-only fallbacks (no scrub, pin, parallax, marquee) — it **never** degrades the default. Register plugins once (`gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, useGSAP)`); every effect uses `useGSAP()` with scoped cleanup; always `split.revert()` on cleanup; no direct DOM animation outside GSAP; never animate layout props that thrash (animate `transform`/`opacity`/`clip-path`, use `xPercent/yPercent`, `will-change` sparingly).

### Global smooth scroll — ScrollSmoother
```
ScrollSmoother.create({
  smooth: 1.2,          // maps Lenis lerp .045 feel; tune 1–1.5
  effects: true,        // enable data-speed/data-lag parallax hooks
  smoothTouch: 0,       // native on touch (matches Lenis: off ≤700px)
  normalizeScroll: true
})
```
Disable/– use native scroll `≤700px` (matchMedia `(min-width:701px)` gate). Route `[data-scrollto]` clicks through `ScrollSmoother.scrollTo(target, true)`.

### Per-animation table
Fallback column = what the **opted-in reduced-motion** user sees.

| # | Name | Trigger | Target(s) | Animated props | Ease | Dur / scrub | ScrollTrigger (start → end · pin/scrub) | Reduced-motion fallback |
|---|---|---|---|---|---|---|---|---|
| 1 | Preloader cascade+expand | load | slides, frame, name | `opacity`, `width/height` | `ease-in-out-quint` | `.90` (expand); stagger `.12` | — (timeline, scroll locked) | Skip; unlock immediately, name visible then hero |
| 2 | Nav intro | load (post-preload) | `[data-topnav]` | `y`, `opacity` | `ease-out-quart` | `.85` | — | Instant show |
| 3 | Intro reveals | load | `[data-intro-from]` | `x/y (±52/±32)`, `opacity` | `ease-out-quart` | `.85`, stagger `.06` | — (batch on enter for below-fold) | Instant show, no offset |
| 4 | Nav link sweep | hover/focus | `[data-nl-hl]` | `scaleX 0↔1` (origin L→R) | `ease-out-expo` | `.72` | — | Keep (cheap) or instant bg |
| 5 | Say-hi swap | hover/focus | label/arrow spans | `translateY/translate` | `ease-out-expo` | `.85` | — | Keep or instant |
| 6 | Minimal name parallax | scroll | `[data-min-name]` | `y = scrollY×−0.38` (cap `1.6vh`) | `none` | scrub | `top top → +160% · scrub` | No transform |
| 7 | About word fill | scroll | `SplitText(words)` of blurb | per-word `color` 24%→#fff | `none` | scrub | `top 88% → +60% vh · scrub` | All words #fff instantly |
| 8 | Divider band drift | scroll | `[data-band]` ×2 | `x = (0.5−p)·vw·speed·2` (±.12/−.10) | `none` | scrub | `top bottom → bottom top · scrub` | Static |
| 9 | Work-row reveal | enter | `[data-wrow]` | `y`, `opacity` | `ease-out-quart` | `.6`, stagger `.06` | `top 85% · once` | Instant |
| 10 | Work-row marquee reveal | hover/focus | `[data-wrow-marq]` / `[data-wrow-track]` | `clip-path inset 50→0`; `translateY 30→0` | `ease-out-quart` | `.55` / `.70` | — | Show still image, no clip |
| 11 | Marquee loop | always (on reveal) | `[data-wrow-track]` | `xPercent 0→−50` | `none` | `32s` loop | — | Paused/frozen |
| 12 | Disciplines media parallax | scroll | `[data-xp-img]` | `yPercent ±7` | `none` | scrub | `top bottom → bottom top · scrub` | Static |
| 13 | Statement halves resolve | scroll | `[data-ct-word]` ×2 | `scale` top `1+.20p` / bottom `1+.20p^1.6` | `none` | scrub | `top bottom → top top · scrub` | Both `scale 1` |
| 14 | Reel cursor-follow *(smoke variant, deferred)* | mousemove | `[data-hero-reel]` | `x` lerp `.055` | — | rAF | — | Static right-aligned |
| 15 | Hero curtain-wipe *(smoke variant, deferred)* | scroll | `[data-hero-fix]` | `translateY`, `clip-path inset bottom 0→100%` | `none` | scrub | `top top → +40% vh · scrub` | No wipe (static hero) |
| 16 | Copy-email confirm | click | `[data-foot-copy]` icons/text | icon `opacity/scale` (copy→check), text `scale .98` | `ease-back` (check) | `.35/.45`, revert `1700ms` | — | Keep (essential feedback) |
| 17 | Footer hovers | hover/focus | socials / ask-ai / back-to-top | `color`; `translateY(-4px)` | `ease-std` / `ease-out-expo` | `.30 / .45` | — | Color only |
| 18 | Route veil | link click / mount | overlay | `opacity 0↔1` | `ease-std` | `.32 / .6` | — | Instant swap |

### SplitText usage
- **About blurb → `words`** (primary): scrubbed color fill (#17 above → #7). Revert on cleanup.
- **Disciplines intro line & section eyebrows → `lines`/`chars`** (recommended): reveal on enter (`y`, `opacity`, stagger `.04–.06`).
- **Smoke-variant hero masthead → `chars`** (only if that variant is built): stagger-in on load.
- Always run SplitText after fonts are ready (`document.fonts.ready`) to avoid re-split reflow; store the instance and `revert()` in `useGSAP` cleanup.

### Page / route transitions
Enter/exit veil (#18): on in-app navigation, play a `#111214` overlay `opacity 0→1` (`.32s`), push the route, then `1→0` (`.6s`) on the new route. Implement in an App-Router transition provider (`template.tsx` re-mounts per route — animate on mount; intercept `next/link` clicks for the exit half). Reduced-motion → instant.

---

## §A8 — Asset Manifest

Real media is supplied later. Scaffold each slot with a **labeled placeholder at the exact ratio** (dominant near-black `#1c1c20`/`#1a1a1e` block with a centered caption of the intended subject). Use `next/image` (priority where noted) / `next/video`.

| Slot / section | Subject | Dimensions · ratio | Fit / art-direction | Responsive sizes | Format | Load |
|---|---|---|---|---|---|---|
| Preloader 1–8 (`uploads/1–8.PNG`, skip 6) | Intro image cascade (mood/work stills) | render `300×384` · **25:32** | `cover`, centered | fixed frame | PNG/WebP | eager (decode before start) |
| Hero reel *(smoke variant, deferred)* | Brand showreel loop | `min(22vw,380px)` · **16:10** | `cover`, muted/loop/inline/autoplay | `≤700px` hidden | MP4/WebM (poster) | lazy |
| Arrow mask (`uploads/arrow-mask.png`) | Scroll-cue arrow glyph | native · **349:541** | CSS `mask`, `scaleX(-1)` | — | PNG (alpha) | eager (tiny) |
| Work-row pill ×4 (`ronny-rot.png`, `pasted-1784211631917`, `-1784220517597`, `-1784222696700`) | Per-project thumbnail in pill | `clamp(184–272px) × clamp(74–118px)` · ~**7:3** | `cover`, `radius 999px` | scales w/ clamp | PNG/WebP | lazy (on hover) |
| Disciplines media ×3 (`pasted-1784271794081`, `-1784182247884`, `-1784131352693`) | Discipline supporting image | 16:10 | `cover`, `radius 10px`, parallax `118%`@`top:-9%` | 1 col `≤700` | WebP | lazy |
| Footer reel (`adnaan_brand_reel_075s - Trim.mp4`) | Brand showreel loop | `min(26vw,380px)` · **16:10** | `cover`, muted/loop/inline/autoplay | full-width `≤700` | MP4/WebM (poster) | lazy |
| Favicon (`favicon.png`) | Site icon | — | — | — | PNG | eager |
| Fonts (`HKGroteskWide-SemiBold.otf`, `-Regular.otf`) | Display face | — | self-host via `next/font/local` | — | OTF/WOFF2 | `swap` |
| Living-smoke background *(deferred WebGL)* | Procedural — **no asset** | viewport | shader; v1 = flat `#111214` | — | — | — |

*Reference imagery in `reference-designs/` is reference only, not production art.* Provide OG/social image at **1200×630** (§A10).

---

## §A9 — About & Works — Design Briefs (to design + build, consistent with home)

> Not full specs. Design these within the established system, then build. Early **light-theme** scaffolds exist in `reference-designs/` (About/Works `.dc.html`) — treat as loose reference for the inverted palette, **not** as approved layouts. Prefer inheriting the **dark home system** unless a light editorial treatment is explicitly chosen (Open Question).

**Reuse across both:** all §A2 tokens; Manrope + HK Grotesk Wide type scale; Nav, Footer, BiLabel, Route-veil, Theme-toggle, and the §A7 motion vocabulary (SplitText line/word reveals, scrubbed parallax, hairline dividers, `ease-out-quart`). Keep the full-bleed 36px-gutter, hairline-separated, one-surface feel. No new colors, radii, or shadows.

### About page
- **Purpose:** who Adnaan is + how he works; the human behind the home page's claims.
- **Suggested sections:** (1) **Intro/bio** — oversized statement headline (SplitText words) + short paragraph; portrait image slot (16:20 or 4:5). (2) **Skills/capabilities** — reuse the Disciplines row pattern or a compact tag/skills grid. (3) **Experience/timeline** — vertical, hairline-separated rows (year · role · org), scroll-reveal per row. (4) **Personal/closing note** — a quiet full-width line + CTA into Works/contact (reuse copy-email + say-hi).
- **Feel:** slower, more editorial and personal than home; same restraint. One or two signature motion moments (portrait parallax or a word-fill bio), not a motion showcase.

### Works page
- **Purpose:** the full project index → individual case studies.
- **Suggested sections:** (1) **Header** — page title + count/filter (optional). (2) **Project grid/index** — reuse Work-list Row (list) *or* a 2–3-col card grid at the home ratios; each item links to a case study; hover = marquee/still swap consistent with home. (3) **Footer** (shared). Case-study detail pages: propose later (hero image, role/stack/year meta, problem→approach→outcome sections, next-project link) — do **not** fully build in v1.
- **Feel:** denser than home but same typographic system; grid `4→2→1` at `1024/860` (matches scaffold) or list rows; motion = scroll-reveal + hover, no new patterns.

**Deferred for both:** WebGL/3D, and any richer iteration — later pass. Real content + imagery will be supplied.

---

## §A10 — Non-Functional Requirements

**Performance (Core Web Vitals, despite heavy motion):**
- Targets: **LCP < 2.5s**, **CLS < 0.1**, **INP < 200ms** on mid-tier mobile.
- `next/image` everywhere (AVIF/WebP, correct `sizes`, `priority` only on preloader/above-fold); `next/video` with `poster`, `preload="metadata"`, `muted/playsInline/loop` for reels; lazy-load below-fold media.
- Animate only compositor-friendly props (`transform`, `opacity`, `clip-path`); batch reads/writes (GSAP + ScrollTrigger already rAF-batched) — **no scroll-linked layout reads/writes** that thrash. Use `will-change` only on actively-animating nodes, clear after.
- Code-split per route; keep GSAP plugin registration in one client module; defer the (later) WebGL shader behind dynamic import + capability check. Self-host fonts (`display: swap`), subset Latin (+ JP if self-hosted).
- Budget: keep JS lean (GSAP core + ScrollTrigger/ScrollSmoother/SplitText only). Preloader must not block interactivity beyond its lock window.

**Accessibility (WCAG AA):**
- Semantic landmarks (`<header><nav><main><section aria-label><footer>`), one `<h1>` (name), logical heading order; sections labelled (the `data-screen-label`s map to `aria-label`s).
- **Keyboard:** all interactives focusable in order; add visible **`:focus-visible`** rings (2px `accent`/`ink`, 2px offset) — none exist today. Copy-email is `role="button" tabindex=0`: add Enter/Space handlers. Nav sweep/say-hi must trigger on focus too.
- **Contrast:** body `text-50` (`rgba(255,255,255,.5)`) on `#111214` ≈ 4.7:1 (passes AA for text); the **`text-24` About unfilled words fail contrast** — acceptable only because they are a transient animated state that resolves to `#fff` (ensure reduced-motion shows them filled = readable). Mono bar `#111214` on `#fff` passes.
- **Reduced motion:** `gsap.matchMedia('(prefers-reduced-motion: reduce)')` branch per §A7 — no scrub/pin/parallax/marquee/curtain; content fully revealed and legible; preloader skipped; autoplaying reels paused with a play control (or `poster` still).
- Respect focus management across the route-veil transition (don't trap focus behind the overlay; move focus to `<main>`/`<h1>` on route change).

**SEO / metadata / OG:**
- App-Router `metadata` per route (title, description, canonical); Open Graph + Twitter card with a **1200×630** image; `lang="en"` (+ `lang="ja"` on JP spans); JSON-LD `Person` (name, jobTitle "Designer & Engineer", location Baltimore MD, sameAs socials). Sitemap + robots. Descriptive `alt` on all imagery slots.

**Responsive coverage:** verified at the §A4 breakpoints (`≤700`, `≤860`, `≤1024`, desktop) plus common widths (360/390/768/1024/1440/1920). No horizontal overflow (`overflow-x: clip` on the wrapper; guard the oversized display type).

**Browser support:** modern evergreen (latest Chrome, Safari incl. iOS, Firefox, Edge). Verify `mix-blend-mode`, `clip-path`, CSS `mask`, `backdrop`/`filter: invert` (theme), and `@gsap/react` behavior on iOS Safari. Provide graceful fallback if `filter: invert` theme is janky on a device (see Open Questions).

---

## Open Questions

1. **Hero variant as v1 default.** Reference `heroStyle` prop defaults to `smoke reel`, but the live preview is set to **`minimal`**, and WebGL is deferred — so this handoff treats **minimal** as the v1 hero and smoke-reel + fluid-smoke + curtain-wipe as a **later WebGL pass**. Confirm minimal is the intended launch hero.
2. **Living smoke background.** Deferred with WebGL — confirm v1 ships a flat `#111214` (with/without a subtle static grain). If the grain is wanted in v1, specify intensity; otherwise it returns with the shader.
3. **Light theme mechanism.** Today it's a whole-page `filter: invert(1)` with media counter-invert — clever but fragile (perf/inversion artifacts, and it inverts the *smoke*). For production, prefer a **proper token swap** (dark/light Tailwind palettes via `data-theme`) or confirm the invert trick is acceptable. Also: is the light theme in scope for launch, or dark-only v1?
4. **About/Works direction.** The scaffolds are **light-theme**; the home page is dark. Should About/Works be **dark (consistent)** or an intentional **light editorial** counterpoint? This drives §A9.
5. **Real content & links.** Social URLs are placeholder `#`; project names/case-study content, About bio/timeline, and all imagery are TBD. Confirm final project list (Ronny, Salem Elkhateeb, Nike Clone, Sofive Tracker — keep/replace?).
6. **HK Grotesk Wide license.** Confirm a web license permits self-hosting the OTF via `next/font/local` for production; else substitute a licensed wide grotesque.
7. **Japanese copy.** Confirm the JP sub-labels/paragraph are correct and wanted at launch (and whether to self-host Noto Sans JP for consistent rendering).
8. **Ask-AI links.** Footer opens Claude/ChatGPT/Gemini/Grok prefilled with a bio prompt — confirm this stays for launch (and the prompt text).
9. **Focus-visible + copy-email keyboard.** No focus rings exist in the reference; §A10 proposes them — confirm the ring style, and that Enter/Space should trigger copy.
10. **Contact.** "contact" nav + say-hi are `mailto:adnaandasoo@gmail.com` — is a contact form/page wanted, or mailto-only?
