"use client";

/*
 * Hero — centred showreel over a bottom-anchored statement block
 * (user-directed, 2026-09-02; reference = ethansuero.com). Replaces the
 * full-bleed WebGL gradient layout: the section is now flat --color-bg in
 * both themes, and the gradient survives only in the footer band.
 *
 * LAYOUT, top to bottom:
 *   1. the reel, centred in whatever height is left between the fixed nav
 *      and the statement block — which lands it slightly ABOVE the vertical
 *      centre of the viewport, as in the reference;
 *   2. a mono eyebrow;
 *   3. the masthead headline (the page's single <h1>, §A10) with the
 *      paragraph BOTTOM-aligned to its last line — `items-end` is doing
 *      that, not a hand-tuned offset, so it holds at every width.
 *
 * Bottom padding clears the fixed theme toggle in the bottom-right gutter;
 * below 860px the paragraph stacks under the headline instead of beside it.
 * Below 700px the headline drops off the clamp onto a pure vw size — the
 * clamp's 34px floor is wider than a phone can hold at this face's set
 * width, and the authored line breaks would start wrapping a second time.
 *
 * Reveal: the preloader expands its off-black layer to the full viewport,
 * then markPreloaderDone fires and the [data-hero-intro] blocks rise in
 * (y 32→0, .85 out-quart, .06 stagger). Reduced motion: the markup renders
 * visible statically — the branch is intentionally empty.
 */

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import { hero } from "@/content/copy";
import Showreel from "@/components/sections/Showreel";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const introEls = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll("[data-hero-intro]"),
      );

      const mm = gsap.matchMedia();

      // §A7 #3 intro reveals: from-bottom +32px → 0, `.85 ease-out-quart`,
      // stagger `.06` — fired when the preloader's expand completes.
      mm.add(MQ.motionOk, () => {
        gsap.set(introEls, { y: 32, autoAlpha: 0 });
        const offPreloader = onPreloaderDone(() => {
          gsap.to(introEls, {
            y: 0,
            autoAlpha: 1,
            duration: DUR.intro,
            ease: EASE.outQuart,
            stagger: 0.06,
          });
        });
        return () => offPreloader();
      });

      // Reduced-motion branch: intentionally empty — the markup renders
      // visible by default, i.e. instant show.
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Hero"
      className="relative z-(--z-section) flex h-svh flex-col bg-bg px-5 pt-[92px] pb-[clamp(80px,10vh,108px)] max-b700:px-4 max-b700:pt-[76px]"
    >
      {/* Reel — centred in the space the statement block leaves over */}
      <div
        data-hero-intro=""
        className="flex flex-1 items-center justify-center"
      >
        <Showreel />
      </div>

      {/* Statement block — anchored to the bottom of the viewport */}
      <div className="shrink-0">
        <p
          data-hero-intro=""
          className="font-mono-ui text-[clamp(10px,0.78vw,11px)]/[1.6] tracking-[0.1em] text-muted-2 uppercase"
        >
          {hero.eyebrow.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        <div className="mt-[clamp(16px,2.4vh,30px)] flex items-end justify-between gap-[clamp(24px,5vw,90px)] max-b860:flex-col max-b860:items-start max-b860:gap-7">
          <h1
            data-hero-intro=""
            className="font-hkgw text-[clamp(34px,4.9vw,86px)]/[0.88] font-semibold tracking-[-0.02em] text-ink uppercase max-b700:text-[6.2vw]"
          >
            {hero.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p
            data-hero-intro=""
            className="w-[clamp(240px,25vw,340px)] shrink-0 pb-[0.4em] text-[clamp(14px,1.2vw,17px)]/[1.5] text-ink-1 max-b860:w-full max-b860:max-w-[440px] max-b860:pb-0"
          >
            {hero.paragraph}
          </p>
        </div>
      </div>
    </section>
  );
}
