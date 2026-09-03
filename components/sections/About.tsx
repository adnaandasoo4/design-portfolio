"use client";

/*
 * About (§A6 #2) — the mission blurb, in the site's shared two-column
 * Spread. The previous build was a single centred, deep-indented paragraph
 * at 62px: a layout from the earlier direction, on 36px gutters the rest of
 * the page no longer uses, setting the thesis and the argument supporting
 * it as one undifferentiated block.
 *
 * The section index and the location line are both gone (user, 2026-09-03):
 * the left column is the illustration alone, replacing Spread's default
 * label/hairline/note rail outright. Because the rail is one grid
 * cell under `items-start`, the image's top edge sits level with the
 * heading's without a margin doing the work — which holds at every width,
 * however many lines the heading wraps to.
 *
 * The body runs the full width of its column, matching the heading above it
 * (user, 2026-09-03). That is a long measure for mono, so the tier takes a
 * looser line-height here (1.85) than the two-line captions it was drawn
 * for.
 *
 * The layout itself lives in components/site/Spread, shared with the
 * Branding page, so the two cannot drift apart.
 *
 * The statement is the §A6 blurb's opening sentence, verbatim; the
 * paragraphs under it are new (user, 2026-09-03).
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
import Image from "next/image";
import Spread from "@/components/site/Spread";
import { aboutSection } from "@/content/copy";

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
        className="z-(--z-about)"
        rail={
          /* The file is 9:16 and ran the height of the whole section at that
             ratio. Shown at 4:5 and anchored to the top, so object-cover
             takes the crop off the BOTTOM — desk, window and moon stay, bed
             and floor go. The gradient mask then softens the cut into the
             page instead of ending on a hard horizon, and because a mask
             applies to the element's own background too, the bg-slot
             loading backdrop fades with it rather than showing as a bar. */
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-media bg-slot [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_74%,transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_74%,transparent_100%)]">
            <Image
              src={aboutSection.image}
              alt={aboutSection.imageAlt}
              fill
              sizes="(max-width: 860px) 100vw, 26vw"
              className="object-cover object-top"
            />
          </div>
        }
      >
        <h2
          data-about-statement=""
          className="font-hkgw text-[clamp(26px,3.4vw,58px)]/[0.98] font-semibold tracking-[-0.018em] text-ink uppercase"
        >
          {aboutSection.statement}
        </h2>
        <div className="mt-[clamp(28px,4vh,56px)] flex flex-col gap-[1.4em] font-mono-ui text-meta/[1.85] text-muted-2">
          {aboutSection.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} data-reveal="">
              {paragraph}
            </p>
          ))}
        </div>
      </Spread>
    </div>
  );
}
