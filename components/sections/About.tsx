"use client";

/*
 * About (§A6 #2) — the home page's scroll set piece.
 *
 * One paragraph, centred and spanning the page, and nothing else: the
 * picture and the "Myself" index are both gone (user, 2026-09-04). The
 * section is the sentence and the way it moves.
 *
 * ── HOW IT WORKS ─────────────────────────────────────────────────────────
 * The paragraph is set NORMALLY in the markup — left-aligned, ordinary word
 * spacing, ragged right. Every gap that opens is a per-word `x` transform,
 * and that is the whole trick.
 *
 * Each line is measured for SLACK: the room between where its last word
 * naturally ends and the right edge of the measure. That slack is what the
 * line has to give away. As it is handed out, the line's last word walks to
 * the right edge and the paragraph arrives justified — without ever having
 * been justified, and without a single re-wrap, because the browser fixed
 * the line breaks once before any transform was applied.
 *
 * ── ONE WAY, NOT BACK AND FORTH (user, 2026-09-04) ───────────────────────
 * The previous version oscillated: every gap ran a sine, so words drifted
 * open and shut and open again for as long as you scrolled. That reads as
 * fidgeting. Now each gap has a WINDOW — a start and an end in scroll
 * progress — and inside it eases from shut to its final share exactly once.
 * Past its window it holds. Scroll on and nothing moves back; scroll up and
 * it rewinds, because it is a position rather than a playback.
 *
 * ── STILL SPORADIC ───────────────────────────────────────────────────────
 * The windows are what keeps it from being one block inflating. Every gap
 * opens at a different point and takes a different length of scroll to do
 * it, so at any moment some are already wide, some are mid-move and some
 * have not started — the paragraph comes apart in pieces rather than all at
 * once. Its final share of the slack is uneven too, so the settled spacing
 * looks set by hand.
 *
 * Windows live inside SPREAD_FROM..SPREAD_TO rather than the full transit,
 * so the paragraph finishes opening while it is still comfortably on screen
 * and then simply holds as it leaves. Every start, length and share comes
 * from a hash of the gap's index — deterministic, so the paragraph never
 * re-spaces itself between loads.
 *
 * Doing this with transforms rather than by animating `word-spacing` is what
 * keeps it affordable: word-spacing is a layout property, so animating it
 * would re-wrap and re-lay-out the paragraph on every frame of every scroll.
 * Same result on screen, different cost entirely.
 *
 * ── MOBILE AND REDUCED MOTION ────────────────────────────────────────────
 * Neither exists below 700px: no split, and the statement is exactly what
 * the markup says — an ordinary paragraph. Justified-by-transform at phone
 * measure is three words a line with canyons between them. Reduced motion
 * opts out the same way.
 */
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, SplitText } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";
import { aboutSection } from "@/content/copy";

/** Desktop, and only when motion is welcome. */
const MQ_SET_PIECE = `${MQ.desktop} and ${MQ.motionOk}`;

/** A line never gives up more than this share of its own width to gaps.
 *  Raised from 0.32 when the picture went and the measure widened — there is
 *  far more room to travel now, and the user asked for the move to be more
 *  drastic with it. The cap still matters for the LAST line, which is short
 *  and therefore nearly all slack. */
const MAX_SPREAD = 0.5;

/** Where the opening happens inside the section's transit. Bounded well
 *  short of 1 so the paragraph finishes while it is still on screen and
 *  holds, rather than completing on its way out of frame. */
const SPREAD_FROM = 0.08;
const SPREAD_TO = 0.78;

/** How long a single gap takes, as a share of the whole transit. The spread
 *  between the two is what staggers the paragraph apart. */
const WINDOW_MIN = 0.16;
const WINDOW_MAX = 0.42;

/** Deterministic 0..1 from an integer. Not Math.random: the spacing has to
 *  be identical on every load, or the paragraph would re-space itself on a
 *  refresh. */
