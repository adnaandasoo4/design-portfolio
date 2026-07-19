# Handoff: Adnaan Dasoo — Portfolio (Home page + About/Works briefs)

## Overview
This bundle is the engineering handoff for an **awwwards-caliber portfolio for a designer/engineer** (Adnaan Dasoo, Baltimore MD). The **home page and all its sections are fully designed** (~65–70% of the site). The **About** and **Works** pages are **not yet designed** — this bundle contains **design briefs** for them (§A9) so they can be designed-and-built consistent with the established system, not full specs.

Two things live here:
1. **`HANDOFF.md`** — the complete design documentation (§A1–§A10), written with exact, measurable values, structured to drop straight into a Tailwind + GSAP codebase.
2. **`CLAUDE_CODE_KICKOFF.md`** — a single, copy-ready prompt to paste into Claude Code to build the site production-ready.

## About the design files
The files in `reference-designs/` are **design references authored in HTML** — high-fidelity prototypes that demonstrate the intended look, motion, and behavior. **They are not production code to copy.** The task is to **recreate these designs in the confirmed target stack** (Next.js App Router + TypeScript + TailwindCSS + GSAP), using that environment's idioms and patterns. Measurements, colors, type, and motion values in `HANDOFF.md` are authoritative; the HTML is there to see the result those numbers produce.

> The reference HTML expects sibling `support.js` (included) plus an `uploads/` asset folder (**not** bundled — it holds source video/fonts/images). Open them against the live project to see them fully rendered, or read them as annotated source. Every asset is catalogued in §A8.

## Fidelity
**High-fidelity (hifi)** for the home page — final colors, typography, spacing, and interaction/motion choreography are all specified. Recreate it precisely.
**Brief-only** for About & Works — layout intent + which components/tokens/motion to reuse; the builder designs the specifics from §A9 within the established system.

## Confirmed stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** TailwindCSS — all tokens in §A2 expressed as `theme.extend`
- **Animation:** GSAP only — ScrollTrigger, ScrollSmoother, SplitText via `@gsap/react` `useGSAP()`. No Framer Motion.
- **Deferred (do NOT build in v1):** WebGL / 3D. The home page's living fluid-smoke background and its cursor-reactive curtain-wipe hero are a **WebGL feature deferred to a later pass** — v1 ships the flat-dark **minimal hero** (§A6). See Open Questions.
- **Hosting:** Vercel · **Content:** typed TS/MDX layer, no CMS
- **Motion a11y:** full experience by default; `prefers-reduced-motion` fallbacks only for opted-in visitors, authored inside `gsap.matchMedia()`.

## How to use this bundle
1. Read `HANDOFF.md` top to bottom — §A6 (page/section choreography) and §A7 (GSAP motion spec) are the heart of it.
2. Paste `CLAUDE_CODE_KICKOFF.md`'s fenced prompt into Claude Code to start the build.
3. Supply real content and imagery for the §A8 asset slots and the About/Works pages when ready.

## Files in this bundle
- `README.md` — this file
- `HANDOFF.md` — §A1–§A10 documentation + Open Questions
- `CLAUDE_CODE_KICKOFF.md` — the standalone Claude Code prompt
- `reference-designs/Adnaan Dasoo Site V3.dc.html` — designed home page (hifi reference)
- `reference-designs/About Adnaan Dasoo V3.dc.html` — early light-theme About scaffold (reference only; About is brief-only)
- `reference-designs/Works Adnaan Dasoo V3.dc.html` — early light-theme Works scaffold (reference only; Works is brief-only)
- `reference-designs/support.js` — runtime the reference HTML loads
