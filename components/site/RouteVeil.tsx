"use client";

/*
 * Route transition veil (§A5 / §A7 #18). A fixed #111214 overlay:
 * - leave: `navigateWithVeil` sets html[data-pageleave] → CSS fades the veil
 *   in (.32s), route pushes after 340ms
 * - arrive: the veil remounts (keyed by pathname) and its entrance keyframe
 *   fades 1→0 (.6s)
 * - reduced-motion: CSS disables both — instant swap
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function navigateWithVeil(push: (href: string) => void, href: string) {
  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduced) {
    push(href);
    return;
  }
  document.documentElement.setAttribute("data-pageleave", "");
  window.setTimeout(() => push(href), 340);
}

export default function RouteVeil() {
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const cameFromVeil = html.hasAttribute("data-pageleave");
    html.removeAttribute("data-pageleave");
    // Don't trap focus behind the overlay — land it on <main> (§A10)
    if (mounted.current && cameFromVeil) {
      document.querySelector<HTMLElement>("main")?.focus();
    }
    mounted.current = true;
    const onPageShow = () => html.removeAttribute("data-pageleave");
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [pathname]);

  return (
    <div
      key={pathname}
      data-veil=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-(--z-page-veil) bg-bg"
    />
  );
}