function hash01(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Smootherstep — flat at both ends, so a gap neither starts nor stops
 *  abruptly as it enters and leaves its window. */
function ease(t: number) {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * c * (c * (c * 6 - 15) + 10);
}

type Line = {
  /** One setter per word; index 0 never moves, it anchors the line. */
  setters: ((value: number) => void)[];
  /** Per-GAP — each array is setters.length - 1 long. */
  share: number[];
  from: number[];
  to: number[];
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

          let lines: Line[] = [];

          /** Read the slack straight out of the browser's own layout. Re-run
           *  on every refresh, since a resize re-wraps every line and every
           *  slack figure with it. */
          const measure = () => {
            const column = statement.clientWidth;
            lines = gsap.utils
              .toArray<HTMLElement>(".ad-line", statement)
              .map((line) => {
                const words = gsap.utils.toArray<HTMLElement>(".ad-word", line);
                if (words.length < 2) return null;

                const first = words[0];
                const last = words[words.length - 1];
                const natural =
                  last.offsetLeft + last.offsetWidth - first.offsetLeft;
                const slack = Math.max(
                  0,
                  Math.min(column - natural, natural * MAX_SPREAD),
                );

                const gaps = words.length - 1;
                // Seeded off the line's length as well as the gap index, so
                // two lines with the same word count still come apart in a
                // different order.
                const seed = words.length * 31;

                const raw = Array.from(
                  { length: gaps },
                  (_, g) => 0.4 + hash01(g + seed),
                );
                const total = raw.reduce((a, b) => a + b, 0);
                const share = raw.map((r) => r / total);

                const from: number[] = [];
                const to: number[] = [];
                for (let g = 0; g < gaps; g++) {
                  const len =
                    WINDOW_MIN +
                    hash01(g + seed + 613) * (WINDOW_MAX - WINDOW_MIN);
                  // Start anywhere that still leaves room for the whole
                  // window inside the spread band, so every gap is finished
                  // by SPREAD_TO and none is left half-open.
                  const latest = SPREAD_TO - len;
                  const start =
                    SPREAD_FROM +
                    hash01(g + seed + 191) * Math.max(0, latest - SPREAD_FROM);
                  from.push(start);
                  to.push(start + len);
                }

                return {
                  setters: words.map((w) => gsap.quickSetter(w, "x", "px")),
                  share,
                  from,
                  to,
                  slack,
                } as Line;
              })
              .filter((l): l is Line => l !== null);
          };

          /**
           * @param p 0..1 across the section's transit
           *
           * Each gap contributes `share · slack` once its own window has
           * run. Because every share is a fraction of one, a fully-open line
           * has given away exactly its slack and not a pixel more — the
           * right edge lands where it was measured to land.
           */
          const apply = (p: number) => {
            for (const line of lines) {
              const gaps = line.from.length;
              let run = 0;
              line.setters[0](0);
              for (let g = 0; g < gaps; g++) {
                const t = (p - line.from[g]) / (line.to[g] - line.from[g]);
                run += line.share[g] * line.slack * ease(t);
                line.setters[g + 1](run);
              }
            }
          };

          measure();

          spread = ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              // Zero before measuring, or the offsets read back would
              // include the spread about to be recomputed...
              apply(0);
              measure();
              // ...and put it straight back. A refresh fires on resize and
              // on the font swap, neither of which involves scrolling, so
              // without this the paragraph would sit at its natural spacing
              // until a scroll event that may never come.
              apply(self.progress);
            },
            onUpdate: (self) => apply(self.progress),
          });
        });

        return () => {
          // Built after this callback returns, so both sit outside useGSAP's
          // automatic cleanup and are killed by hand.
          cancelled = true;
          spread?.kill();
          split?.revert();
        };
      });

      // Phones and reduced-motion render the markup exactly as written.

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      id="about"
      ref={scope}
      aria-label="About"
      className="relative z-(--z-section) bg-bg px-5 py-[clamp(160px,24vh,300px)] max-b700:px-4 max-b700:py-24"
    >
      {/* Spans the page, centred, on a tighter inner margin than the site
          gutter — the paragraph is the only thing in the section, so the
          measure is set by the inset rather than by a column beside it. */}
      <div className="mx-auto w-full max-w-[1600px] px-[clamp(0px,4vw,96px)]">
        <p
          data-about-statement=""
          className="font-manrope text-[clamp(28px,4.6vw,74px)]/[1.02] font-bold tracking-[-0.03em] text-ink"
        >
          {aboutSection.statement}
        </p>
      </div>
    </section>
  );
}
