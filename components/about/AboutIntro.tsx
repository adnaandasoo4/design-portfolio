"use client";

/*
 * About — Intro (§A9 About brief, section 1). The oversized opening statement
 * is the page's h1 moment: a SplitText LINE reveal on load — signature motion
 * moment #1. Fired through onPreloaderDone (no preloader on this route, so it
 * resolves immediately), .85s ease-out-quart, small stagger, eyebrow first.
 *
 * Reduced-motion: the markup is visible by default and only the matchMedia
 * motion branch hides it before revealing — opted-in users get instant text.
 */

import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import BiLabel from "@/components/site/BiLabel";
import { about } from "@/content/about";

export default function AboutIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const heading = headingRef.current;
      const eyebrow = eyebrowRef.current;
      if (!heading || !eyebrow) return;

      const mm = gsap.matchMedia();

      // Default branch = full motion design (§A7 rule).
      mm.add(MQ.motionOk, (ctx) => {
        let split: SplitText | null = null;
        let offPreloader: (() => void) | null = null;
        let cancelled = false;

        // Hide only inside the motion branch — a reveal always follows.
        gsap.set(eyebrow, { y: 24, autoAlpha: 0 });
        gsap.set(heading, { autoAlpha: 0 });

        // Split only AFTER fonts are ready to avoid re-split reflow (§A7).
        document.fonts.ready.then(() => {
          if (cancelled) return;
          // ctx.add scopes the late work to this matchMedia branch.
          ctx.add(() => {
            split = SplitText.create(heading, { type: "lines" });
            gsap.set(split.lines, { y: 32, autoAlpha: 0 });
            gsap.set(heading, { autoAlpha: 1 });

            offPreloader = onPreloaderDone(() => {
              gsap.to([eyebrow, ...(split ? split.lines : [])], {
                y: 0,
                autoAlpha: 1,
                duration: DUR.intro,
                ease: EASE.outQuart,
                stagger: 0.07,
              });
            });
          });
        });

        return () => {
          cancelled = true;
          offPreloader?.();
          split?.revert();
          split = null;
        };
      });

      // Reduced branch: intentionally empty — default styles are visible.
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      className="relative z-(--z-section) bg-bg px-9 pt-[clamp(150px,24vh,280px)] pb-[clamp(100px,16vh,200px)] max-b700:px-5.5 max-b700:pt-32.5 max-b700:pb-22.5"
    >
      {/* Eyebrow — recurring BiLabel micro-system (§A3) */}
      <div ref={eyebrowRef}>
        <BiLabel latin={about.eyebrow.latin} ja={about.eyebrow.ja} />
      </div>

      {/* Oversized opening statement — the page's single h1 (§A10) */}
      <h1
        ref={headingRef}
        className="mt-[clamp(30px,5vh,58px)] max-w-[24ch] font-medium text-[clamp(34px,4.6vw,84px)] leading-[1.1] tracking-[-0.02em] text-ink text-pretty"
      >
        {about.opening}
      </h1>
    </section>
  );
}
