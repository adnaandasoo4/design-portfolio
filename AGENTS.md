<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project rules

Authoritative design spec: `design_handoff_portfolio/HANDOFF.md` (§A1–§A10).
Exact values there (colors, type, spacing, motion) are non-negotiable — do not
invent visual direction where the docs specify values. The bundle is removed
at launch; until then it is the reference for every pixel decision.

## Hard conventions

- **Tokens**: Tailwind v4 CSS-first — every color/radius/ease/duration is a
  semantic token in `app/globals.css` `@theme`. Never hardcode a hex that has
  a token. No shadows anywhere.
- **GSAP**: import only from `@/lib/gsap/register` (single registration).
  Every effect: scoped `useGSAP` + cleanup, inside `gsap.matchMedia()` —
  default branch = full motion, `(prefers-reduced-motion: reduce)` branch =
  instant/opacity-only fallback that never hides content. SplitText only
  after `document.fonts.ready`, always `revert()` on cleanup. Animate only
  `transform` / `opacity` / `clip-path`.
- **Copy**: all user-facing strings live in `content/*.ts` — verbatim from
  the handoff; components never inline copy.
- **Fixed chrome** (Nav, Preloader, RouteVeil) renders from `app/layout.tsx`
  OUTSIDE `<SmoothScroll>` — `position: fixed` breaks inside the transformed
  `#smooth-content`.
- **Deferred — do not build**: WebGL fluid-smoke background, smoke-reel hero
  variant, case-study detail pages.
- Quality gate before any commit: `npx tsc --noEmit` + `npx eslint .` +
  `npm run build` all clean.
