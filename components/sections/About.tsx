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
 * spacing, ragged right. Every gap you see is a per-word `x` transform.
 *
 * Each line is measured for its GAP BUDGET: every natural word gap on it
 * plus whatever room the line was not using. The line is then laid out from
 * scratch — first word on the left edge, each next word after a gap of its
 * own share of that budget — and because the shares always total 1, the gaps
 * always total the budget and the last word lands on the right edge. The
 * paragraph is edge to edge from the moment it appears (user, 2026-09-04);
 * it never arrives tight and opens up.
 *
 * Redistributing the WHOLE budget, rather than only the leftover room, is
 * what lets a line that already fills the measure still come apart — a gap
 * can shrink below its natural width so another opens far past it. An
 * earlier version divided only the leftover, which left the lines that
 * happened to wrap near-flush with one to three pixels of movement, i.e.
 * none.
 *
 * ── WHAT SCROLLING CHANGES ───────────────────────────────────────────────
 * Not how MUCH room is given away — that is always all of it — but WHERE it
 * goes. Every gap holds a share of the room, and each share migrates from
 * one uneven value to a different uneven value across the section's transit.
 * Room moves between gaps: one can only widen by another narrowing. So the
 * line stays pinned to both edges while its interior rearranges, which is
 * what makes the words look displaced all over rather than justified.
 *
 * The end shares are the start shares ROTATED along the line: each gap ends
 * up with the width of one some distance away from it, so room travels
 * bodily across the measure as you scroll. Two alternatives were tried and
 * rejected — a second independent hash normalises to nearly the same numbers
 * and moved each gap a pixel or two, and the head's exact complement moves
 * plenty but passes THROUGH even spacing at the halfway point, arriving just
 * as the section crosses the middle of the screen. A rotation blends two
 * different uneven states, so the line is irregular at every point of the
 * scroll and never flattens out.
 *
 * MORE, THE FURTHER YOU GO: progress is eased IN (t·t), so the shares barely
 * move as the section enters and move fastest as it crosses and leaves. The
 * paragraph gets visibly more restless the further you scroll it.
 *
 * ── ONE WAY, NOT BACK AND FORTH (user, 2026-09-04) ───────────────────────
 * Each share travels from its start value to its end value and stops. It is
 * an interpolation between two fixed numbers, so no gap can reverse, and no
 * word can drift back the way it came. Scroll up and the whole thing rewinds
 * — it is a position, not a playback.
 *
 * Interpolating between two sets of weights that each sum to 1 is also what
 * makes this safe: any blend of them also sums to 1, and every weight stays
 * positive, so a gap can never collapse to nothing or overrun the measure.
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

/** How irregular the spacing is. Each gap's weight is 1 + up to this much
 *  extra, so at 2.2 the widest gap on a line can be roughly 3.2x the
 *  narrowest. Raise it for a more scattered setting, lower it toward 0 for
 *  something close to ordinary justification. */
const IRREGULARITY = 2.2;

/** Every gap is guaranteed this much before any share is divided out, so the
 *  narrowest gap on a line can never pull two words into each other. */
const MIN_GAP = 14;

/** ...but the floor never takes more than this much of a line's per-gap
 *  budget, so there is always most of it left for the shares to divide
 *  unevenly. Without the cap, a line that already fills the measure spent
 *  everything on floors and came out perfectly regular. */
const FLOOR_MAX_SHARE = 0.4;

/** Deterministic 0..1 from an integer. Not Math.random: the spacing has to
 *  be identical on every load, or the paragraph would re-space itself on a
 *  refresh. */
