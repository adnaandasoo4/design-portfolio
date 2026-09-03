"use client";

/*
 * Hero — centred showreel over a bottom-anchored statement block
 * (user-directed, 2026-09-02; reference = ethansuero.com). Replaces the
 * full-bleed WebGL gradient layout: the section is now flat --color-bg in
 * both themes, and the gradient survives only in the footer band.
 *
 * LAYOUT, top to bottom:
 *   1. the reel, centred in whatever height is left between the fixed nav
 *      and the statement block — which lands it slightly ABOVE the vertical
 *      centre of the viewport, as in the reference;
 *   2. an eyebrow, sentence case (user, 2026-09-02) — its tracking
 *      came in from 0.1em with the capitals, which needed the air that
 *      lowercase does not;
 *   3. the masthead headline (the page's single <h1>, §A10) with the
 *      paragraph BOTTOM-aligned to its last line — `items-end` is doing
 *      that, not a hand-tuned offset, so it holds at every width.
 *
 * Eyebrow and paragraph are the page's secondary tier: both grey
 * (--color-muted-2) against the white headline, both Manrope, and both on
 * the shared --text-meta-lg size the showreel caption also uses — one
 * tier in size AND family, so the three cannot drift apart. That token is a
 * step larger than the site-wide --text-meta (user, 2026-09-03); the hero
 * is the only screen with the room for it. The paragraph's column
 * is wider than the measure strictly needs: it was set against the system
 * mono this tier used until 2026-09-03, which sets roughly a fifth wider
 * per character, and has not been retightened for Manrope.
 *
 * The masthead is font-bold (700), which the browser SYNTHESISES — only
 * Regular (400) and SemiBold (600) cuts of HK Grotesk Wide are in
 * app/fonts/. Chosen knowingly (user, 2026-09-02) to get the reference's
 * weight now; drop a real Bold OTF in and this becomes a true cut with no
 * other change.
 *
 * Bottom padding is the nav's own top gutter (20px, 16px on phones), so the
 * statement sits as far off the bottom edge as the nav sits off the top —
 * the two margins are deliberately the same number. Nothing else may live
 * in the bottom-right corner at that depth, which is why the theme toggle
 * moved up into the nav. Below 860px the paragraph stacks under the
 * headline instead of beside it.
 * Below 700px the headline drops off the clamp onto a pure vw size — the
 * clamp's 34px floor is wider than a phone can hold at this face's set
 * width, and the authored line breaks would start wrapping a second time.
 * That vw figure went 6.2 → 9.4 and the secondary tier 15 → 17px (user,
 * 2026-09-03): the clamps are authored for a desktop measure, and at the
 * floor of every one of them the phone hero was the quietest screen on the
 * site rather than its loudest. The line-height on the secondary tier eases
 * to 1.5 with the size, as it does everywhere else here.
 *
 * At that size the headline's three authored lines each broke again, so the
 * phone gets four authored lines of its own. The desktop structure is
 * untouched by that — still one block span per desktop line — and the
 * phone's breaks live INSIDE those spans as <br>s that only display below
 * 700px, with the spans going inline there so the halves either side of a
 * break can join. An earlier version stored the whole headline as one flat
 * run of segments and <br>s; it produced the right four lines but replaced
 * the block spans with inline text, which changed how the h1 sizes as a
 * flex item beside the paragraph and broke the DESKTOP breaks.
 *
 * Either way the headline stays one run of text — one copy for screen
 * readers, one element for SplitText — which is what a second hidden
 * variant of the whole headline would have cost.
 *
 * The eyebrow goes the other way — its authored breaks are dropped below
 * 700px and it simply wraps to the measure.
 *
 * INTRO (rebuilt 2026-09-03, twice). ONE gesture, in ONE direction, on ONE
 * ease. Three moves, overlapping so heavily they read as a single event:
 *
 *   1. the reel is WIPED open from its bottom edge upward, while the video
 *      inside it starts oversized and settles to true size as the wipe
 *      lands. The counter-motion is the whole trick — without it a clip
 *      reveal is a rectangle appearing, and with it the reel reads as a
 *      plate sliding into place behind a window;
 *   2. the caption rises out from under the card's bottom edge;
 *   3. eyebrow, headline and paragraph split into LINES, each masked, and
 *      rise through it — DOM order, which is also top-to-bottom on screen.
 *
 * The first attempt opened the reel from its CENTRE line and ran everything
 * on power3 at .85s. Both were wrong. A centre-out clip on 16:9 video reads
 * as the picture being un-squashed vertically, and it pulled against text
 * that was rising — two directions, so neither registered. Everything moves
 * one way now, on expo.out over DUR.open, which is long enough for the
 * settle to be seen rather than merely completed.
 *
 * Nothing fades. A mask reveal and a fade are different claims about where
 * the content came from. autoAlpha is set on the text only to hold it
 * unsplit and off-screen until both gates below have opened; it is restored
 * in the same frame the lines start moving, never animated.
 *
 * Masks come from SplitText's own `mask: "lines"` rather than a linesClass
 * of overflow-hidden. GSAP sizes those wrappers itself, which is the safer
 * of the two at the headline's 0.88 leading — a hand-rolled box is exactly
 * the line height, with nothing spare for a cap or an accent.
 *
 * TWO GATES, and the timeline needs both: markPreloaderDone (the off-black
 * has finished expanding) and document.fonts.ready (§A7 — split against the
 * fallback face and the lines break in the wrong places, then the real face
 * loads and the masks clip rows that no longer exist). Either can land
 * first, so each one calls `start` and `start` runs only when both are in.
 *
 * Reduced motion: the branch is intentionally empty — no split, no clip, the
 * markup renders visible and complete.
 */

