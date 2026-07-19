"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap/register";
import { MQ, SCROLL } from "@/lib/gsap/motion";
import { divider } from "@/content/copy";

/** Band speeds (§A2 named scroll constants) — top +0.12, bottom −0.10 (opposed). */
const SPEEDS: readonly number[] = [SCROLL.bandSpeedTop, SCROLL.bandSpeedBottom];

/**
 * Big-word Divider (§A5 / §A6 #3 / §A7 row #8) — `#bands`.
 *
 * Two full-width oversized band rows ("Introduction" white, "Works"
 * band-dark) drifting horizontally in opposite directions, scrubbed to
 * section progress: x = (0.5 − p) × vw × speed × 2.
 * Reduced-motion branch: static, no transform.
 */
export default function Divider() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const bands = gsap.utils.toArray<HTMLElement>(
        "[data-band]",
        sectionRef.current,
      );
      const mm = gsap.matchMedia();

      // Default branch — full motion design (§A7 rule).
      mm.add(MQ.motionOk, () => {
        // will-change only while actively animating (§A10)
        gsap.set(bands, { willChange: "transform" });
        const setters = bands.map((el) => gsap.quickSetter(el, "x", "px"));

        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            for (let i = 0; i < setters.length; i++) {
              setters[i]((0.5 - p) * window.innerWidth * (SPEEDS[i] ?? 0) * 2);
            }
          },
        });

        return () => {
          trigger.kill();
          gsap.set(bands, { clearProps: "will-change" });
        };
      });

      // Opted-in reduced-motion branch — static, no drift (§A7 row #8).
      mm.add(MQ.reduced, () => {
        gsap.set(bands, { clearProps: "transform,will-change" });
      });
    },
    { scope: sectionRef },
  );

  // Purely decorative oversized type — hidden from AT entirely (no empty
  // named region; §A10)
  return (
    <section
      ref={sectionRef}
      id="bands"
      aria-hidden="true"
      data-band-section
      className="relative z-(--z-section) h-screen overflow-hidden bg-bg max-b700:h-[38vh]"
    >
      <div className="flex h-screen flex-col justify-center overflow-hidden max-b700:h-[38vh]">
        {divider.bands.map((band) => (
          <div
            key={band.text}
            data-band
            aria-hidden="true"
            className="whitespace-nowrap will-change-transform"
            style={{ marginLeft: band.offset }}
          >
            <span
              className="font-manrope font-normal text-[55vh] leading-none tracking-[-0.03em] max-b700:text-[25vw]"
              style={{ color: band.color }}
            >
              {[0, 1, 2].map((n) => (
                <Fragment key={n}>
                  {n > 0 && (
                    <span className="mx-[3.5vw] inline-block h-[0.4vh] w-[17vw] bg-current align-[0.22em]" />
                  )}
                  {band.text}
                </Fragment>
              ))}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
