"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { DUR, EASE, MQ, SCROLL } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import BiLabel from "@/components/site/BiLabel";
import { hero } from "@/content/copy";

/*
 * Hero — §A6 #1, MINIMAL variant (v1). Flat #111214, 100vh, normal scroll —
 * no pin, no curtain-wipe (smoke variant is a deferred WebGL pass).
 *
 * Choreography (§A7):
 *  #6 Name parallax — scrubbed y = scrollY × −0.38, capped past 1.6 × vh.
 *  #3 Intro reveals — meta row + scroll cue rise from bottom after preload.
 * Reduced-motion branch: no parallax, intro elements shown instantly (the
 * markup renders visible by default; only the motion branch hides it first).
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const name = section.querySelector<HTMLElement>("[data-min-name]");
      const introEls = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll("[data-hero-intro]"),
      );

      const mm = gsap.matchMedia();

      /*
       * Default motion branch (§A7 rule): full design for everyone who has
       * not opted into reduced motion. Parallax stays on at mobile widths
       * too (§A6 #1b), so the only gate is the motion preference.
       */
      mm.add(MQ.motionOk, () => {
        // §A7 #6 — minimal-name parallax. Linear scrub over the hero's
        // scroll span: y reaches −(1.6·vh × 0.38) at end "+=160%", which is
        // equivalent to y = scrollY × −0.38 stopping past 1.6 × vh.
        if (name) {
          // will-change only while the parallax branch is live (§A10)
          gsap.set(name, { willChange: "transform" });
          gsap.to(name, {
            y: () =>
              SCROLL.heroNameCapVh * window.innerHeight * SCROLL.heroNameFactor,
            ease: EASE.none,
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=160%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }

        // §A7 #3 — intro reveals: meta row + scroll cue from bottom
        // (+32px, opacity 0→1), fired once the preloader hands off.
        // The name itself gets NO intro — the preloader's difference-blend
        // name lands exactly on it, so it must sit still from first paint.
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

        return () => {
          offPreloader();
          if (name) gsap.set(name, { clearProps: "will-change" });
        };
      });

      // Reduced-motion branch (§A7): intentionally empty — no parallax
      // transform, and the intro elements simply keep their default
      // (visible) styles, i.e. instant show.
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Hero"
      data-hero-v="minimal"
      className="relative z-(--z-section) flex h-screen items-center justify-center bg-bg"
    >
      {/* Dead-center stacked lowercase name — the page's single <h1>.
          The preloader's mix-blend name lands exactly here (seamless handoff),
          so it is visible from first paint with no intro animation. */}
      <div data-min-name className="relative z-(--z-hero-inner)">
        <h1 className="font-normal text-ink text-[clamp(32px,2.7vw,58px)]/[1.12] tracking-[-0.01em]">
          <span className="block">{hero.nameLines[0]}</span>
          <span className="ml-[1.15em] block">{hero.nameLines[1]}</span>
        </h1>
      </div>

      {/* Bottom-left meta — BiLabel at the 36px gutter */}
      <div data-hero-intro className="absolute bottom-6.5 left-9 z-(--z-hero-inner)">
        <BiLabel latin={hero.metaLatin} ja={hero.metaJa} />
      </div>

      {/* Bottom-right meta — two-line right-aligned location */}
      <p
        data-hero-intro
        className="absolute right-9 bottom-6.5 z-(--z-hero-inner) text-right text-[16px]/[1.4] font-normal text-text-50"
      >
        {hero.locationLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>

      {/* Center-bottom scroll cue — hidden ≤700px (§A6 #1b) */}
      <div
        data-hero-intro
        aria-hidden="true"
        className="absolute bottom-6.5 left-1/2 z-(--z-hero-inner) flex -translate-x-1/2 items-center gap-3 max-b700:hidden"
      >
        <span className="text-[18px]/[1.4] font-normal text-text-50">
          {hero.scrollCue}
        </span>
        {/* TODO(assets §A8): the reference arrow is a CSS-masked
            uploads/arrow-mask.png (ratio 349:541, height 26px, scaleX(-1)).
            The PNG is not bundled yet — this inline SVG down-curving arrow is
            a stand-in at the same box/transform; swap it for the masked PNG
            when assets land. */}
        <svg
          viewBox="0 0 349 541"
          className="h-6.5 w-auto -scale-x-100 text-text-50"
          fill="none"
          stroke="currentColor"
          strokeWidth={30}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M232 34 C244 214 208 376 118 496" />
          <path d="M64 420 L118 496 L212 462" />
        </svg>
      </div>
    </section>
  );
}
