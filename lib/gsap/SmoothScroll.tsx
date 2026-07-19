"use client";

/*
 * Global ScrollSmoother provider (§A7).
 * - smooth ≈1.2 (maps the reference's Lenis lerp .045 feel)
 * - effects on (data-speed/data-lag hooks)
 * - smoothTouch 0 + native scroll ≤700px via matchMedia gate
 * - reduced-motion: no smoother at all (native scroll)
 *
 * Fixed chrome (nav, preloader, veil) must live OUTSIDE this wrapper —
 * position:fixed breaks inside the transformed smooth-content element.
 */
import { useRef } from "react";
import { gsap, useGSAP, ScrollSmoother } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapper = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    // Full experience only: desktop width AND no reduced-motion opt-in.
    mm.add(`${MQ.desktop} and ${MQ.motionOk}`, () => {
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
        smoothTouch: 0,
        normalizeScroll: true,
      });
      return () => smoother.kill();
    });
    return () => mm.revert();
  });

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}

/** Route [data-scrollto] clicks through the smoother when present (§A5). */
export function scrollToSection(target: string) {
  const smoother = ScrollSmoother.get();
  const el = document.querySelector(target);
  if (!el) return;
  if (smoother) smoother.scrollTo(el, true);
  else el.scrollIntoView({ behavior: "smooth" });
}

/** Back-to-top (§A5) — works on every page, smoother-aware. */
export function scrollToTop() {
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(0, true);
  else window.scrollTo({ top: 0, behavior: "smooth" });
}
