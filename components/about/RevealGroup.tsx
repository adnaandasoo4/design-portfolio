"use client";

/*
 * RevealGroup — shared About-page scroll-reveal wrapper. Any descendant marked
 * [data-reveal] rises in once on enter (§A7 #9 vocabulary: y 28→0, opacity,
 * .6s ease-out-quart, stagger .06, once). Motion lives ONLY in the matchMedia
 * default branch — the static markup is already the reduced-motion fallback,
 * so nothing is ever hidden for opted-in reduced-motion users.
 */

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap/register";
import { EASE, MQ } from "@/lib/gsap/motion";

export default function RevealGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      // Default branch = full motion design (§A7 rule).
      mm.add(MQ.motionOk, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
        if (!items.length) return;

        gsap.set(items, { y: 28, autoAlpha: 0 });
        const triggers = ScrollTrigger.batch(items, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              y: 0,
              autoAlpha: 1,
              duration: 0.6,
              ease: EASE.outQuart,
              stagger: 0.06,
            }),
        });

        return () => triggers.forEach((t) => t.kill());
      });

      // Reduced branch: intentionally empty — default styles are visible.
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
