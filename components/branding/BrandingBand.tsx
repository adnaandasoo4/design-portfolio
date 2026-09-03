"use client";

/*
 * Full-bleed image band — the page's one moment without a rail, so the
 * two-column rhythm has something to break against before the process
 * picks it up again.
 *
 * The image is oversized and drifts on scroll (yPercent −8 → 8, scrubbed):
 * the same parallax idea as ContactVisual, at a fraction of the amplitude,
 * because this band is a third of the height that one is. Oversizing by
 * 116% is what keeps the drift from ever exposing an edge. Reduced motion
 * gets the image static and correctly framed.
 */
import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { EASE, MQ } from "@/lib/gsap/motion";
import { branding } from "@/content/branding";

/** Drift, in % of the oversized image's own height */
const DRIFT_PCT = 8;

export default function BrandingBand() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = scope.current;
      if (!section) return;
      const media = section.querySelector<HTMLElement>("[data-band-media]");
      if (!media) return;

      const mm = gsap.matchMedia();
      mm.add(MQ.motionOk, () => {
        gsap.fromTo(
          media,
          { yPercent: -DRIFT_PCT },
          {
            yPercent: DRIFT_PCT,
            ease: EASE.none,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
      // Reduced motion: intentionally empty — the image renders centred.

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      aria-label="Identity work"
      className="relative overflow-hidden bg-bg"
    >
      <div className="relative h-[clamp(300px,58svh,620px)] w-full">
        {/* Oversized so the drift never reveals an edge */}
        <div
          data-band-media=""
          className="absolute inset-x-0 top-[-8%] h-[116%] will-change-transform"
        >
          <Image
            src={branding.bandImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* Scrim — fixed dark in both themes; the photograph is artwork, not
            a surface, so it must not invert with the theme */}
        <div aria-hidden="true" className="absolute inset-0 bg-art-scrim" />
        <p className="absolute bottom-5 left-5 font-mono-ui text-meta leading-none text-on-art max-b700:bottom-4 max-b700:left-4">
          {branding.bandCaption}
        </p>
      </div>
    </section>
  );
}
