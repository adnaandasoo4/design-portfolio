"use client";

/*
 * About — Bio (§A9 About brief, section 2). Editorial grid echoing the
 * Disciplines column system (numeral gutter · text · media): headline + three
 * paragraphs at a ~38ch measure in muted-1, with the portrait figure offset in
 * the third column. The portrait carries a subtle scrubbed parallax
 * (yPercent ±6, image 114% tall @ top:-7% — same idiom as the disciplines
 * media, §A7 #12) — signature motion moment #2. Text/figure get the standard
 * once-on-enter rise (§A7 #9 vocabulary).
 *
 * Reduced-motion: static markup is the fallback — nothing hidden or
 * transformed outside the motion branch.
 */

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap/register";
import { EASE, MQ } from "@/lib/gsap/motion";
import BiLabel from "@/components/site/BiLabel";
import { about } from "@/content/about";

/** Portrait parallax travel (yPercent) — slightly quieter than disciplines' ±7 */
const PORTRAIT_PARALLAX_PCT = 6;

export default function AboutBio() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      // Default branch = full motion design (§A7 rule).
      mm.add(MQ.motionOk, () => {
        // Portrait parallax — scrub across the figure's viewport transit.
        const figure = section.querySelector<HTMLElement>("[data-portrait]");
        const img = section.querySelector<HTMLElement>("[data-portrait-img]");
        if (figure && img) {
          gsap.fromTo(
            img,
            { yPercent: PORTRAIT_PARALLAX_PCT },
            {
              yPercent: -PORTRAIT_PARALLAX_PCT,
              ease: EASE.none,
              scrollTrigger: {
                trigger: figure,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }

        // Once-on-enter rise for the bio column + figure.
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", section);
        if (items.length) {
          gsap.set(items, { y: 28, autoAlpha: 0 });
          const triggers = ScrollTrigger.batch(items, {
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                y: 0,
                autoAlpha: 1,
                duration: 0.6,
                ease: EASE.outQuart,
                stagger: 0.06,
              }),
          });
          return () => triggers.forEach((t) => t.kill());
        }
      });

      // Reduced branch: intentionally empty — default styles are visible.
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="bio"
      aria-label="Biography"
      className="relative z-(--z-section) bg-bg"
    >
      {/* Section hairline — edge to edge (§A1: hairlines, not margins) */}
      <div aria-hidden="true" className="h-px bg-line-09" />

      <div className="grid grid-cols-[clamp(120px,15vw,300px)_1.32fr_1fr] gap-10 px-9 pt-[clamp(80px,12vh,150px)] pb-[clamp(90px,14vh,170px)] max-b860:grid-cols-1 max-b860:gap-11 max-b700:px-5.5 max-b700:pt-15 max-b700:pb-17.5">
        {/* 1 — empty numeral gutter (disciplines intro idiom) */}
        <div aria-hidden="true" className="max-b860:hidden" />

        {/* 2 — headline + paragraphs, editorial measure */}
        <div>
          <h2
            data-reveal
            className="max-w-[20ch] font-medium text-[clamp(28px,2.9vw,50px)] leading-[1.2] tracking-[-0.016em] text-ink text-pretty"
          >
            {about.headline}
          </h2>
          <div className="mt-[clamp(30px,5vh,52px)] flex max-w-[38ch] flex-col gap-[1.35em]">
            {about.paragraphs.map((p) => (
              <p
                key={p}
                data-reveal
                className="text-[18px] leading-[1.7] font-normal text-muted-1"
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* 3 — portrait figure with parallax slot (114% tall @ top:-7%) */}
        <figure data-reveal data-portrait className="max-b860:max-w-120">
          <div className="relative aspect-[1122/1402] overflow-hidden rounded-media bg-slot">
            <div
              data-portrait-img
              className="absolute top-[-7%] left-0 h-[114%] w-full"
            >
              <Image
                src={about.portrait.src}
                alt={about.portrait.alt}
                fill
                sizes="(max-width: 860px) 100vw, 30vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
          </div>
          <figcaption className="mt-4">
            <BiLabel
              latin={about.portrait.caption.latin}
              ja={about.portrait.caption.ja}
            />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
