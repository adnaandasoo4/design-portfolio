"use client";

/*
 * About (§A6 #2) — the home page's scroll set piece (user, 2026-09-04).
 *
 * One statement, one picture, and two moves tied to the same scroll.
 *
 * ── THE WORDS ────────────────────────────────────────────────────────────
 * The paragraph is set NORMALLY in the markup: left-aligned, ordinary word
 * spacing, ragged right. Every gap you see opening is a per-word `x`
 * transform, and that is the whole trick.
 *
 * Each line is measured for SLACK — the room between where its last word
 * naturally ends and the right edge of the column — and that slack is handed
 * out across the line's gaps as scroll progress rises. At full spread the
 * line's last word lands exactly on the right edge, so the paragraph reads
 * as justified without ever having been justified. At zero it is back to its
 * natural setting. Nothing re-wraps at any point in between, because the
 * line breaks were fixed by the browser once, before a single transform was
 * applied.
 *
 * SPORADIC, not synchronised (user, 2026-09-04). A first pass handed every
 * gap a fixed share of the slack and opened them all together, which read as
 * one block breathing — legible, and dull. Now each gap carries its OWN
 * phase and its own frequency, so at any scroll position some are wide open
 * while their neighbours are shut, and which ones those are keeps changing
 * as you scroll. The words appear to shuffle against each other rather than
 * inflate as a unit.
 *
 * What keeps that from tearing the line apart is that the shares are
 * NORMALISED every frame: the per-gap values are weights, scaled so their
 * total is always the line's slack budget and never a pixel more. Gaps
 * therefore trade room with each other — one can only open by another
 * closing — so the line's right edge stays put however chaotic the middle
 * gets.
 *
 * An ENVELOPE rides over the top: `0.35 + 0.65·sin(p·π)`, so the paragraph is
 * never fully closed (the reference always shows gaps) but is at its most
 * open crossing the middle of the viewport. Scroll up and all of it runs
 * backwards. It is a position, not a playback — the paragraph only ever
 * moves as fast as you scroll it.
 *
 * Every phase and frequency comes from a hash of the gap's index, so the
 * churn is identical on every load rather than random per refresh.
 *
 * Doing it with transforms rather than by animating `word-spacing` is what
 * keeps this affordable: word-spacing is a layout property, so animating it
 * would re-wrap and re-lay-out the paragraph on every frame of every scroll.
 * The visible result is the same; only the cost differs.
 *
 * ── THE PICTURE ──────────────────────────────────────────────────────────
 * It starts level with the first line of the statement, rides up with the
 * page until it clears the fixed nav, then PINS — the words keep scrolling
 * past on the left while it holds still. It is released after exactly the
 * column's slack (track height less its own), which is the scroll distance
 * that puts its bottom edge on the bottom of the text. From there it scrolls
 * away with everything else.
 *
 * ── MOBILE AND REDUCED MOTION ────────────────────────────────────────────
 * Neither move exists below 700px (user, 2026-09-04): no split, no pin, and
 * the statement is exactly what the markup says — an ordinary paragraph. A
 * justified-by-transform paragraph at phone measure is three or four words a
 * line with canyons between them, and a pinned picture on a screen that
 * short is a picture that never appears to move. Reduced motion opts out of
 * both for the same reason it opts out of everything else.
 */
import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, ScrollTrigger, SplitText } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";
import { aboutSection } from "@/content/copy";

/** Desktop, and only when motion is welcome. */
const MQ_SET_PIECE = `${MQ.desktop} and ${MQ.motionOk}`;

/** Distance from the viewport's top the picture holds at while pinned —
 *  clear of the nav bar (44px on a 20px gutter) with air to spare. */
const PIN_TOP = 116;

/** A line never gives up more than this share of its own width to gaps. The
 *  cap exists for the LAST line, which is short and therefore nearly all
 *  slack: without it, three words would be flung across the full column. */
const MAX_SPREAD = 0.32;

/** The floor of the envelope — how open the paragraph stays at the ends of
 *  the transit. Never 0: the reference always shows gaps. */
const OPEN_FLOOR = 0.35;

/** How many times a gap cycles across one pass of the section. Kept low and
 *  irrational-ish so neighbours drift out of step instead of pulsing
 *  together. */
const CHURN_MIN = 1.3;
const CHURN_MAX = 3.4;

/** Deterministic 0..1 from an integer — the per-gap share of the slack. Not
 *  Math.random: the spacing has to be identical on every load, or the
 *  paragraph would re-space itself on a refresh. */
