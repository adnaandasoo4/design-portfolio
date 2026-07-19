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
      className="relative z-(--z-section) flex h-screen flex-col bg-bg px-9 pt-[clamp(130px,22vh,255px)] max-b700:px-3"
    >
      {/* Raised panel — square corners, flush to the viewport bottom; the
          preloader's color frame expands into exactly this rect */}
      <div
        data-hero-panel=""
        className="relative flex min-h-0 flex-1 flex-col bg-raise-2"
      >
        {/* Content row — scroll cue centered along the bottom */}
        <div className="relative grid min-h-0 flex-1 grid-cols-2 max-b700:grid-cols-1">
          {/* LEFT — intro statements */}
          <div className="flex flex-col p-7 max-b700:p-5">
            <div
              data-hero-intro=""
              className="flex max-w-[38ch] flex-col gap-[0.8em] font-medium text-ink text-[clamp(21px,1.9vw,34px)] leading-[1.3] tracking-[-0.012em]"
            >
              {hero.intro.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          {/* RIGHT — reel top-right with hover cutoff bars */}
          <div className="flex flex-col p-7 max-b700:p-5">
            <div data-hero-intro="" className="flex justify-end">
              {/* group: on hover, panel-colored bars slide in from the LEFT
                  (top edge) and RIGHT (bottom edge) — stepped cutoff view */}
              <div className="group relative aspect-[16/10] w-[min(38vw,660px)] overflow-hidden rounded-(--radius-media) max-b700:w-full">
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
                  className="absolute top-0 left-0 h-[10%] w-[46%] -translate-x-full bg-raise-2 transition-transform duration-[0.45s] ease-(--ease-out-quart) group-hover:translate-x-0 motion-reduce:transition-none"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-0 bottom-0 h-[10%] w-[46%] translate-x-full bg-raise-2 transition-transform duration-[0.45s] ease-(--ease-out-quart) group-hover:translate-x-0 motion-reduce:transition-none"
                />
              </div>
            </div>
          </div>

          {/* Scroll cue — one line, centered at the bottom of the panel */}
          <span
            data-hero-intro=""
            className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[15px] leading-none font-normal tracking-[0.04em] text-muted-2"
          >
            {hero.scrollCue}
          </span>
        </div>

        {/* Giant name — HK Grotesk Wide, ON the panel; every glyph its own
            span, justify-between so the word spans the panel width at any
            viewport. Size is computed from the face's measured advance
            width ("ADNAAN DASOO" ≈ 9.1em in HKGW SemiBold, ÷9.25 for a 2%
            hinting margin), so the glyphs themselves fill the width and the
            justify slack stays sub-letter-spacing. */}
        <h1
          aria-label="Adnaan Dasoo"
          data-hero-intro=""
          className="flex items-end justify-between px-2 pt-1 font-hkgw font-semibold whitespace-nowrap text-ink uppercase select-none text-[clamp(38px,calc((100vw-88px)/9.25),260px)] leading-[0.94]"
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
