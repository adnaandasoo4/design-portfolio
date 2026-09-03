"use client";

/*
 * Opening — a full viewport, and mostly empty on purpose.
 *
 * A bilingual label row across the top, then air, then the headline pinned
 * to the bottom edge. The emptiness between them is the point: it is the
 * same move the home hero makes, so arriving here reads as the same site,
 * and it gives the headline somewhere to arrive FROM.
 *
 * This is the page's one signature motion moment — the headline splits into
 * lines and rises through a mask, once, on load. Everything after it uses
 * the site's ordinary reveal. One set piece reads as intent; five read as a
 * template with the animations turned up.
 *
 * SplitText runs only after document.fonts.ready (§A7): split against the
 * fallback face and the lines break in the wrong places, then the real face
 * loads and the mask is clipping rows that no longer exist.
 */
import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { about } from "@/content/about";

export default function AboutOpening() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;
      const headline = el.querySelector<HTMLElement>("[data-about-headline]");
      const label = el.querySelector<HTMLElement>("[data-about-label]");
      const mm = gsap.matchMedia();

      mm.add(MQ.motionOk, () => {
        if (label) {
          gsap.set(label, { autoAlpha: 0, y: 14 });
          gsap.to(label, {
            autoAlpha: 1,
            y: 0,
            duration: DUR.intro,
            ease: EASE.outQuart,
            delay: 0.1,
          });
        }

        let split: SplitText | null = null;
        let tween: gsap.core.Tween | null = null;
        let cancelled = false;

        document.fonts.ready.then(() => {
          if (cancelled || !headline) return;
          // linesClass gives each line its own clipping box, so the rise
          // reads as the type emerging from an edge rather than sliding.
          split = new SplitText(headline, {
            type: "lines",
            linesClass: "overflow-hidden",
          });
          tween = gsap.from(split.lines, {
            yPercent: 108,
            duration: DUR.intro,
            ease: EASE.outQuart,
            stagger: 0.08,
            delay: 0.16,
          });
        });

        return () => {
          // The split resolves after this callback returns, so its tween is
          // outside useGSAP's automatic cleanup and is killed by hand.
          cancelled = true;
          tween?.kill();
          split?.revert();
        };
      });

      // Reduced motion: intentionally empty — the markup renders visible.

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      aria-label="About"
      className="relative flex h-svh flex-col bg-bg px-5 pt-[92px] pb-[clamp(36px,6vh,84px)] max-b700:px-4 max-b700:pt-[76px]"
    >
      <div
        data-about-label=""
        className="flex items-start justify-between gap-6 font-manrope text-meta leading-none text-muted-2"
      >
        <p>{about.eyebrow.latin}</p>
        <p lang="ja" className="font-ja tracking-[0.14em]">
          {about.eyebrow.ja}
        </p>
      </div>

      {/* mt-auto is what holds the headline to the floor, so the air above
          it grows with the viewport instead of being a fixed gap. */}
      <h1
        data-about-headline=""
        className="mt-auto font-hkgw text-[clamp(32px,6.2vw,112px)]/[0.92] font-bold tracking-[-0.025em] text-ink uppercase max-b700:text-[8.4vw]"
      >
        {about.headline}
      </h1>
    </section>
  );
}
