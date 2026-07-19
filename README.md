# Design Portfolio

A scroll-driven portfolio for Adnaan Dasoo — designer × engineer, Baltimore MD.
Dark, near-black canvas; oversized restrained typography; scroll choreography
where the perceived quality of the motion *is* the portfolio.

## Stack

- **Next.js** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4** — all design tokens live in [`app/globals.css`](app/globals.css) `@theme`
- **GSAP** (ScrollTrigger · ScrollSmoother · SplitText) via `@gsap/react` — registered once in [`lib/gsap/register.ts`](lib/gsap/register.ts)
- Typed TS content layer in [`content/`](content/) — no CMS
- Hosting target: Vercel

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Structure

```
app/                  routes (/, /about, /works) + globals.css tokens
components/
  site/               chrome shared across pages (Nav, Footer, Preloader, …)
  sections/           home-page sections (Hero, About, Divider, WorkList, …)
  about/, works/      per-page sections
content/              typed copy + project data (single source of truth)
lib/gsap/             plugin registration, ScrollSmoother provider, motion tokens
lib/preloader.ts      preloader → intro-reveal contract
public/assets/        labeled placeholder media (real art pending)
design_handoff_portfolio/   design spec bundle (removed at launch)
```

## Conventions

- Import GSAP **only** from `@/lib/gsap/register`; every effect lives in a
  scoped `useGSAP` with cleanup, authored inside `gsap.matchMedia()` — the
  default branch is the full motion design, `prefers-reduced-motion: reduce`
  is a separate instant/opacity-only branch.
- Animate only `transform` / `opacity` / `clip-path`.
- No shadows, no new colors — depth comes from the near-black value ladder
  and motion parallax. Semantic tokens only.
- Media slots are labeled placeholders at exact ratios; swap files in
  `public/assets/` without touching layout.
