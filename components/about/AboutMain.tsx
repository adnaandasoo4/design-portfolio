"use client";

/*
 * About — the page's main block, and now its opening (user, 2026-09-04).
 *
 * This IS the home page's old About section, moved here whole: the site's
 * shared two-column Spread, the night-desk illustration alone in the left
 * rail, the statement and the narrative on the right. Home ran a two-
 * paragraph teaser of it with a "read more"; that link pointed here, so it
 * is gone — a page does not link to itself — and the piece runs in full
 * instead of in excerpt.
 *
 * It replaces three sections that between them did this job worse:
 * AboutOpening (a full viewport holding one headline), AboutLead (one line
 * alone on a screen) and AboutPortrait (the same illustration again, at
 * 9:16). The page opened with the picture twice and the argument nowhere.
 *
 * The h1 lives here now — it was AboutOpening's — so the page still has
 * exactly one, and it is the first thing in the document rather than the
 * third (§A10).
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
import { about } from "@/content/about";

/** Where the section has to reach before the reveal fires */
const REVEAL_START = "top 75%";

export default function AboutMain() {
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
        gsap.to(risers, {
          y: 0,
          autoAlpha: 1,
          duration: DUR.intro,
          ease: EASE.outQuart,
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: REVEAL_START },
        });

        let split: SplitText | null = null;
        let tween: gsap.core.Tween | null = null;
        let cancelled = false;

        document.fonts.ready.then(() => {
          if (cancelled || !statement) return;
          split = new SplitText(statement, { type: "lines", mask: "lines" });
          tween = gsap.from(split.lines, {
            yPercent: 108,
            duration: DUR.intro,
            ease: EASE.outQuart,
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: REVEAL_START },
          });
        });

        return () => {
          // The split resolves after this callback returns, so its tween is
          // outside useGSAP's automatic cleanup and is killed by hand.
          cancelled = true;
          tween?.kill();
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
        ariaLabel="About"
        rail={
          /* The file is 9:16 and ran the height of the whole section at that
             ratio. Shown at 4:5 and anchored to the top, so object-cover
             takes the crop off the BOTTOM — desk, window and moon stay, bed
             and floor go. The cut is HARD: overflow-hidden and nothing else,
             so the frame reads as a window the picture sits inside rather
             than the picture dissolving into the page. */
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-media bg-slot">
            <Image
              src={about.image.src}
              alt={about.image.alt}
              fill
              sizes="(max-width: 860px) 100vw, 26vw"
              className="object-cover object-top"
              priority
            />
          </div>
        }
      >
        <h1
          data-about-statement=""
          className="font-hkgw text-[clamp(26px,3.4vw,58px)]/[0.98] font-semibold tracking-[-0.018em] text-ink uppercase"
        >
          {about.headline}
        </h1>

        {/* The opening line sets at the lead tier — one step under the
            statement, one over the narrative — so the block reads as an
            argument narrowing rather than a wall starting. */}
        <p
          data-reveal=""
          className="mt-[clamp(28px,4vh,56px)] font-manrope text-lead/[1.45] text-ink"
        >
          {about.opening}
        </p>

        <div className="mt-[clamp(24px,3.4vh,44px)] flex flex-col gap-[1.1em] font-manrope text-meta-lg/[1.85] text-muted-2">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} data-reveal="">
              {paragraph}
            </p>
          ))}
        </div>
      </Spread>
    </div>
  );
}
