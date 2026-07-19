"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import BiLabel from "@/components/site/BiLabel";
import { hero } from "@/content/copy";

/*
 * Hero — panel layout (user-directed redesign, 2026-07-19; replaces the
 * §A6 #1 minimal centered-name variant).
 *
 * One viewport: a raised #1d1d21 panel (the dark equivalent of the
 * reference's white box) holding the intro text + autoplaying showreel,
 * with the giant "ADNAAN DASOO" spanned edge-to-edge beneath it.
 *
 * The preloader's pill clip-expands INTO this panel's exact rect
 * ([data-hero-panel] is the measurement target), then the inner elements
 * ([data-hero-intro]) rise in on markPreloaderDone. Reduced motion: all
 * content visible statically; the reel holds its first frame.
 *
 * The showreel mask: a staircase clip-path — the top-left and
 * bottom-right corner strips are cut away (union-of-two-offset-rects
 * silhouette from the reference).
 */

/** Staircase mask — % steps tuned to the reference (~48% wide, ~8% deep) */
const REEL_CLIP =
  "polygon(0 8%, 46% 8%, 46% 0, 100% 0, 100% 92%, 54% 92%, 54% 100%, 0 100%)";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reelRef = useRef<HTMLVideoElement>(null);

  // Autoplay the reel muted-on-loop only for motion-ok visitors; reduced
  // motion keeps the first frame as a still (§A10).
  useEffect(() => {
    if (window.matchMedia(MQ.reduced).matches) return;
    reelRef.current?.play().catch(() => {
      /* autoplay blocked — first frame remains */
    });
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const introEls = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll("[data-hero-intro]"),
      );

      const mm = gsap.matchMedia();

      // Default motion branch: elements rise in over the panel once the
      // preloader's pill has expanded into it (§ preloader handoff).
      mm.add(MQ.motionOk, () => {
        gsap.set(introEls, { y: 24, autoAlpha: 0 });
        const offPreloader = onPreloaderDone(() => {
          gsap.to(introEls, {
            y: 0,
            autoAlpha: 1,
            duration: DUR.intro,
            ease: EASE.outQuart,
            stagger: 0.08,
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
      className="relative z-(--z-section) flex h-screen flex-col bg-bg px-9 pt-[clamp(84px,13vh,150px)] max-b700:px-3"
    >
      {/* Raised panel — the preloader pill expands into exactly this rect */}
      <div
        data-hero-panel=""
        className="relative grid min-h-0 flex-1 grid-cols-2 overflow-hidden rounded-(--radius-media) bg-raise-2 max-b700:grid-cols-1"
      >
        {/* LEFT — eyebrow + intro statements + scroll cue */}
        <div className="flex flex-col p-7 max-b700:p-5">
          <div data-hero-intro="">
            <BiLabel latin={hero.metaLatin} ja={hero.metaJa} />
          </div>

          <div
            data-hero-intro=""
            className="mt-9 flex max-w-[24ch] flex-col gap-[0.9em] font-medium text-ink text-[clamp(20px,1.75vw,30px)] leading-[1.3] tracking-[-0.012em]"
          >
            {hero.intro.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {/* Scroll cue — bottom-left of the panel, like the reference */}
          <div
            data-hero-intro=""
            className="mt-auto text-[12px] leading-[1.5] font-normal tracking-[0.06em] text-muted-2 uppercase"
          >
            <span className="block">{hero.scrollCue}</span>
            <span className="block">{hero.scrollCueSub}</span>
          </div>
        </div>

        {/* RIGHT — showreel label + masked autoplaying reel */}
        <div className="relative flex flex-col border-l border-line-055 p-7 max-b700:border-t max-b700:border-l-0 max-b700:p-5">
          <span
            data-hero-intro=""
            className="text-[12px] leading-none font-normal tracking-[0.06em] text-ink-2 uppercase"
          >
            {hero.showreelLabel}
          </span>

          <div data-hero-intro="" className="mt-6 flex justify-end pr-2">
            {/* Staircase-masked reel — no controls, no timestamp */}
            <video
              ref={reelRef}
              src={hero.showreelSrc}
              muted
              loop
              playsInline
              preload="auto"
              className="aspect-[16/10] w-[min(32vw,560px)] bg-slot-2 object-cover max-b700:w-full"
              style={{ clipPath: REEL_CLIP }}
            />
          </div>
        </div>
      </div>

      {/* Giant name — every glyph its own span, justify-between so the word
          spans the full gutter width at any viewport (the h1 keeps a clean
          accessible name; glyphs are presentational) */}
      <h1
        aria-label="Adnaan Dasoo"
        data-hero-intro=""
        className="flex items-end justify-between pt-2 pb-1 font-semibold whitespace-nowrap text-ink select-none text-[clamp(40px,10.8vw,230px)] leading-[0.8] tracking-[-0.01em]"
      >
        {hero.giantName.split("").map((ch, i) => (
          <span key={`${ch}-${i}`} aria-hidden="true">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </h1>
    </section>
  );
}
