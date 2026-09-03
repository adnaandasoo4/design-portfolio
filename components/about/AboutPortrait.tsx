"use client";

/*
 * Portrait and story — the page's asymmetric spread, and the moment the
 * illustration finally gets to be a picture.
 *
 * On the home page the same file is a 4:5 thumbnail in a narrow rail. Here
 * it runs at 9:16 across roughly 38vw — tall enough to be looked at rather
 * than referenced. That difference is the reason the two pages do not feel
 * like the same section twice.
 *
 * The narrative sits to its right and is BOTTOM-aligned to the image's
 * lower edge, not its top. Aligning tops would leave a long ragged gap
 * under a short text column beside a very tall image; aligning bottoms puts
 * the weight of both columns on one line and lets the empty space collect
 * above the text, where it reads as air rather than as a hole.
 *
 * The image drifts on scroll: the inner layer is oversized 112% and scrubs
 * ±6%, so the parallax can never expose an edge. Transform only (§A7).
 */
import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { EASE, MQ } from "@/lib/gsap/motion";
import { about } from "@/content/about";

/** Drift, in % of the oversized layer's own height */
const DRIFT_PCT = 6;

export default function AboutPortrait() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = scope.current;
      if (!section) return;
      const media = section.querySelector<HTMLElement>("[data-about-media]");
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
      aria-label="Portrait"
      className="relative bg-bg px-5 py-[clamp(60px,10vh,150px)] max-b700:px-4 max-b700:py-16"
    >
      <div className="grid grid-cols-[minmax(0,38vw)_1fr] items-end gap-x-[clamp(40px,8vw,150px)] max-b860:grid-cols-1 max-b860:items-stretch max-b860:gap-y-12">
        <figure data-reveal="" className="m-0">
          <div className="relative aspect-9/16 w-full overflow-hidden rounded-media bg-slot">
            <div
              data-about-media=""
              className="absolute inset-x-0 top-[-6%] h-[112%] will-change-transform"
            >
              <Image
                src={about.image.src}
                alt={about.image.alt}
                fill
                sizes="(max-width: 860px) 100vw, 38vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
          <figcaption className="mt-4 flex items-baseline justify-between gap-4 font-manrope text-meta leading-none text-muted-2">
            <span>{about.image.caption.latin}</span>
            <span lang="ja" className="font-ja tracking-[0.14em] text-muted-3">
              {about.image.caption.ja}
            </span>
          </figcaption>
        </figure>

        <div className="flex max-w-[54ch] flex-col gap-[1.5em] pb-[clamp(0px,6vh,90px)] font-manrope text-meta/[1.9] text-muted-2 max-b860:max-w-none max-b860:pb-0">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} data-reveal="">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
