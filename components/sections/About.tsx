"use client";

/*
 * About — §A6 #2 (minimal-hero build = NO pin).
 * Mission blurb in a full-width padded block right after the hero; SplitText
 * word fill (§A7 #7): each word transitions text-24 → #ffffff one-by-one,
 * driven by a scrubbed ScrollTrigger. Reduced-motion: all words white, no scrub.
 */

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, SplitText } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";
import { aboutBlurb } from "@/content/copy";

/** Unfilled word ink — text-24 token (§A2 alpha inks) */
const WORD_DIM = "rgba(255,255,255,0.24)";
/** Filled word ink */
const WORD_FILL = "#ffffff";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const blurbRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const blurb = blurbRef.current;
      if (!blurb) return;

      let split: SplitText | null = null;
      let trigger: ScrollTrigger | null = null;
      let cancelled = false;

      const mm = gsap.matchMedia();

      // Split only AFTER fonts are ready to avoid re-split reflow (§A7).
      document.fonts.ready.then(() => {
        if (cancelled) return;

        split = SplitText.create(blurb, { type: "words" });
        const words = split.words as HTMLElement[];

        for (const word of words) {
          // micro .22 color transition per word (§A2 dur-micro / ease-std)
          word.style.transition = "color 0.22s ease";
          word.style.color = WORD_DIM;
        }

        // Only touch words in the changed range — avoids redundant style
        // writes to every word on every scroll frame (§A10 perf).
        let prevN = 0;
        const setFill = (progress: number) => {
          const n = Math.round(progress * words.length);
          if (n === prevN) return;
          const lo = Math.min(prevN, n);
          const hi = Math.max(prevN, n);
          for (let i = lo; i < hi; i++) {
            words[i].style.color = i < n ? WORD_FILL : WORD_DIM;
          }
          prevN = n;
        };

        // Default branch = full motion design; scrubbed word fill.
        mm.add(MQ.motionOk, () => {
          trigger = ScrollTrigger.create({
            trigger: blurb,
            start: "top 88%",
            end: "+=60%", // 60% of viewport height past start
            scrub: true,
            onUpdate: (self) => setFill(self.progress),
          });
          setFill(trigger.progress); // sync if mounted mid-scroll

          return () => {
            trigger?.kill();
            trigger = null;
          };
        });

        // Opted-in fallback: no scrub — readable immediately (§A10).
        mm.add(MQ.reduced, () => {
          setFill(1);
        });
      });

      return () => {
        cancelled = true;
        trigger?.kill();
        split?.revert();
        mm.revert();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="About"
      className="relative z-(--z-about) bg-bg px-9 py-[clamp(110px,16vh,200px)] max-b700:px-5.5 max-b700:py-22.5"
    >
      <p
        ref={blurbRef}
        className="font-medium text-[clamp(28px,3.9vw,62px)] leading-[1.2] tracking-[-0.016em] text-text-24 text-pretty"
      >
        {aboutBlurb}
      </p>
    </section>
  );
}
