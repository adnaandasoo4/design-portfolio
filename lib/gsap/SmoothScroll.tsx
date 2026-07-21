"use client";

/*
 * Global Lenis smooth-scroll provider (§A7).
 * - reference values from the handoff: lerp .045, wheelMultiplier .9,
 *   touchMultiplier 1.4, smoothWheel true
 * - ALL widths (user 2026-07-21): the slow glide survives on mobile via
 *   syncTouch, which lerps touch/flick scrolling like the wheel path
 * - reduced-motion: no Lenis at all (native scroll)
 * - driven by the GSAP ticker; ScrollTrigger.update on every scroll
 *
 * Lenis scrolls the document natively (no transformed wrapper), but the
 * #smooth-wrapper/#smooth-content ids stay — the preloader inerts the
 * wrapper during its lock window.
 */
import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";

let lenis: Lenis | null = null;

/* One-shot guard: force top-of-page only on the initial page load, never on
   later matchMedia re-inits (breakpoint resize would otherwise jump to 0). */
let forcedTopOnLoad = false;

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Every route change lands at the top of the destination page. Layout
  // effect = pre-paint, and it runs after the new route's children have
  // committed, while the RouteVeil still covers the page — so there is no
  // visible jump. Guarded by the previous pathname so it never fires on
  // mount (refresh-to-top below owns that) nor on same-route re-renders,
  // which keeps in-page anchor scrolling (#footer, disciplines) intact.
  // `#hero` from another page routes home first — top IS that target; any
  // follow-up section scroll (scrollToSection) runs later and still wins.
  useLayoutEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    window.scrollTo(0, 0);
    // Reset Lenis' internal target/animated scroll too, or an in-flight
    // smooth scroll from the previous page would lerp us back down.
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  useGSAP(() => {
    // Always load at the top after a refresh: take scroll restoration away
    // from the browser and pin the position before Lenis initializes. Runs
    // pre-paint (layout effect), once per full page load, so it never fights
    // later in-page anchor scrolling (scrollToSection / #footer links).
    let pendingLenisTop = false;
    if (!forcedTopOnLoad) {
      forcedTopOnLoad = true;
      pendingLenisTop = true;
      if ("scrollRestoration" in window.history)
        window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    const mm = gsap.matchMedia();
    // Every width — only reduced-motion opts out to native scroll.
    mm.add(MQ.motionOk, () => {
      lenis = new Lenis({
        lerp: 0.045,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
        smoothWheel: true,
        // Smooth TOUCH scrolling too — without this, phones/tablets fall
        // back to native momentum and the slow glide disappears.
        syncTouch: true,
      });
      if (pendingLenisTop) lenis.scrollTo(0, { immediate: true, force: true });
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
    // Matching mm.add callbacks ran synchronously above — consume the flag so
    // a later breakpoint change re-initializing Lenis never jumps to top.
    pendingLenisTop = false;
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