function hash01(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type Line = {
  /** One setter per word; index 0 never moves, it anchors the line. */
  setters: ((value: number) => void)[];
  /** Per-GAP phase and frequency — length is setters.length - 1. */
  phase: number[];
  freq: number[];
  slack: number;
};

export default function About() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = scope.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add(MQ_SET_PIECE, () => {
        const statement =
          section.querySelector<HTMLElement>("[data-about-statement]");
        const track = section.querySelector<HTMLElement>("[data-about-track]");
        const media = section.querySelector<HTMLElement>("[data-about-media]");

        /* ---- The picture pins while the words scroll past ---- */
        let pin: ScrollTrigger | null = null;
        if (track && media) {
          pin = ScrollTrigger.create({
            trigger: media,
            start: `top ${PIN_TOP}px`,
            // Exactly the column's slack: hold until the picture's bottom
            // meets the bottom of the text, then let go. Function-based, so
            // a resize that re-wraps the statement re-measures the hold.
            end: () =>
              "+=" + Math.max(0, track.clientHeight - media.offsetHeight),
            pin: media,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });
        }

        /* ---- The words open and close their own gaps ---- */
        let split: SplitText | null = null;
        let spread: ScrollTrigger | null = null;
        let cancelled = false;

        document.fonts.ready.then(() => {
          if (cancelled || !statement) return;

          split = new SplitText(statement, {
            type: "lines,words",
            linesClass: "ad-line",
            wordsClass: "ad-word",
          });

          const column = statement.clientWidth;
          let lines: Line[] = [];
          // Reused across frames — this runs on every scroll event, so the
          // per-frame work allocates nothing.
          const weights: number[] = [];

          /** Re-measure everything from the browser's own layout. Called on
           *  build and on every refresh, since a resize re-wraps the lines
           *  and every slack figure with them. */
          const measure = () => {
            lines = gsap.utils
              .toArray<HTMLElement>(".ad-line", statement)
              .map((line) => {
                const words = gsap.utils.toArray<HTMLElement>(
                  ".ad-word",
                  line,
                );
                if (words.length < 2) return null;

                const first = words[0];
                const last = words[words.length - 1];
                const natural =
                  last.offsetLeft + last.offsetWidth - first.offsetLeft;
                const slack = Math.max(
                  0,
                  Math.min(column - natural, natural * MAX_SPREAD),
                );

                // One phase and one frequency per GAP. Seeded off the
                // line's own length as well as the gap index, so two lines
                // with the same word count still churn differently.
                const gaps = words.length - 1;
                const seed = words.length * 31;
                const phase = Array.from(
                  { length: gaps },
                  (_, g) => hash01(g + seed) * Math.PI * 2,
                );
                const freq = Array.from(
                  { length: gaps },
                  (_, g) =>
                    CHURN_MIN +
                    hash01(g + seed + 977) * (CHURN_MAX - CHURN_MIN),
                );

                return {
                  setters: words.map((w) => gsap.quickSetter(w, "x", "px")),
                  phase,
                  freq,
                  slack,
                } as Line;
              })
              .filter((l): l is Line => l !== null);
          };

          /**
           * @param progress 0..1 across the section's transit
           * @param envelope how much of each line's slack is in play
           *
           * The per-gap values are WEIGHTS, not widths. They are normalised
           * to sum to 1 before being scaled by the line's budget, which is
           * what stops the line growing past its slack no matter how the
           * individual gaps happen to fall — a gap can only open by taking
           * room from another.
           */
          const apply = (progress: number, envelope: number) => {
            for (const line of lines) {
              const gaps = line.phase.length;
              if (!gaps) continue;

              let total = 0;
              for (let g = 0; g < gaps; g++) {
                // 0.15 floor so a gap at the bottom of its cycle still holds
                // a sliver of room rather than snapping its words together.
                weights[g] =
                  0.15 +
                  0.85 *
                    (0.5 +
                      0.5 *
                        Math.sin(
                          progress * Math.PI * 2 * line.freq[g] +
                            line.phase[g],
                        ));
                total += weights[g];
              }

              const budget = line.slack * envelope;
              let run = 0;
              line.setters[0](0);
              for (let g = 0; g < gaps; g++) {
                run += (weights[g] / total) * budget;
                line.setters[g + 1](run);
              }
            }
          };

          /** How much of each line's slack is in play at this progress. */
          const envelope = (progress: number) =>
            OPEN_FLOOR + (1 - OPEN_FLOOR) * Math.sin(progress * Math.PI);

          measure();

          spread = ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              // Zero the transforms before re-measuring, or the offsets we
              // read back would include the spread we are about to recompute.
              apply(0, 0);
              measure();
              // ...and put it straight back. A refresh fires on resize, on
              // the font swap and when the picture finishes loading, none of
              // which involve scrolling — so without this the paragraph sits
              // at its natural spacing until the next scroll event happens
              // to arrive, which on a section already in view is never.
              apply(self.progress, envelope(self.progress));
            },
            onUpdate: (self) => apply(self.progress, envelope(self.progress)),
          });
        });

        return () => {
          // Both of these are built after this callback returns, so they sit
          // outside useGSAP's automatic cleanup and are killed by hand.
          cancelled = true;
          spread?.kill();
          split?.revert();
          pin?.kill();
        };
      });

      // Every other case — phones, and anyone who asked for less motion —
      // renders the markup exactly as written.

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

      {/* items-start so the picture's top edge begins level with the first
          line of the statement; the track below it carries the height that
          decides how long the pin holds. */}
      <div className="mt-[clamp(30px,5vh,72px)] grid grid-cols-[1fr_minmax(0,34%)] items-start gap-x-[clamp(32px,5vw,90px)] max-b860:grid-cols-1 max-b860:gap-y-14">
        <div>
          <p
            data-about-statement=""
            className="font-manrope text-[clamp(28px,4.6vw,74px)]/[1.02] font-bold tracking-[-0.03em] text-ink"
          >
            {aboutSection.statement}
          </p>
        </div>

        {/* The track is the column the picture travels; its height less the
            picture's own is exactly how far the pin holds. */}
        <div data-about-track="" className="relative h-full">
          <div
            data-about-media=""
            className="relative aspect-4/3 w-full overflow-hidden rounded-media bg-slot"
          >
            <Image
              src={aboutSection.image}
              alt={aboutSection.imageAlt}
              fill
              sizes="(max-width: 860px) 100vw, 34vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
