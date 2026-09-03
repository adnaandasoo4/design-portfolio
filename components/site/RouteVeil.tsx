"use client";

/*
 * Route transition veil (§A5 / §A7 #18). A fixed #111214 overlay:
 * - leave: `navigateWithVeil` sets html[data-pageleave] → CSS fades the veil
 *   in (.32s), route pushes after 340ms
 * - arrive: the veil remounts (keyed by pathname) and its entrance keyframe
 *   fades 1→0 (.6s)
 * - reduced-motion: CSS disables both — instant swap
 *
 * EVERY internal route change must go through here, or the page swaps with
 * no veil at all and the site looks like it has two different navigations.
 * `useVeiledRoute` is the one way to do it: Nav, Footer, ArrowLink and the
 * work rows all take their click handler from it. Before 2026-09-03 only
 * Nav and Footer had the behaviour, hand-rolled twice — the About "Read
 * more" and "See All" hard-cut, and the work rows did a full page RELOAD
 * off a bare <a>.
 */
import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

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

/**
 * Returns a click-handler factory for internal route links.
 *
 * @param target where the link goes
 * @param before ran before navigating, whatever the outcome — Nav uses it to
 *               close its panel, so the panel shuts even on a same-page click
 *
 * Modified clicks (⌘/ctrl/shift/alt, middle button) are left to the browser:
 * preventDefault on those would break open-in-new-tab, which the hand-rolled
 * versions this replaces all did.
 */
export function useVeiledRoute() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (target: string, before?: () => void) =>
      (e: MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
          return;
        e.preventDefault();
        before?.();
        if (pathname === target) return;
        navigateWithVeil((href) => router.push(href), target);
      },
    [router, pathname],
  );
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
