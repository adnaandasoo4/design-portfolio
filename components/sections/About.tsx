"use client";

/*
 * About (§A6 #2) — the mission blurb, in the site's shared two-column
 * Spread. The previous build was a single centred, deep-indented paragraph
 * at 62px: a layout from the earlier direction, on 36px gutters the rest of
 * the page no longer uses, setting the thesis and the argument supporting
 * it as one undifferentiated block.
 *
 * Now the rail carries the label and the location, and the right column
 * carries the thesis as the section's <h2> — which it never had — followed
 * by the argument in the same mono/grey/--text-meta tier the hero's eyebrow,
 * paragraph and reel caption all share.
 *
 * The layout itself lives in components/site/Spread, shared with the
 * Branding page, so the two cannot drift apart.
 *
 * Copy is NOT rewritten: statement and body are the §A6 blurb split at its
 * own sentence break, and aboutBlurb is derived by reassembling them.
 *
 * Weight is the hierarchy against the hero: the h1 there is font-bold, this
 * is font-semibold — which is also the heaviest REAL cut of HK Grotesk Wide
 * in the project, so the page's second-largest type is not a second
 * synthesised bold.
 *
 * Motion: the statement reveals line by line on scroll (SplitText, per §A7 —
 * split only after document.fonts.ready, reverted on cleanup); the rail and
 * body rise with it off the shared [data-reveal] hook. Reduced motion
 * renders everything static.
 */
import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import Spread from "@/components/site/Spread";
import { aboutSection, footer } from "@/content/copy";

/** Where the section has to reach before the reveal fires */
const REVEAL_START = "top 75%";

export default function About() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;
      const statement = el.querySelector<HTMLElement>("[data-about-statement]");
      const risers = gsap.utils.toArray<HTMLElement>("[data-reveal]", el);
      const mm = gsap.matchMedia();

      mm.add(MQ.motionOk, () => {
        gsap.set(risers, { y: 26, autoAlpha: 0 });
        const riseTween = gsap.to(risers, {
          y: 0,
          autoAlpha: 1,
          duration: DUR.intro,
          ease: EASE.outQuart,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
        });

        // Lines can only be measured once the real face has loaded —
        // splitting against the fallback breaks in the wrong places and
        // leaves the reveal staggering rows that no longer exist (§A7).
        let split: SplitText | null = null;
        let lineTween: gsap.core.Tween | null = null;
        let cancelled = false;

        document.fonts.ready.then(() => {
          if (cancelled || !statement) return;
          split = new SplitText(statement, { type: "lines" });
          lineTween = gsap.from(split.lines, {
            y: 34,
            autoAlpha: 0,
            duration: DUR.intro,
            ease: EASE.outQuart,
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
          });
        });

        return () => {
          // The split resolves after this callback has returned, so its
          // tween sits outside useGSAP's automatic cleanup and has to be
          // killed by hand — ScrollTrigger included.
          cancelled = true;
          riseTween.scrollTrigger?.kill();
          riseTween.kill();
          lineTween?.scrollTrigger?.kill();
          lineTween?.kill();
          split?.revert();
        };
      });

      // Reduced motion: intentionally empty — the markup renders visible.

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope}>
      <Spread
        id="about"
        ariaLabel="About"
        eyebrow={aboutSection.eyebrow}
        note={footer.basedIn}
        className="z-(--z-about)"
      >
        <h2
          data-about-statement=""
          className="font-hkgw text-[clamp(26px,3.4vw,58px)]/[0.98] font-semibold tracking-[-0.018em] text-ink uppercase"
        >
          {aboutSection.statement}
        </h2>
        <p
          data-reveal=""
          className="mt-[clamp(28px,4vh,56px)] max-w-[52ch] font-mono-ui text-meta/[1.7] text-muted-2"
        >
          {aboutSection.body}
        </p>
      </Spread>
    </div>
  );
}
