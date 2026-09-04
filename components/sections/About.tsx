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
 * The gaps are UNEVEN by design: each one takes a different share of the
 * slack, from a hash of the word's index, so the spacing looks set by hand
 * rather than by an algorithm — which is what the reference actually looks
 * like. The share is deterministic, so it never changes between loads.
 *
 * APART AND TOGETHER: progress drives `sin(p·π)`, so the words are at their
 * natural spacing as the section enters, spread to full justification as it
 * crosses the middle of the viewport, and close again as it leaves. Scroll
 * up and it runs backwards. It is a position, not a playback — the paragraph
 * only ever moves as fast as you scroll it.
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
import ArrowLink from "@/components/site/ArrowLink";
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
  /** Cumulative share of the slack at each word, 0..1. */
  shares: number[];
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

                // One weight per GAP, normalised, then accumulated so each
                // word knows how much of the slack sits to its left.
                const gaps = words.length - 1;
                const weights = Array.from(
                  { length: gaps },
                  (_, g) => 0.45 + hash01(g + words.length * 7),
                );
                const total = weights.reduce((a, b) => a + b, 0);
                const shares = [0];
                let run = 0;
                for (const w of weights) {
                  run += w / total;
                  shares.push(run);
                }

                return {
                  setters: words.map((w) => gsap.quickSetter(w, "x", "px")),
                  shares,
                  slack,
                } as Line;
              })
              .filter((l): l is Line => l !== null);
          };

          const apply = (p: number) => {
            for (const line of lines) {
              const open = line.slack * p;
              for (let i = 0; i < line.setters.length; i++) {
                line.setters[i](line.shares[i] * open);
              }
            }
          };

          measure();

          spread = ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            invalidateOnRefresh: true,
            onRefresh: () => {
              // Zero the transforms before re-measuring, or the offsets we
              // read back would include the spread we are about to recompute.
              apply(0);
              measure();
            },
            // sin(p·pi): closed at both ends of the transit, fully open as
            // the section crosses the middle. Scroll up and it reverses.
            onUpdate: (self) => apply(Math.sin(self.progress * Math.PI)),
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
            className="font-hkgw text-[clamp(26px,4.4vw,72px)]/[1.09] font-semibold tracking-[-0.02em] text-ink"
          >
            {aboutSection.statement}
          </p>

          <div className="mt-[clamp(32px,5vh,64px)]">
            <ArrowLink href={aboutSection.readMoreHref}>
              {aboutSection.readMoreText}
            </ArrowLink>
          </div>
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
