"use client";

/*
 * About (§A6 #2) — redesigned 2026-09-02 to sit in the same system as the
 * revamped hero. The previous build was a single centred, deep-indented
 * paragraph at 62px: a layout from the earlier direction, on 36px gutters
 * the rest of the page no longer uses, with no separation between the
 * thesis and the argument supporting it.
 *
 * Now a two-column spread on the hero's own 20px gutters, so the page reads
 * as one grid down its whole length:
 *   LEFT RAIL  mono, grey, --text-meta — the ( about ) label, a hairline,
 *              and the location. It is what earns the two-column split; a
 *              label alone would leave the column looking empty.
 *   RIGHT      the thesis as the section's <h2> in HK Grotesk Wide, then
 *              the argument in the same mono/grey/--text-meta tier the
 *              eyebrow, hero paragraph and reel caption all share.
 *
 * The copy is NOT rewritten — statement and body are the §A6 blurb split at
 * its own sentence break (see content/copy.ts).
 *
 * Weight is the hierarchy against the hero: the h1 there is font-bold, this
 * is font-semibold — which is also the heaviest REAL cut of HK Grotesk Wide
 * we have, so the page's second-largest type is not a second synthesised
 * bold.
 *
 * Motion: the statement reveals line by line on scroll (SplitText, per §A7
 * — split only after document.fonts.ready, reverted on cleanup), the rail
 * and body rise with it. Reduced motion renders everything static.
 */
import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { about, footer } from "@/content/copy";

/** Where the section has to reach before the reveal fires */
const REVEAL_START = "top 75%";

export default function About() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;
      const statement = el.querySelector<HTMLElement>("[data-about-statement]");
      const risers = gsap.utils.toArray<HTMLElement>("[data-about-rise]", el);
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
        // splitting against the fallback would break in the wrong places
        // and leave the reveal staggering rows that no longer exist (§A7).
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
          // tween is outside useGSAP's automatic cleanup and has to be
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
    <section
      id="about"
      ref={scope}
      aria-label="About"
      className="relative z-(--z-about) bg-bg px-5 py-[clamp(140px,20vh,260px)] max-b700:px-4 max-b700:py-24"
    >
      <div className="grid grid-cols-[0.3fr_1fr] gap-x-[6vw] max-b860:grid-cols-1 max-b860:gap-y-12">
        {/* LEFT RAIL — label, hairline, location */}
        <div
          data-about-rise=""
          className="flex flex-col items-start gap-5 font-mono-ui text-meta/[1.6] text-muted-2"
        >
          <p>{about.eyebrow}</p>
          <span aria-hidden="true" className="block h-px w-full bg-line-09" />
          <p className="whitespace-pre-line">{footer.basedIn}</p>
        </div>

        {/* RIGHT — thesis, then the argument */}
        <div>
          <h2
            data-about-statement=""
            className="font-hkgw text-[clamp(26px,3.4vw,58px)]/[0.98] font-semibold tracking-[-0.018em] text-ink uppercase"
          >
            {about.statement}
          </h2>
          <p
            data-about-rise=""
            className="mt-[clamp(28px,4vh,56px)] max-w-[52ch] font-mono-ui text-meta/[1.7] text-muted-2"
          >
            {about.body}
          </p>
        </div>
      </div>
    </section>
  );
}
