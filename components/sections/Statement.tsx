"use client";

/*
 * Statement (§A5 Statement block, §A6 #6, §A7 row #13).
 * Giant 24vw "CONTACT" split into two viewport-cropped halves (13.5vw top /
 * 8.5vw bottom) around a white bar of justified mono micro-caps. On scroll the
 * halves are mis-sized while the section enters and resolve into perfect
 * alignment (scale 1) as the section reaches the top of the viewport.
 */
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap/register";
import { MQ, SCROLL } from "@/lib/gsap/motion";
import { statement } from "@/content/copy";

/* Giant decorative word — shared type; centered via `transform` (not the
   standalone CSS `translate` property) so GSAP's transform writes compose
   predictably with it. */
const wordClass =
  "absolute left-1/2 [transform:translateX(-50%)] whitespace-nowrap font-manrope font-normal text-[24vw] leading-[0.94] tracking-[-0.015em] text-ink";

const barWordClass =
  "whitespace-nowrap font-mono-ui font-medium text-[11px] leading-none tracking-[0.08em] text-bg max-b700:text-[8px] max-b700:tracking-[0.04em]";

export default function Statement() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const topWord = section.querySelector<HTMLElement>(
        '[data-ct-half="top"] [data-ct-word]',
      );
      const bottomWord = section.querySelector<HTMLElement>(
        '[data-ct-half="bottom"] [data-ct-word]',
      );
      if (!topWord || !bottomWord) return;

      const mm = gsap.matchMedia();

      // Default branch — full motion design (§A7 rule).
      mm.add(MQ.motionOk, () => {
        // Normalize the CSS translateX(-50%) into GSAP's transform state
        // (x:0 clears the px value parsed from the computed matrix; xPercent
        // keeps centering resize-safe).
        gsap.set(topWord, { x: 0, xPercent: -50, transformOrigin: "50% 0%" });
        gsap.set(bottomWord, {
          x: 0,
          xPercent: -50,
          transformOrigin: "50% 100%",
        });

        const setTop = gsap.quickSetter(topWord, "scale");
        const setBottom = gsap.quickSetter(bottomWord, "scale");

        // p = 1 − progress ≡ clamp(sectionTop/vh, 0..1): p=1 while the section
        // is entering (halves mis-sized, +20%), p=0 when its top reaches the
        // top of the viewport (both resolve to aligned scale 1).
        const apply = (self: ScrollTrigger) => {
          const p = 1 - self.progress;
          setTop(1 + SCROLL.statementScaleAmt * p);
          setBottom(
            1 + SCROLL.statementScaleAmt * p ** SCROLL.statementBottomExp,
          );
        };

        const st = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: true,
          onUpdate: apply,
          onRefresh: apply,
        });
        return () => st.kill();
      });

      // Reduced-motion branch — aligned/static (§A7 #13 fallback).
      mm.add(MQ.reduced, () => {
        gsap.set([topWord, bottomWord], { x: 0, xPercent: -50, scale: 1 });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="statement"
      aria-label="Statement"
      ref={sectionRef}
      className="relative z-(--z-section) overflow-hidden bg-bg pt-[clamp(70px,10vh,130px)]"
    >
      <h2 className="sr-only">Contact</h2>

      {/* Top crop — 13.5vw of the 24vw word (decorative, duplicated type) */}
      <div
        aria-hidden="true"
        data-ct-half="top"
        className="relative h-[13.5vw] overflow-hidden"
      >
        <span data-ct-word className={`${wordClass} top-0 origin-top`}>
          {statement.word}
        </span>
      </div>

      {/* White bar — two justified rows; every word its own span. The
          word-per-span layout reads choppily (or runs together) in AT, so
          the visual rows are aria-hidden and an sr-only element carries the
          full sentences (§A10 / WCAG 1.3.1). */}
      <div
        data-ct-bar
        className="relative z-2 flex flex-col gap-[5px] bg-white px-9 pt-[9px] pb-2.5"
      >
        <p className="sr-only">
          {statement.barRows.map((row) => row.join(" ")).join(" ")}
        </p>
        {statement.barRows.map((row, r) => (
          <div
            key={r}
            aria-hidden="true"
            className="flex items-baseline justify-between gap-3"
          >
            {row.map((word, i) => (
              <span key={`${r}-${i}`} className={barWordClass}>
                {word}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom crop — 8.5vw of the word, anchored to its bottom edge */}
      <div
        aria-hidden="true"
        data-ct-half="bottom"
        className="relative h-[8.5vw] overflow-hidden"
      >
        <span data-ct-word className={`${wordClass} bottom-0 origin-bottom`}>
          {statement.word}
        </span>
      </div>
    </section>
  );
}
