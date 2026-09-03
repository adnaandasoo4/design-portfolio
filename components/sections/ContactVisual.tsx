"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { EASE, MQ } from "@/lib/gsap/motion";
import { contactVisual } from "@/content/copy";
import CtaButton from "@/components/site/CtaButton";

/*
 * Contact visual (user-directed, 2026-07-19; revised 2026-09-02) —
 * full-viewport desk photo with a stacked statement ("helping brands /
 * establish their / visual presence.") and a large collaborate CTA that
 * smooth-scrolls to #footer.
 *
 * The photo is in COLOUR again (the grayscale filter is gone, user request)
 * and carries a slightly heavier scrim to hold the type. That scrim is
 * --color-art-scrim, a FIXED dark, and the statement is --color-on-art: the
 * photograph is artwork, not a surface, so it must not invert with the
 * theme. Tying either to the theme tokens would have put dark type over a
 * near-white wash in light mode, which the colour restoration makes far
 * worse than it was in grayscale. The collaborate CTA takes the same
 * treatment (tone="art", 2026-09-03) for the same reason.
 *
 * Depth: the text/CTA block parallaxes against the fixed photo — a
 * scrubbed yPercent glide (+14 → −14 across the section's viewport
 * transit) so the statement drifts slower than the scroll and the image
 * reads as a deeper layer. Reduced motion: no scrub, static markup.
 */
export default function ContactVisual() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const content = section.querySelector<HTMLElement>("[data-cv-content]");
      if (!content) return;

      const mm = gsap.matchMedia();
      mm.add(MQ.motionOk, () => {
        gsap.fromTo(
          content,
          { yPercent: 14 },
          {
            yPercent: -14,
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
      // Reduced-motion: intentionally empty — static markup is the fallback.
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="contact-visual"
      ref={sectionRef}
      aria-label="Contact"
      className="relative z-(--z-section) h-svh w-full overflow-hidden"
    >
      {/* NOTE: the section must NOT carry a `group` class — the CtaButton
          inside is its own `group`, and an ancestor group would pre-fire its
          hover swaps from anywhere in the section. */}
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src={contactVisual.imageSrc}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Scrim — fixed dark in both themes, a touch heavier than the
            grayscale version needed, since colour brings its own noise */}
        <div className="absolute inset-0 bg-art-scrim" />
        {/* Faint TV-static grain — masks the photo's soft resolution so it
            reads intentional. Oversized so the step-jitter never shows an
            edge; recipe + flicker keyframes live in globals.css (.tv-grain). */}
        <div className="tv-grain pointer-events-none absolute -inset-1/2 opacity-[0.16] mix-blend-overlay" />
      </div>
      <div
        data-cv-content=""
        className="relative flex h-full flex-col items-center justify-center gap-6 px-9 text-center"
      >
        <h2 className="font-hkgw text-[clamp(36px,5.5vw,96px)]/[1.04] font-semibold tracking-[-0.01em] text-on-art uppercase max-b700:text-[clamp(22px,7.2vw,36px)]/[1.06]">
          {contactVisual.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
        {/* tone="art": pinned to the fixed on-art pair, like the statement
            above it. Inverting would have made it a dark bar on the dark
            photo the moment the site went light. */}
        <CtaButton
          label={contactVisual.cta}
          href="/#footer"
          scrollTarget="#footer"
          tone="art"
          className="mt-4"
        />
      </div>
    </section>
  );
}
