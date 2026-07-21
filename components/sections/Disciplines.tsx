"use client";

/*
 * Disciplines (§A5 Disciplines Row · §A6 #5 · §A7 #12 + SplitText notes).
 * Outer card #1d1d21 (bg-raise-2, the "applied" value) → inner panel #111214
 * holding 3 data-driven rows (numeral · name+JP · desc+tags · 16:10 media).
 * Choreography: scrubbed media parallax (±7%, image 118% tall @ top:-9%) and
 * a SplitText line reveal for the eyebrow + intro line. Reduced-motion users
 * get the static, fully-visible markup (no branch needed — nothing is hidden
 * or transformed outside the motion-ok branch).
 */

import { useRef } from "react";
import Image from "next/image";

import { gsap, useGSAP, SplitText } from "@/lib/gsap/register";
import { DUR, EASE, MQ, SCROLL } from "@/lib/gsap/motion";
import {
  disciplines,
  disciplinesEyebrow,
  disciplinesIntro,
} from "@/content/disciplines";

export default function Disciplines() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Default branch = the full motion design (§A7). No reduced branch is
      // required: the static markup is already the reduced-motion fallback.
      mm.add(MQ.motionOk, (ctx) => {
        // §A7 #12 — media parallax: scrub each [data-xp-img] +7 → −7 yPercent
        // across its row's full viewport transit.
        gsap.utils
          .toArray<HTMLElement>("[data-xp-row]", sectionRef.current)
          .forEach((row) => {
            const img = row.querySelector<HTMLElement>("[data-xp-img]");
            if (!img) return;
            gsap.fromTo(
              img,
              { yPercent: SCROLL.disciplinesParallaxPct },
              {
                yPercent: -SCROLL.disciplinesParallaxPct,
                ease: EASE.none,
                scrollTrigger: {
                  trigger: row,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });

        // §A7 SplitText notes — every text block reveals as MASKED LINES on
        // scroll (user round 2026-07-21), images clip-reveal alongside.
        // Split only after fonts are ready to avoid re-split reflow.
        const introEl = sectionRef.current?.querySelector<HTMLElement>(
          "[data-xp-intro-line]",
        );
        const eyebrowEl =
          sectionRef.current?.querySelector<HTMLElement>("[data-xp-eyebrow]");
        const splits: SplitText[] = [];
        let cancelled = false;

        document.fonts.ready.then(() => {
          if (cancelled) return;
          // ctx.add scopes the late-created tweens to this matchMedia branch.
          ctx.add(() => {
            // Intro: eyebrow + headline lines
            if (introEl && eyebrowEl) {
              const split = SplitText.create(introEl, {
                type: "lines",
                mask: "lines",
              });
              splits.push(split);
              gsap.from([eyebrowEl, ...split.lines], {
                yPercent: 110,
                duration: DUR.intro,
                ease: EASE.outQuart,
                stagger: 0.06,
                scrollTrigger: {
                  trigger: introEl,
                  start: "top 85%",
                  once: true,
                },
              });
            }

            // Rows: name + description as masked line rises; numeral, JP
            // label and tag pills stagger up; media clip-reveals downward
            // (inset keeps the corner radius via `round`).
            gsap.utils
              .toArray<HTMLElement>("[data-xp-row]", sectionRef.current)
              .forEach((row) => {
                const name = row.querySelector<HTMLElement>("h3");
                const desc = row.querySelector<HTMLElement>("[data-xp-desc]");
                const ja = row.querySelector<HTMLElement>("[lang='ja']");
                const numeral =
                  row.querySelector<HTMLElement>("[data-xp-numeral]");
                const tags = gsap.utils.toArray<HTMLElement>("li", row);
                const media = row.querySelector<HTMLElement>("[data-xp-media]");
                if (!name || !desc) return;

                const nameSplit = SplitText.create(name, {
                  type: "lines",
                  mask: "lines",
                });
                const descSplit = SplitText.create(desc, {
                  type: "lines",
                  mask: "lines",
                });
                splits.push(nameSplit, descSplit);

                const tl = gsap.timeline({
                  scrollTrigger: { trigger: row, start: "top 78%", once: true },
                });
                tl.from(
                  [...nameSplit.lines, ...descSplit.lines],
                  {
                    yPercent: 110,
                    duration: DUR.intro,
                    ease: EASE.outQuart,
                    stagger: 0.07,
                  },
                  0,
                );
                if (numeral || ja)
                  tl.from(
                    [numeral, ja].filter(Boolean),
                    {
                      y: 24,
                      autoAlpha: 0,
                      duration: DUR.copy2,
                      ease: EASE.outQuart,
                      stagger: 0.06,
                    },
                    0.05,
                  );
                if (tags.length)
                  tl.from(
                    tags,
                    {
                      y: 18,
                      autoAlpha: 0,
                      duration: DUR.copy2,
                      ease: EASE.outQuart,
                      stagger: 0.04,
                    },
                    0.15,
                  );
                if (media)
                  tl.from(
                    media,
                    {
                      clipPath: "inset(0% 0% 100% 0% round 10px)",
                      duration: DUR.intro,
                      ease: EASE.outQuart,
                      clearProps: "clipPath",
                    },
                    0.1,
                  );
              });
          });
        });

        return () => {
          cancelled = true;
          splits.forEach((s) => s.revert());
          splits.length = 0;
        };
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="disciplines"
      aria-label="Disciplines"
      className="relative z-(--z-section) bg-bg px-4 pt-17.5 pb-32.5 max-b700:px-3 max-b700:pt-10 max-b700:pb-17.5"
    >
      {/* Outer card — #1d1d21 (bg-raise-2, applied value; NOT the #15151a base).
          pb-3 (not mb-3 on the panel): a bottom margin on the last child
          collapses through the card's bottom edge (no padding/border/BFC
          here, unlike the reference card's overflow:hidden), which deleted
          the 12px lip and let the panel sit flush with the card's bottom. */}
      <div data-xp-card className="rounded-card bg-raise-2 pb-3">
        {/* Intro grid: empty numeral gutter · eyebrow + intro line */}
        <div
          data-xp-intro
          className="grid grid-cols-[clamp(120px,15vw,300px)_1fr] gap-10 px-12 pt-24 pb-27 max-b700:grid-cols-1 max-b700:gap-5 max-b700:px-5.5 max-b700:pt-12 max-b700:pb-10"
        >
          {/* Empty numeral gutter — hidden when the grid stacks so its row
              gap doesn't offset the eyebrow (AboutBio idiom) */}
          <div aria-hidden="true" className="max-b700:hidden" />
          <div>
            <p
              data-xp-eyebrow
              className="text-[14px] leading-none font-medium tracking-[0.1em] uppercase text-muted-2"
            >
              {disciplinesEyebrow}
            </p>
            <h2
              data-xp-intro-line
              className="mt-4.5 max-w-310 text-[min(50px,3.25vw)] leading-[1.26] font-medium tracking-[-0.015em] text-pretty text-ink max-b700:text-[22px]"
            >
              {disciplinesIntro}
            </h2>
          </div>
        </div>

        {/* Inner panel — #111214, 3 rows */}
        <div
          data-xp-panel
          className="mx-3 rounded-panel bg-panel pb-9 max-b700:pb-5"
        >
          {disciplines.map((d) => (
            <div
              key={d.numeral}
              data-xp-row
              className="relative grid grid-cols-[clamp(120px,15vw,300px)_1.32fr_1fr_1fr] gap-10 px-12 pt-14.5 pb-15.5 max-b700:grid-cols-1 max-b700:gap-4.5 max-b700:px-5.5 max-b700:pt-7 max-b700:pb-8"
            >
              {d.line && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-12 top-0 h-px bg-line-055"
                />
              )}

              {/* 1 — numeral */}
              <div
                data-xp-numeral
                className="pt-3 text-[18px] leading-none font-normal text-muted-2"
              >
                {d.numeral}
              </div>

              {/* 2 — name + JP sub-label */}
              <div>
                <h3 className="text-[min(46px,3vw)] leading-[1.08] font-medium tracking-[-0.02em] text-ink max-b700:text-[30px]">
                  {d.name}
                </h3>
                <span
                  lang="ja"
                  className="mt-2.5 block font-ja text-[15px] leading-none font-normal tracking-[0.12em] text-muted-2"
                >
                  {d.jaName}
                </span>
              </div>

              {/* 3 — description + tag pills */}
              <div>
                <p
                  data-xp-desc
                  className="text-[18px] leading-[1.7] font-normal text-muted-1"
                >
                  {d.description}
                </p>
                <ul className="mt-5.5 flex flex-wrap gap-2">
                  {d.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-tag border border-line-13 bg-fill-035 px-[15px] py-2.5 text-[13px] leading-none font-normal tracking-[0.04em] text-ink-2"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4 — 16:10 media with parallax slot (118% tall @ top:-9%) */}
              <div
                data-xp-media
                className="relative aspect-[16/10] overflow-hidden rounded-media bg-slot"
              >
                <div
                  data-xp-img
                  className="absolute top-[-9%] left-0 h-[118%] w-full"
                >
                  <Image
                    src={d.image}
                    alt={`Supporting visual for the ${d.name} discipline`}
                    fill
                    sizes="(max-width: 700px) 100vw, 25vw"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
