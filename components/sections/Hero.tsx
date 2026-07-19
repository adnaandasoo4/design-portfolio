"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import { hero } from "@/content/copy";

/*
 * Hero — panel layout (user-directed redesign, 2026-07-19).
 *
 * One viewport: a raised #1d1d21 panel — square-cornered, running from
 * below the nav all the way to the bottom of the page — holding the intro
 * statements + autoplaying showreel, then a full-width hairline, then the
 * giant HK Grotesk Wide "ADNAAN DASOO" ON the panel, spanned across.
 *
 * The preloader's color frame clip-expands INTO this panel's exact rect
 * ([data-hero-panel] is the measurement target), then the inner elements
 * ([data-hero-intro]) rise in on markPreloaderDone. Reduced motion: all
 * content visible statically; the reel holds its first frame.
 *
 * Showreel hover: two panel-colored bars slide in over the video's top-left
 * and bottom-right edges, recreating the reference's stepped cutoff view.
 */
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
      // preloader's color frame has expanded into it (§ preloader handoff).
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
      className="relative z-(--z-section) flex h-screen flex-col bg-bg px-9 pt-[clamp(100px,17vh,200px)] max-b700:px-3"
    >
      {/* Raised panel — square corners, flush to the viewport bottom; the
          preloader's color frame expands into exactly this rect */}
      <div
        data-hero-panel=""
        className="relative flex min-h-0 flex-1 flex-col bg-raise-2"
      >
        {/* Content row */}
        <div className="grid min-h-0 flex-1 grid-cols-2 max-b700:grid-cols-1">
          {/* LEFT — intro statements + scroll cue */}
          <div className="flex flex-col p-7 max-b700:p-5">
            <div
              data-hero-intro=""
              className="flex max-w-[38ch] flex-col gap-[0.8em] font-medium text-ink text-[clamp(18px,1.55vw,27px)] leading-[1.35] tracking-[-0.01em]"
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

          {/* RIGHT — showreel label + reel with hover cutoff bars */}
          <div className="relative flex flex-col border-l border-line-055 p-7 max-b700:border-t max-b700:border-l-0 max-b700:p-5">
            <span
              data-hero-intro=""
              className="text-[12px] leading-none font-normal tracking-[0.06em] text-ink-2 uppercase"
            >
              {hero.showreelLabel}
            </span>

            <div data-hero-intro="" className="mt-6 flex justify-end pr-2">
              {/* group: on hover, panel-colored bars slide in over the
                  top-left and bottom-right edges (stepped cutoff view) */}
              <div className="group relative aspect-[16/10] w-[min(32vw,560px)] overflow-hidden max-b700:w-full">
                <video
                  ref={reelRef}
                  src={hero.showreelSrc}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full bg-slot-2 object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 h-[10%] w-[46%] -translate-y-full bg-raise-2 transition-transform duration-[0.45s] ease-(--ease-out-quart) group-hover:translate-y-0 motion-reduce:transition-none"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-0 bottom-0 h-[10%] w-[46%] translate-y-full bg-raise-2 transition-transform duration-[0.45s] ease-(--ease-out-quart) group-hover:translate-y-0 motion-reduce:transition-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line break above the name (reference) */}
        <div aria-hidden="true" className="h-px w-full bg-line-09" />

        {/* Giant name — HK Grotesk Wide, ON the panel; every glyph its own
            span, justify-between so the word spans the panel width at any
            viewport (the h1 keeps a clean accessible name) */}
        <h1
          aria-label="Adnaan Dasoo"
          data-hero-intro=""
          className="flex items-end justify-between px-4 pt-1 font-hkgw font-semibold whitespace-nowrap text-ink uppercase select-none text-[clamp(34px,8.6vw,185px)] leading-[0.94]"
        >
          {hero.giantName.split("").map((ch, i) => (
            <span key={`${ch}-${i}`} aria-hidden="true">
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h1>
      </div>
    </section>
  );
}
