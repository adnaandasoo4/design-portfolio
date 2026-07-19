# Part B — Claude Code Kickoff Prompt

Paste the fenced block below into Claude Code (run the strong model as orchestrator). It references the handoff docs in this bundle (`HANDOFF.md` §A1–§A10, `README.md`).

````text
You are building an awwwards-level, scroll-driven portfolio for a designer/engineer (Adnaan Dasoo, Baltimore MD), production-ready for a live launch. Build strictly from the attached handoff documentation — HANDOFF.md (sections §A1–§A10) and README.md. The home page is fully designed (hi-fi); About and Works are design briefs (§A9) you will design-then-build within the established system. Do not invent visual direction where the docs specify exact values — use them verbatim.

MISSION & CONTEXT
- Recreate the home page pixel-precise to §A6 (layout/content/responsive) and §A7 (motion), then design+build About and Works from §A9, consistent with the system. Perceived craft and motion precision are the whole point.
- Reference HTML in reference-designs/ shows intended look/behavior — it is a reference, NOT code to copy. Rebuild in the stack below.

STACK & SETUP
- Latest stable Next.js (App Router) + TypeScript (strict) + TailwindCSS.
- GSAP with ScrollTrigger, ScrollSmoother, and SplitText, used via @gsap/react (useGSAP). No Framer Motion. No WebGL/3D (deferred — see §A6/§A8 Open Questions).
- Confirm current stable package versions before installing (Next, React, gsap, @gsap/react, tailwindcss). GSAP’s formerly-premium plugins (ScrollSmoother, SplitText) are now free including commercial use — install standard gsap.
- Install the official GSAP agent skills so animation code is idiomatic (confirm the current command; e.g. `npx skills add https://github.com/greensock/gsap-skills`). If the command/URL has changed, find and use the current official GSAP LLM/agent resource.
- Hosting target: Vercel. Content: a typed TS/MDX content layer (no CMS).

PROJECT STRUCTURE & CONVENTIONS
- Clean, scalable App Router structure: app/(routes), components/ (site-level + section components), lib/gsap (single plugin-registration + ScrollSmoother provider + shared motion tokens), content/ (typed TS/MDX for projects, disciplines, copy), public/assets (placeholders matching the §A8 manifest, correct ratios + labels).
- Generate tailwind.config theme.extend directly from §A2: colors (semantic names), spacing scale, borderRadius, borderWidth, zIndex layers, and motion tokens (durations/eases as CSS vars or a shared TS map). No shadows (design uses none).
- Typography per §A3: next/font (Manrope from Google; HK Grotesk Wide self-hosted via next/font/local — confirm license, else substitute; optional Noto Sans JP). Expose CSS vars.
- Coding standards: strict TypeScript; useGSAP for EVERY GSAP effect with proper scoped cleanup (and SplitText.revert()); no direct DOM animation outside GSAP; animate only transform/opacity/clip-path; no scroll-linked layout thrash; components server-first, mark client only where GSAP/interactivity needs it.

BUILD ORDER (STRICT)
1) Home page exactly to §A6/§A7 — tokens+Tailwind, then Nav, Preloader, Hero (MINIMAL variant — flat #111214, normal scroll, centered lowercase name + parallax; smoke-reel/curtain-wipe is the deferred WebGL variant, do not build), About (word-fill), Divider, Work List (marquee rows), Disciplines (parallax media), Statement (halves resolve), Footer (copy-email/back-to-top/ask-ai). Implement the full scroll choreography (per-animation table §A7).
2) Then design+build About and Works from the §A9 briefs, reusing existing components/tokens/motion. Keep dark-system consistency unless directed otherwise (§A9 / Open Question).
3) STOP for review before any later iteration. WebGL/3D and the smoke-reel hero, living background, case-study detail pages, and richer passes are explicitly deferred — do not build them.

ANIMATION RULES
- Implement ScrollSmoother globally per §A7 (smooth ≈1.2, effects on, smoothTouch 0; native scroll ≤700px via matchMedia).
- Author ALL motion inside gsap.matchMedia(): the full design in the default branch; the §A7 reduced-motion fallbacks in a (prefers-reduced-motion: reduce) branch (instant/opacity-only — no scrub/pin/parallax/marquee/curtain, preloader skipped, reels paused). The default experience must never be degraded for non-opted-in users.
- Use SplitText per §A7 (About blurb by words = scrubbed color fill; disciplines intro/eyebrows by lines/chars) after document.fonts.ready; revert on cleanup.
- Route transitions: the #111214 veil (§A5/§A7 #18) via an App-Router transition provider; reduced-motion = instant.

ORCHESTRATION GUIDANCE
- Run the strong model as orchestrator; keep its context lean. Use subagents for well-scoped parallel work: token/Tailwind + font setup; the content-layer scaffold; one section/component at a time (Nav, Preloader, Hero, About, Divider, WorkList, Disciplines, Statement, Footer). Route mechanical/boilerplate subagents to a lighter model to conserve usage.
- Add a dedicated REVIEW subagent pass on each delivered section: check accessibility (WCAG AA — semantics, focus-visible, keyboard, contrast, reduced-motion), performance/Core Web Vitals (image weight, code-split, no layout thrash), and animation correctness vs the §A7 spec.
- A dynamic cross-file workflow (ultracode) is optional — reserve it only for a cross-cutting audit across many files (it can use more tokens).

DEFINITION OF DONE
- Per section: matches the spec; responsive across the §A4 breakpoints (≤700/≤860/≤1024/desktop); all component states implemented (default/hover/focus-visible/active + copy states); reduced-motion fallback present; accessible; performant.
- Overall: clean typecheck + lint; no console errors; Vercel-ready; WCAG AA; strong Core Web Vitals; real-asset slots wired to labeled placeholders (correct ratios) ready for swap-in; metadata + OG (1200×630) + JSON-LD Person in place.
- Before finishing, surface the §A8 asset list and the Open-Questions items that need my input (final hero variant, light-theme scope, About/Works direction, real content/links, HK Grotesk Wide license).
````