import { Fragment, useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import { hero } from "@/content/copy";
import Showreel from "@/components/sections/Showreel";

/** The reel's closed and open clips. `inset(100% 0 0 0)` collapses the box
 *  onto its BOTTOM edge, so opening to inset(0) grows it upward — the same
 *  direction every line beneath it travels. Percentages on all four sides in
 *  both states, so the browser can interpolate between them. */
const REEL_SHUT = "inset(100% 0% 0% 0%)";
const REEL_OPEN = "inset(0% 0% 0% 0%)";
/** How much larger than its frame the video starts. Enough to be felt as it
 *  settles, not so much that the crop visibly changes. */
const REEL_OVERSCAN = 1.22;
/** The settle outlasts the wipe, so the reel is still arriving after its
 *  edge has stopped — the part that reads as weight. */
const SETTLE_STRETCH = 1.3;

/** A phone-only line break inside a desktop line. Always in the DOM; only
 *  its `display` changes, so the headline is one run of text for screen
 *  readers and one element for SplitText either way. */
const PHONE_BREAK = "hidden max-b700:inline";

/* Timeline positions, in seconds. Every move starts before the one above it
   has finished; played end to end this is a queue, not an opening. */
const CAPTION_AT = 0.32;
const LINES_AT = 0.42;
const LINE_STAGGER = 0.075;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      mm.add(MQ.motionOk, () => {
        const reel = section.querySelector<HTMLElement>("[data-reel-clip]");
        const media = section.querySelector<HTMLElement>("[data-reel-media]");
        const caption =
          section.querySelector<HTMLElement>("[data-reel-caption]");
        const textEls = gsap.utils.toArray<HTMLElement>(
          "[data-hero-line]",
          section,
        );

        // Closed state, set before the first paint. The text is held with
        // autoAlpha rather than a mask because its masks do not exist yet —
        // SplitText makes them, and only once the font has landed.
        if (reel) gsap.set(reel, { clipPath: REEL_SHUT });
        if (media) gsap.set(media, { scale: REEL_OVERSCAN });
        if (caption) gsap.set(caption, { yPercent: 100 });
        gsap.set(textEls, { autoAlpha: 0 });

        let split: SplitText | null = null;
        let tl: gsap.core.Timeline | null = null;
        let cancelled = false;
        let fontsReady = false;
        let preloaderDone = false;

        const start = () => {
          if (cancelled || tl || !fontsReady || !preloaderDone) return;

          // `mask: "lines"` wraps every line in a clipping box GSAP sizes
          // itself; see the note above on why that beats a hand-rolled
          // overflow-hidden at this leading.
          split = new SplitText(textEls, { type: "lines", mask: "lines" });
          // Safe now: each line sits below its own mask, so revealing the
          // element reveals nothing yet.
          gsap.set(textEls, { autoAlpha: 1 });

          tl = gsap.timeline({
            defaults: { duration: DUR.open, ease: EASE.outExpo },
          });
          if (reel) tl.to(reel, { clipPath: REEL_OPEN }, 0);
          if (media)
            tl.to(media, { scale: 1, duration: DUR.open * SETTLE_STRETCH }, 0);
          if (caption) tl.to(caption, { yPercent: 0 }, CAPTION_AT);
          tl.from(split.lines, { yPercent: 100, stagger: LINE_STAGGER }, LINES_AT);
        };

        document.fonts.ready.then(() => {
          fontsReady = true;
          start();
        });
        const offPreloader = onPreloaderDone(() => {
          preloaderDone = true;
          start();
        });

        return () => {
          // Both gates resolve after this callback returns, so the timeline
          // and the split are outside useGSAP's automatic cleanup and are
          // killed by hand.
          cancelled = true;
          offPreloader();
          tl?.kill();
          split?.revert();
          gsap.set(textEls, { clearProps: "visibility,opacity" });
          if (reel) gsap.set(reel, { clearProps: "clipPath" });
          if (media) gsap.set(media, { clearProps: "transform" });
          if (caption) gsap.set(caption, { clearProps: "transform" });
        };
      });

      // Reduced-motion branch: intentionally empty — the markup renders
      // visible and complete by default.

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Hero"
      className="relative z-(--z-section) flex h-svh flex-col bg-bg px-5 pt-[92px] pb-5 max-b700:px-4 max-b700:pt-[76px] max-b700:pb-4"
    >
      {/* Reel — centred in the space the statement block leaves over */}
      <div className="flex flex-1 items-center justify-center">
        <Showreel />
      </div>

      {/* Statement block — anchored to the bottom of the viewport */}
      <div className="shrink-0">
        <p
          data-hero-line=""
          className="font-manrope text-meta-lg/[1.6] tracking-[0.02em] text-muted-2 max-b700:text-[17px]/[1.5]"
        >
          {/* Block on desktop, so the authored breaks hold; inline below
              700px, so the two lines run together and wrap to the phone's
              measure rather than breaking twice (user, 2026-09-03). The
              trailing space only separates words once they are inline — it
              collapses under `block`. */}
          {hero.eyebrow.map((line) => (
            <span key={line} className="block max-b700:inline">
              {line}{" "}
            </span>
          ))}
        </p>

        <div className="mt-[clamp(16px,2.4vh,30px)] flex items-end justify-between gap-[clamp(24px,5vw,90px)] max-b860:flex-col max-b860:items-start max-b860:gap-7">
          <h1
            data-hero-line=""
            className="font-hkgw text-[clamp(34px,4.9vw,86px)]/[0.88] font-bold tracking-[-0.02em] text-ink uppercase max-b700:text-[9.4vw]"
          >
            {hero.headline.map((parts, i) => (
              /* Every line is a block on desktop — the structure this has
                 always had. Below 700px all but the LAST go inline, so the
                 halves either side of a phone break can join across desktop
                 lines ("WEBSITES" + "THAT"). The last stays block because on
                 the phone it must still start its own line rather than run
                 on from the one above. */
              <span
                key={parts.join(" ")}
                className={
                  i < hero.headline.length - 1
                    ? "block max-b700:inline"
                    : "block"
                }
              >
                {parts.map((part, j) => (
                  <Fragment key={part}>
                    {j > 0 ? " " : null}
                    {part}
                    {j < parts.length - 1 ? (
                      <br aria-hidden="true" className={PHONE_BREAK} />
                    ) : null}
                  </Fragment>
                ))}
                {/* Separates this line from the next once they are inline;
                    collapses at the end of a block. */}{" "}
              </span>
            ))}
          </h1>

          <p
            data-hero-line=""
            className="w-[clamp(250px,26vw,360px)] shrink-0 pb-[0.4em] font-manrope text-meta-lg/[1.6] text-muted-2 max-b860:w-full max-b860:max-w-[440px] max-b860:pb-0 max-b700:text-[17px]/[1.5]"
          >
            {hero.paragraph}
          </p>
        </div>
      </div>
    </section>
  );
}