function hash01(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Eased IN, deliberately: barely moving as the section enters, moving
 *  fastest as it crosses and leaves. That is what makes the paragraph read
 *  as getting more restless the further it is scrolled, rather than
 *  rearranging at a constant rate throughout. */
function ease(t: number) {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c;
}

type Line = {
  setters: ((value: number) => void)[];
  /** Per-GAP share of the gap budget at each end of the transit. Both sum to
   *  1, which is what keeps every blend of them safe. */
  head: number[];
  tail: number[];
  /** Where each word sits at its natural setting, relative to the line's
   *  start — what the transforms are measured against. */
  natural: number[];
  widths: number[];
  /** Total width of every gap once the line fills the measure. Fixed, so
   *  however the gaps divide it the line still runs edge to edge. */
  budget: number;
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
          /** Read each line's room straight out of the browser's own layout.
           *  Re-run on every refresh, since a resize re-wraps every line and
           *  changes every room figure with it. */
          const measure = () => {
            const column = statement.clientWidth;
            lines = gsap.utils
              .toArray<HTMLElement>(".ad-line", statement)
              .map((line) => {
                const words = gsap.utils.toArray<HTMLElement>(".ad-word", line);
                if (words.length < 2) return null;

                const first = words[0];
                const last = words[words.length - 1];
                // Where every word sits, and how wide every natural gap is,
                // measured from the line's own start.
                const origin = first.offsetLeft;
                const natural = words.map((w) => w.offsetLeft - origin);
                const naturalGaps: number[] = [];
                for (let g = 0; g < words.length - 1; g++) {
                  naturalGaps.push(
                    natural[g + 1] - (natural[g] + words[g].offsetWidth),
                  );
                }

                const used = last.offsetLeft + last.offsetWidth - origin;
                const room = Math.max(0, column - used);
                // The budget is EVERY gap on the line plus the room left
                // over. Redistributing the whole budget rather than only the
                // leftover is what lets a line that already fills the measure
                // still come apart: a gap can shrink below its natural width
                // so another can open far past it. Distributing only the
                // leftover left such lines with 1-3px of movement — nothing.
                const gapTotal = naturalGaps.reduce((a, b) => a + b, 0);
                const budget = gapTotal + room;

                const gaps = words.length - 1;
                // Seeded off the line's length as well as the gap index, so
                // two lines with the same word count rearrange differently.
                const seed = words.length * 31;

                /** Normalised so the shares sum to exactly 1 — that is the
                 *  invariant the whole thing rests on. */
                const normalise = (raw: number[]) => {
                  const total = raw.reduce((a, b) => a + b, 0);
                  return raw.map((r) => r / total);
                };

                const rawHead = Array.from(
                  { length: gaps },
                  (_, g) => 1 + hash01(g + seed) * IRREGULARITY,
                );
                // The tail is the head ROTATED — every gap inherits the width
                // of one some distance along the line. Two things this beats:
                //
                //   a second independent hash, which normalises to almost the
                //   same numbers and moved each gap a pixel or two;
                //
                //   the head's complement (widest becomes narrowest), which
                //   moves plenty but interpolates THROUGH uniform spacing at
                //   the halfway point — the one setting that looks like
                //   nothing is happening, arriving exactly as the section
                //   crosses the middle of the screen.
                //
                // A rotation keeps every intermediate state a blend of two
                // DIFFERENT uneven values, so the line is irregular at every
                // point of the scroll and never passes through even.
                const shift = 1 + Math.floor(gaps / 2);
                const rawTail = rawHead.map(
                  (_, g) => rawHead[(g + shift) % gaps],
                );

                return {
                  setters: words.map((w) => gsap.quickSetter(w, "x", "px")),
                  head: normalise(rawHead),
                  tail: normalise(rawTail),
                  natural,
                  widths: words.map((w) => w.offsetWidth),
                  budget,
                } as Line;
              })
              .filter((l): l is Line => l !== null);
          };

          /**
           * @param p 0..1 across the section's transit
           *
           * Lays the line out from scratch: first word on the left edge, then
           * each following word placed after a gap of its own share of the
           * budget. Since the shares always sum to 1 the gaps always total the
           * budget exactly, so the last word lands on the right edge at every
           * scroll position — the line is edge to edge throughout, and what p
           * changes is only how the budget divides between the gaps.
           *
           * Every gap keeps a floor first and divides only what is left
           * over, so a gap at the bottom of its share can never close to the
           * point of running two words together. The floor is MIN_GAP or the
           * line's fair share of its budget, whichever is smaller.
           */
          const apply = (p: number) => {
            const t = ease(p);
            for (const line of lines) {
              const gaps = line.head.length;
              // The floor is MIN_GAP, but never more than FLOOR_MAX_SHARE of
              // what the line has to spend per gap. Two failures this avoids,
              // both seen: applied flat, a line whose budget is under
              // gaps x MIN_GAP had every gap widened to the floor and overran
              // the right edge; clamped to the full average, the floor ate the
              // entire budget and left nothing to divide, so every gap on a
              // near-full line came out identical. Leaving most of the budget
              // to the shares is what keeps even a tight line irregular.
              const floor = Math.min(
                MIN_GAP,
                (FLOOR_MAX_SHARE * line.budget) / gaps,
              );
              const spare = line.budget - floor * gaps;

              let cursor = 0;
              line.setters[0](0);
              for (let g = 0; g < gaps; g++) {
                const share = line.head[g] + (line.tail[g] - line.head[g]) * t;
                cursor += line.widths[g] + floor + share * spare;
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
          className="font-manrope text-[clamp(26px,4vw,64px)]/[1.06] font-semibold tracking-[-0.03em] text-ink"
        >
          {aboutSection.statement}
        </p>
      </div>
    </section>
  );
}
