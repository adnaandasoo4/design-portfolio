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
 *   2. a mono eyebrow, sentence case (user, 2026-09-02) — its tracking
 *      came in from 0.1em with the capitals, which needed the air that
 *      lowercase does not;
 *   3. the masthead headline (the page's single <h1>, §A10) with the
 *      paragraph BOTTOM-aligned to its last line — `items-end` is doing
 *      that, not a hand-tuned offset, so it holds at every width.
 *
 * Eyebrow and paragraph are the page's secondary tier: both grey
 * (--color-muted-2) against the white headline, both in the mono face, and
 * both on the shared --text-meta size the showreel caption also uses — one
 * tier in size AND family, so the three cannot drift apart. The paragraph's
 * column widened a step with the switch, since mono sets roughly a fifth
 * wider per character than Manrope at the same size.
 *
 * The masthead is font-bold (700), which the browser SYNTHESISES — only
 * Regular (400) and SemiBold (600) cuts of HK Grotesk Wide are in
 * app/fonts/. Chosen knowingly (user, 2026-09-02) to get the reference's
 * weight now; drop a real Bold OTF in and this becomes a true cut with no
 * other change.
 *
 * Bottom padding is the nav's own top gutter (20px, 16px on phones), so the
 * statement sits as far off the bottom edge as the nav sits off the top —
 * the two margins are deliberately the same number. Nothing else may live
 * in the bottom-right corner at that depth, which is why the theme toggle
 * moved up into the nav. Below 860px the paragraph stacks under the
 * headline instead of beside it.
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
      className="relative z-(--z-section) flex h-svh flex-col bg-bg px-5 pt-[92px] pb-5 max-b700:px-4 max-b700:pt-[76px] max-b700:pb-4"
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
          className="font-mono-ui text-meta/[1.6] tracking-[0.02em] text-muted-2"
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
            className="font-hkgw text-[clamp(34px,4.9vw,86px)]/[0.88] font-bold tracking-[-0.02em] text-ink uppercase max-b700:text-[6.2vw]"
          >
            {hero.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p
            data-hero-intro=""
            className="w-[clamp(250px,26vw,360px)] shrink-0 pb-[0.4em] font-mono-ui text-meta/[1.6] text-muted-2 max-b860:w-full max-b860:max-w-[440px] max-b860:pb-0"
          >
            {hero.paragraph}
          </p>
        </div>
      </div>
    </section>
  );
}
