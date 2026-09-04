"use client";

/*
 * About (§A6 #2) — the home page's scroll set piece.
 *
 * One paragraph, centred and spanning the page, and nothing else. The section
 * is the sentence and the way it moves.
 *
 * ── WHAT IT DOES ─────────────────────────────────────────────────────────
 * The paragraph is set NORMALLY in the markup — left-aligned, ordinary word
 * spacing, ragged right. Every position you see is a per-word `x` transform.
 * The browser fixes the line breaks once, before any transform is applied,
 * so nothing ever re-wraps however far the words travel.
 *
 * It is ALWAYS displaced. There is no tidy state it starts from or settles
 * into — at every scroll position the spacing is uneven, and scrolling moves
 * it to a different uneven arrangement. Three things move at once, each on
 * its own cycle:
 *
 *   GAPS   every gap holds a share of the line's gap budget, and each share
 *          rides its own sine as you scroll, so gaps trade width back and
 *          forth continuously. Shares are normalised every frame, so a gap
 *          can only widen by another narrowing.
 *   WIDTH  the budget itself breathes between BUDGET_MIN of the measure and
 *          all of it, so the line is sometimes flush edge to edge and
 *          sometimes drawn in short of it.
 *   SLIDE  whatever the line is not using, it slides across — so when it is
 *          short of the measure it is also off-centre, and by a changing
 *          amount.
 *
 * WIDTH and SLIDE are why the first and last words move. An earlier version
 * pinned every line to both edges, which held the whole budget constant and
 * left the outermost words nailed in place while only the middle churned —
 * the user's words were that the edge words looked stuck. They are the two
 * most visible words on a line; if they do not move, nothing reads as moving.
 *
 * BACK AND FORTH, deliberately (user, 2026-09-04). A previous pass ran each
 * gap one way only, from one arrangement to another. That was a correction to
 * the pass before it, which started from normal spacing and opened up — but
 * the objection there was the tidy STARTING POINT, not the fact that it kept
 * moving. Sines restore the movement and keep the displacement.
 *
 * Every phase and frequency comes from a hash of an index, so the paragraph
 * moves identically on every load rather than reshuffling on refresh. And it
 * is a position, not a playback: scroll up and every word retraces exactly.
 *
 * Transforms rather than animating `word-spacing`, which is a layout property
 * and would re-wrap and re-lay-out the paragraph on every frame of every
 * scroll. Same result on screen, different cost entirely.
 *
 * ── MOBILE AND REDUCED MOTION ────────────────────────────────────────────
 * Neither exists below 700px: no split, and the statement is exactly what the
 * markup says — an ordinary paragraph. This at phone measure is three words a
 * line with canyons between them. Reduced motion opts out the same way.
 */
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, SplitText } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";
import { aboutSection } from "@/content/copy";

/** Desktop, and only when motion is welcome. */
const MQ_SET_PIECE = `${MQ.desktop} and ${MQ.motionOk}`;

/** How uneven the gaps get. A gap's weight is 1 + up to this much, so at 3
 *  the widest gap on a line can be around 4x the narrowest. */
const IRREGULARITY = 3;

/** The narrowest a line ever draws itself, as a share of the room it has to
 *  fill. At 0.62 a line pulls in to roughly two thirds of the measure at the
 *  bottom of its cycle and runs flush at the top — that swing is what gets
 *  the first and last words moving. */
const BUDGET_MIN = 0.62;

/** Every gap keeps this much before any share is divided out, so the
 *  narrowest never runs two words together — but never more than
 *  FLOOR_MAX_SHARE of what the line has to spend per gap, or a line that is
 *  nearly full spends everything on floors and comes out perfectly regular. */
const MIN_GAP = 14;
const FLOOR_MAX_SHARE = 0.4;

/** Cycles across one pass of the section. Kept low, and spread, so the parts
 *  drift out of step with each other rather than pulsing together. */
const CYCLE_MIN = 1.2;
const CYCLE_MAX = 3.1;

const TAU = Math.PI * 2;

/** Deterministic 0..1 from an integer. Not Math.random: the paragraph has to
 *  move identically on every load rather than reshuffling on refresh. */
