"use client";

/*
 * Global Lenis smooth-scroll provider (§A7).
 * - reference values from the handoff: lerp .045, wheelMultiplier .9,
 *   touchMultiplier 1.4, smoothWheel true
 * - desktop only: native scroll ≤700px via matchMedia gate
 * - reduced-motion: no Lenis at all (native scroll)
 * - driven by the GSAP ticker; ScrollTrigger.update on every scroll
 *
 * Lenis scrolls the document natively (no transformed wrapper), but the
 * #smooth-wrapper/#smooth-content ids stay — the preloader inerts the
 * wrapper during its lock window.
 */
import { useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";

let lenis: Lenis | null = null;

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
      lenis = new Lenis({
        lerp: 0.045,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
        smoothWheel: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(raf);
        lenis?.destroy();
        lenis = null;
      };
    });
    return () => mm.revert();
  });

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}

/** Route [data-scrollto] clicks through Lenis when present (§A5). */
export function scrollToSection(target: string) {
  const el = document.querySelector<HTMLElement>(target);
  if (!el) return;
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: "smooth" });
}

/** Back-to-top (§A5) — works on every page, Lenis-aware. */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: "smooth" });
}
