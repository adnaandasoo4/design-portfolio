"use client";

/*
 * Works project index (§A9 Works brief #2) — 3-col card grid collapsing
 * 3 → 2 → 1 at b1024 / b860. Cards use the home ratios and registers:
 * 16:10 media slot (radius-media 10px, bg-slot, next/image cover), then a
 * meta line — title Manrope 500 + dimmer lang="ja" line, and an index + meta
 * in the 13px mono/muted-3 register.
 *
 * Hover stays in the home language (§A9 — no new patterns): image scales
 * within its clip 1 → 1.04 (.55s ease-out-quart, transform-only) and the
 * title colour-shifts to accent (the footer copy-email hover, .30 ease-std).
 * Reveal: batch ScrollTrigger, y+opacity, stagger .06, once (§A7 #9 idiom).
 * Cards link to "#" for now — case-study pages are deferred (§A9).
 */

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap/register";
import { EASE, MQ } from "@/lib/gsap/motion";
import { works } from "@/content/works";

export default function WorksIndex() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      // Default branch = the full motion design (§A7). No reduced branch is
      // needed: the static markup is already the fully-visible fallback.
      mm.add(MQ.motionOk, () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll("[data-wcard]"),
        );
        // Hidden only inside this branch — reduced-motion users never run it.
        gsap.set(cards, { y: 32, autoAlpha: 0 });
        ScrollTrigger.batch(cards, {
          start: "top 88%",
          once: true,
          onEnter: (els) =>
            gsap.to(els, {
              y: 0,
              autoAlpha: 1,
              duration: 0.6,
              ease: EASE.outQuart,
              stagger: 0.06,
              overwrite: true,
            }),
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Project index"
      className="relative z-(--z-section) bg-bg"
    >
      {/* Full-bleed hairline under the header (§A1 — hairlines, not margins) */}
      <div aria-hidden="true" className="h-px bg-line-09" />

      <ul className="grid grid-cols-3 gap-x-9 gap-y-[clamp(48px,7vh,84px)] px-9 pt-[clamp(44px,7vh,84px)] pb-[clamp(90px,13vh,170px)] max-b1024:grid-cols-2 max-b860:grid-cols-1 max-b700:px-5.5">
        {works.cards.map((card, i) => (
          <li key={card.title}>
            {/* Case studies deferred (§A9) — anchor is a placeholder */}
            <a href="#" data-wcard className="group block">
              {/* 16:10 media slot — home ratio, radius-media, bg-slot */}
              <span className="relative block aspect-[16/10] overflow-hidden rounded-media bg-slot">
                <Image
                  src={card.image}
                  alt={`${card.title} — ${card.meta} project preview`}
                  fill
                  sizes="(max-width: 860px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading={i < 3 ? "eager" : "lazy"}
                  className="object-cover motion-safe:transition-transform motion-safe:duration-(--dur-clip) motion-safe:ease-(--ease-out-quart) motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04]"
                />
              </span>

              {/* Meta line — title + JP left · index + mono meta right */}
              <span className="mt-4 flex items-baseline justify-between gap-4">
                <span className="flex min-w-0 flex-col gap-[7px]">
                  <span className="truncate text-[clamp(17px,1.35vw,21px)]/[1] font-medium tracking-[-0.01em] text-ink transition-colors duration-(--dur-hover) ease-(--ease-std) group-hover:text-accent group-focus-visible:text-accent">
                    {card.title}
                  </span>
                  <span
                    lang="ja"
                    className="truncate font-ja text-[12px]/[1] font-normal tracking-[0.14em] text-text-38"
                  >
                    {card.ja}
                  </span>
                </span>
                <span className="shrink-0 font-mono-ui text-[12px]/[1] font-medium tracking-[0.04em] text-muted-3">
                  <span className="text-muted-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {" · "}
                  {card.meta}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
