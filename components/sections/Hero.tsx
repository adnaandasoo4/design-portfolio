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
 *
 * INTRO (rebuilt 2026-09-03). Every block used to rise 32px and fade in
 * together — the same gesture applied four times, which is a transition
 * rather than an opening. It is now ONE timeline of line reveals, conducted
 * from here so the reel and the type beneath it cannot drift:
 *
 *   1. the reel opens from a centre line — clip-path inset(50%) → inset(0),
 *      the same wipe the work-list marquee uses, so the site opens in a
 *      shape it already speaks;
 *   2. its caption rises out from under the card's bottom edge;
 *   3. the eyebrow, headline and paragraph split into LINES, each in its own
 *      clipping box, and rise through it in DOM order — which is also
 *      top-to-bottom on screen, so the page assembles downward.
 *
 * Nothing fades. A mask reveal and a fade are different claims about where
 * the content came from, and mixing them reads as neither. autoAlpha is set
 * on the text only to hold it unsplit-and-unstyled off the screen until
 * both gates below have opened; it is restored in the same frame the lines
 * start moving, never animated.
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

import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import { hero } from "@/content/copy";
import Showreel from "@/components/sections/Showreel";

/** The reel's closed and open states. Percentages on every side in both,
 *  so the browser can interpolate between them. */
const REEL_SHUT = "inset(50% 0% 50% 0%)";
const REEL_OPEN = "inset(0% 0% 0% 0%)";
/** The caption and the type start a beat inside the reel's own opening, so
 *  the hero reads as one gesture rather than a queue. */
const CAPTION_AT = 0.34;
const LINES_AT = 0.46;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      mm.add(MQ.motionOk, () => {
        const reel = section.querySelector<HTMLElement>("[data-reel-clip]");
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
        if (caption) gsap.set(caption, { yPercent: 108 });
        gsap.set(textEls, { autoAlpha: 0 });

        let split: SplitText | null = null;
        let tl: gsap.core.Timeline | null = null;
        let cancelled = false;
        let fontsReady = false;
        let preloaderDone = false;

        const start = () => {
          if (cancelled || tl || !fontsReady || !preloaderDone) return;

          // linesClass gives every line its own clipping box, so the rise
          // reads as type emerging from an edge rather than sliding.
          split = new SplitText(textEls, {
            type: "lines",
            linesClass: "overflow-hidden",
          });
          // Safe now: each line sits below its own mask, so revealing the
          // element reveals nothing yet.
          gsap.set(textEls, { autoAlpha: 1 });

          tl = gsap.timeline({
            defaults: { duration: DUR.intro, ease: EASE.outQuart },
          });
          if (reel) tl.to(reel, { clipPath: REEL_OPEN }, 0);
          if (caption) tl.to(caption, { yPercent: 0 }, CAPTION_AT);
          tl.from(split.lines, { yPercent: 108, stagger: 0.06 }, LINES_AT);
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
          className="font-manrope text-meta-lg/[1.6] tracking-[0.02em] text-muted-2"
        >
          {hero.eyebrow.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        <div className="mt-[clamp(16px,2.4vh,30px)] flex items-end justify-between gap-[clamp(24px,5vw,90px)] max-b860:flex-col max-b860:items-start max-b860:gap-7">
          <h1
            data-hero-line=""
            className="font-hkgw text-[clamp(34px,4.9vw,86px)]/[0.88] font-bold tracking-[-0.02em] text-ink uppercase max-b700:text-[6.2vw]"
          >
            {hero.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p
            data-hero-line=""
            className="w-[clamp(250px,26vw,360px)] shrink-0 pb-[0.4em] font-manrope text-meta-lg/[1.6] text-muted-2 max-b860:w-full max-b860:max-w-[440px] max-b860:pb-0"
          >
            {hero.paragraph}
          </p>
        </div>
      </div>
    </section>
  );
}
