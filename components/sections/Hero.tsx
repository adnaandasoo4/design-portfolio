"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import { hero } from "@/content/copy";
import FooterGradient from "@/components/site/FooterGradient";

/*
 * Hero — full-bleed gradient layout (user-directed, 2026-07-20; pared down
 * from the pill experiment).
 *
 * The footer's WebGL gradient spans the ENTIRE section as a dimmed
 * background layer (wrapper opacity ~40% so it reads as atmosphere, not
 * artwork; FooterGradient self-gates its rAF loop via IntersectionObserver
 * on the canvas — no [data-band-clip] ancestor here). Above it: only the
 * small "let's collaborate" CTA top-right (the fixed nav hides its own CTA
 * at the top of the page — see Nav.tsx), and the reduced-scale name at the
 * BOTTOM of the section — the two WORDS spread edge-to-edge, letters at
 * natural tracking.
 *
 * Reveal: the preloader expands its off-black layer to the full viewport,
 * then markPreloaderDone fires and the [data-hero-intro] blocks rise in
 * (y 32→0, autoAlpha, .85 out-quart, .06 stagger). The gradient layer is
 * NOT an intro block — it simply sits there as the stage fades, reading as
 * the page background. Reduced motion: markup renders visible statically.
 */

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
      className="relative z-(--z-section) flex h-screen flex-col bg-bg px-9 pt-4 pb-5 max-b700:h-svh max-b700:px-3"
    >
      {/* FULL-BLEED GRADIENT — dimmed ambient background across the whole
          section: half-speed flow, hold-to-distort active, but no cursor
          pill and no pointer cursor */}
      <div aria-hidden="true" className="absolute inset-0 opacity-40">
        <FooterGradient speed={0.5} pill={false} />
      </div>
      {/* CENTER STATEMENT — dead-center over the gradient */}
      <div
        data-hero-intro=""
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center font-medium text-ink text-[clamp(15px,1.25vw,20px)]/[1.45] tracking-[-0.008em] max-b700:px-6"
      >
        {hero.statement.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      {/* NAME — bottom of the section; the two WORDS spread edge-to-edge,
          letters at natural tracking */}
      <h1
        aria-label="Adnaan Dasoo"
        data-hero-intro=""
        className="relative mt-auto flex items-end justify-between px-2 font-hkgw font-semibold whitespace-nowrap text-ink uppercase select-none text-[clamp(38px,calc((100vw-88px)/13.5),170px)] leading-[0.94] max-b700:text-[clamp(24px,calc((100vw-40px)/9.6),38px)]"
      >
        {hero.giantName.split(" ").map((word) => (
          <span key={word}>{word}</span>
        ))}
      </h1>
    </section>
  );
}
