"use client";

/*
 * Works header (§A9 Works brief #1) — the page-title moment.
 * Eyebrow row: works.headerEyebrow (latin + ja) left · works.count right,
 * in the 13px micro-label register; below it an oversized lowercase "works"
 * set in the work-row typographic register (Manrope 500, −0.02em).
 *
 * Motion (§A7 vocabulary only): intro reveal on load via onPreloaderDone
 * (fires immediately here — no preloader on this route). Title is SplitText
 * by chars (after document.fonts.ready, revert() on cleanup) rising with
 * ease-out-quart; eyebrow row rises +24px alongside. Elements are hidden
 * ONLY inside the motion-ok branch — reduced-motion users see the static,
 * fully-visible markup instantly.
 */

import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import { works } from "@/content/works";

export default function WorksHeader() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const eyebrow = root.querySelector<HTMLElement>("[data-wh-eyebrow]");
      const title = root.querySelector<HTMLElement>("[data-wh-title]");

      const mm = gsap.matchMedia();

      // Default branch = the full motion design (§A7 rule).
      mm.add(MQ.motionOk, (ctx) => {
        let split: SplitText | null = null;
        let cancelled = false;

        // Hide only here — never in the reduced branch / static markup.
        if (eyebrow) gsap.set(eyebrow, { y: 24, autoAlpha: 0 });
        if (title) gsap.set(title, { autoAlpha: 0 });

        const offPreloader = onPreloaderDone(() => {
          // Split only after fonts are ready to avoid re-split reflow (§A7).
          document.fonts.ready.then(() => {
            if (cancelled) return;
            // ctx.add scopes the late-created tweens to this branch.
            ctx.add(() => {
              const tl = gsap.timeline({
                defaults: { ease: EASE.outQuart, duration: DUR.intro },
              });
              if (title) {
                split = SplitText.create(title, { type: "chars" });
                gsap.set(title, { autoAlpha: 1 });
                tl.from(
                  split.chars,
                  { yPercent: 60, autoAlpha: 0, stagger: 0.035 },
                  0,
                );
              }
              if (eyebrow) tl.to(eyebrow, { y: 0, autoAlpha: 1 }, 0.12);
            });
          });
        });

        return () => {
          cancelled = true;
          offPreloader();
          split?.revert();
          split = null;
        };
      });

      // Reduced-motion branch (§A7): intentionally empty — the markup renders
      // visible by default, i.e. instant show. Never leave content hidden.
    },
    { scope: rootRef },
  );

  return (
    <header
      ref={rootRef}
      className="px-9 pt-[clamp(130px,18vh,210px)] pb-[clamp(30px,5vh,58px)] max-b700:px-5.5"
    >
      {/* Eyebrow row — micro-label register (13px, wide tracking) */}
      <p
        data-wh-eyebrow
        className="flex items-baseline justify-between gap-4"
      >
        <span className="flex items-baseline gap-3.5">
          <span className="text-[13px]/[1] font-normal tracking-[0.14em] text-muted-2">
            {works.headerEyebrow.latin}
          </span>
          <span
            lang="ja"
            className="font-ja text-[13px]/[1] font-normal tracking-[0.14em] text-text-38"
          >
            {works.headerEyebrow.ja}
          </span>
        </span>
        <span className="shrink-0 font-mono-ui text-[13px]/[1] font-medium tracking-[0.08em] text-muted-2">
          {works.count}
        </span>
      </p>

      {/* Oversized lowercase page title — work-row register, scaled up to a
          title moment. Single <h1> of the page (§A10). overflow-clip guards
          the char reveal without spilling the gutter. */}
      <div className="overflow-clip">
        <h1
          data-wh-title
          className="pt-[clamp(20px,4vh,44px)] font-medium text-ink text-[clamp(58px,12vw,200px)]/[0.95] tracking-[-0.02em]"
        >
          works
        </h1>
      </div>
    </header>
  );
}
