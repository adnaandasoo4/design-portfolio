"use client";

/*
 * About (§A6 #2) — rebuilt 2026-09-04 as a scroll set piece.
 *
 * The section used to be a teaser: a statement, two paragraphs borrowed from
 * /about, and a "read more". All of that is on /about now, in full. What is
 * left is ONE statement and ONE picture, and the section earns its place on
 * the home page through motion rather than through more words.
 *
 * TWO SCRUBBED MOVES, both tied to the same scroll, both transform-only
 * (§A7). Neither is decoration on a layout that would look finished without
 * it — the whole section is built around them:
 *
 *   WORDS. The statement is set JUSTIFIED, so the browser opens real gaps
 *   between words to fill each line. Every word then starts pulled LEFT by
 *   an amount proportional to how far into its line it sits, and scrubs back
 *   to zero as the section rises. Words near a line's start barely move;
 *   words at its end travel furthest. The line therefore arrives compressed
 *   and unpacks itself left to right, the gaps opening as you scroll.
 *
 *   Pulling left rather than pushing right is deliberate: the offsets are
 *   negative, so words only ever move INTO the measure. Spreading them the
 *   other way would push the last word of every line past the column and
 *   need clipping to hide it.
 *
 *   IMAGE. The illustration starts at the top of its column and falls to the
 *   bottom across the section's whole transit of the viewport. The distance
 *   is MEASURED — the track's height less the picture's — and re-measured on
 *   refresh, so the fall always ends exactly at the floor of the column
 *   whatever the text wraps to at that width.
 *
 * Both are `ease: none` and scrubbed: the section does not play an animation
 * at you, it is driven entirely by how fast you scroll, which is the whole
 * point of the effect.
 *
 * SplitText runs only after document.fonts.ready (§A7): split against the
 * fallback face and the words are measured at the wrong widths, so every
 * offset is computed from a layout that no longer exists once the real face
 * lands.
 *
 * Reduced motion: the branch is intentionally empty — the statement sets
 * justified and static, the picture sits at the top of its column, and the
 * section reads as an ordinary two-column spread.
 */
import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, SplitText } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";
import ArrowLink from "@/components/site/ArrowLink";
import { aboutSection } from "@/content/copy";

/** How far each word is pulled left, per pixel of its offset into the line.
 *  0.16 puts a word 800px along a line 128px out of place at the start —
 *  enough to read as compressed, short of illegible. */
const WORD_COMPRESS = 0.16;

export default function About() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = scope.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add(MQ.motionOk, () => {
        const statement =
          section.querySelector<HTMLElement>("[data-about-statement]");
        const track = section.querySelector<HTMLElement>("[data-about-track]");
        const media = section.querySelector<HTMLElement>("[data-about-media]");

        /* ---- The picture falls the height of its column ---- */
        if (track && media) {
          gsap.fromTo(
            media,
            { y: 0 },
            {
              // Function-based, so ScrollTrigger re-measures on refresh and
              // the fall still lands on the floor after a resize re-wraps
              // the text and changes the track's height.
              y: () => Math.max(0, track.clientHeight - media.offsetHeight),
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        }

        /* ---- The words unpack out of compression ---- */
        let split: SplitText | null = null;
        let tween: gsap.core.Tween | null = null;
        let cancelled = false;

        document.fonts.ready.then(() => {
          if (cancelled || !statement) return;
          split = new SplitText(statement, { type: "words" });
          tween = gsap.fromTo(
            split.words,
            {
              // offsetLeft is measured against the statement itself, which is
              // `relative` for exactly this reason, so the value is the
              // word's distance into its own line and resets every line.
              x: (_i: number, el: HTMLElement) =>
                -el.offsetLeft * WORD_COMPRESS,
            },
            {
              x: 0,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
                end: "top 25%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        return () => {
          // The split resolves after this callback returns, so its tween and
          // its trigger are outside useGSAP's automatic cleanup and are
          // killed by hand.
          cancelled = true;
          tween?.scrollTrigger?.kill();
          tween?.kill();
          split?.revert();
        };
      });

      // Reduced motion: intentionally empty — the markup renders complete.

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      id="about"
      ref={scope}
      aria-label="About"
      className="relative z-(--z-section) bg-bg px-5 py-[clamp(140px,20vh,260px)] max-b700:px-4 max-b700:py-24"
    >
      <p className="font-manrope text-meta leading-none tracking-[0.08em] text-muted-2 uppercase">
        {aboutSection.eyebrow}
      </p>

      {/* items-stretch, so the picture's column is exactly as tall as the
          statement beside it — that height IS the distance the picture
          falls, which is why it is the grid's job and not a fixed value. */}
      <div className="mt-[clamp(30px,5vh,72px)] grid grid-cols-[1fr_minmax(0,27%)] items-stretch gap-x-[clamp(32px,6vw,110px)] max-b860:grid-cols-1 max-b860:gap-y-14">
        <div>
          {/* `relative` is load-bearing: it makes this element the words'
              offsetParent, so each word's offsetLeft is its distance into
              its own line rather than into the page. */}
          <p
            data-about-statement=""
            className="relative text-justify font-hkgw text-[clamp(26px,4.2vw,68px)]/[1.08] font-semibold tracking-[-0.02em] text-ink hyphens-none"
          >
            {aboutSection.statement}
          </p>

          <div className="mt-[clamp(32px,5vh,64px)]">
            <ArrowLink href={aboutSection.readMoreHref}>
              {aboutSection.readMoreText}
            </ArrowLink>
          </div>
        </div>

        {/* The track is the full column; the picture is shorter than it, and
            the difference is the fall. */}
        <div
          data-about-track=""
          className="relative h-full min-h-[clamp(300px,44vh,560px)] max-b860:min-h-0"
        >
          <div
            data-about-media=""
            className="relative h-[clamp(220px,30vh,380px)] w-full overflow-hidden rounded-media bg-slot max-b860:h-[clamp(260px,42vh,420px)]"
          >
            <Image
              src={aboutSection.image}
              alt={aboutSection.imageAlt}
              fill
              sizes="(max-width: 860px) 100vw, 27vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