function hash01(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** A 0..1 wave for `progress`, on its own phase and rate. */
function wave(progress: number, seed: number) {
  const rate = CYCLE_MIN + hash01(seed) * (CYCLE_MAX - CYCLE_MIN);
  return 0.5 + 0.5 * Math.sin(progress * TAU * rate + hash01(seed + 97) * TAU);
}

type Line = {
  setters: ((value: number) => void)[];
  widths: number[];
  /** Where each word sits untouched, relative to the line's start — what the
   *  transforms are measured against. */
  natural: number[];
  /** Total gap width when the line runs flush across the whole measure. */
  fullBudget: number;
  /** Room the line has to move in once it is at its narrowest. */
  measure: number;
  /** Per-gap seeds for the share waves, plus two for the line itself. */
  gapSeed: number[];
  widthSeed: number;
  slideSeed: number;
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
          // Reused every frame — this runs on every scroll event, so the
          // per-frame work allocates nothing.
          const shares: number[] = [];

          /** Read the untouched layout straight out of the browser. Re-run on
           *  every refresh, since a resize re-wraps every line. */
          const measure = () => {
            const measureW = statement.clientWidth;
            lines = gsap.utils
              .toArray<HTMLElement>(".ad-line", statement)
              .map((line) => {
                const words = gsap.utils.toArray<HTMLElement>(".ad-word", line);
                if (words.length < 2) return null;

                const origin = words[0].offsetLeft;
                const natural = words.map((w) => w.offsetLeft - origin);
                const widths = words.map((w) => w.offsetWidth);
                const last = words[words.length - 1];
                const used = last.offsetLeft + last.offsetWidth - origin;

                // Every natural gap on the line, plus the room it was not
                // using. Redistributing the WHOLE of that rather than only the
                // leftover is what lets a line which already fills the measure
                // still come apart — a gap can shrink below its natural width
                // so another opens far past it.
                const textWidth = widths.reduce((a, b) => a + b, 0);
                const fullBudget = Math.max(0, measureW - textWidth);

                const gaps = words.length - 1;
                // Seeded off the line's length as well as the index, so two
                // lines with the same word count move differently.
                const seed = words.length * 31;

                return {
                  setters: words.map((w) => gsap.quickSetter(w, "x", "px")),
                  widths,
                  natural,
                  fullBudget: fullBudget > 0 ? fullBudget : used,
                  measure: measureW,
                  gapSeed: Array.from({ length: gaps }, (_, g) => g + seed),
                  widthSeed: seed + 3301,
                  slideSeed: seed + 7717,
                } as Line;
              })
              .filter((l): l is Line => l !== null);
          };

          /**
           * @param p 0..1 across the section's transit
           *
           * Lays every line out from scratch: pick this frame's budget, slide
           * the line by whatever of the measure it is not using, then place
           * each word after a gap of its own share.
           *
           * Shares are normalised, so however they move the gaps still total
           * the budget exactly — the line's width is decided by the budget
           * wave alone and never drifts.
           */
          const apply = (p: number) => {
            for (const line of lines) {
              const gaps = line.gapSeed.length;

              // How wide the line draws itself this frame, and where it sits
              // in the room that leaves.
              const budget =
                line.fullBudget *
                (BUDGET_MIN + (1 - BUDGET_MIN) * wave(p, line.widthSeed));
              const slide =
                (line.fullBudget - budget) * wave(p, line.slideSeed);

              let total = 0;
              for (let g = 0; g < gaps; g++) {
                shares[g] = 1 + IRREGULARITY * wave(p, line.gapSeed[g]);
                total += shares[g];
              }

              const floor = Math.min(MIN_GAP, (FLOOR_MAX_SHARE * budget) / gaps);
              const spare = budget - floor * gaps;

              let cursor = slide;
              line.setters[0](cursor);
              for (let g = 0; g < gaps; g++) {
                cursor += line.widths[g] + floor + (shares[g] / total) * spare;
                line.setters[g + 1](cursor - line.natural[g + 1]);
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
              // Zero before measuring, or the offsets read back would include
              // the displacement about to be recomputed...
              for (const line of lines) line.setters.forEach((s) => s(0));
              measure();
              // ...and put it straight back. A refresh fires on resize and on
              // the font swap, neither of which involves scrolling, so without
              // this the paragraph would sit at its untouched spacing until a
              // scroll event that may never come.
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
          className="font-manrope text-[clamp(26px,4vw,64px)]/[1.06] font-semibold tracking-[-0.03em] text-ink"
        >
          {aboutSection.statement}
        </p>
      </div>
    </section>
  );
}
