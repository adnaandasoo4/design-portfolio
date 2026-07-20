"use client";

/*
 * Fixed top nav (§A5 [data-topnav]).
 * - fixed full-width, padding 16px 36px, mix-blend-mode: difference, z-nav 120
 * - container is pointer-events-none; interactive children re-enable
 * - brand + "home" scroll to #hero on "/" (Lenis) or route home
 * - about/work route through the page veil; contact scrolls to #footer
 * - link sweep (§A7 #4): #1d1d21 block enters from the LEFT on hover/focus
 *   and retracts to the RIGHT on leave — .72s / ease-out-expo, pure CSS
 * - intro (§A7 #2): slides down from the top after the preloader
 *   (ease-out-quart .85); reduced-motion branch shows instantly
 */
import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import { navigateWithVeil } from "@/components/site/RouteVeil";
import { scrollToSection } from "@/lib/gsap/SmoothScroll";
import ThemeToggle from "@/components/site/ThemeToggle";
import SayHi from "@/components/site/SayHi";
import { nav as navCopy } from "@/content/copy";

/*
 * Directional sweep highlight ([data-nl-hl]). The trick: transform-origin is
 * NOT in the transition list, so it flips instantly — origin-left while
 * hovered/focused (grows L→R), origin-right at rest (collapses toward the
 * right on leave). Preserves the enter-left / exit-right asymmetry.
 */
const SWEEP =
  "pointer-events-none absolute inset-0 origin-right scale-x-0 bg-raise-2 " +
  "transition-transform duration-(--dur-sweep) ease-(--ease-out-expo) " +
  "group-hover:origin-left group-hover:scale-x-100 " +
  "group-focus-visible:origin-left group-focus-visible:scale-x-100";

const LINK =
  "group pointer-events-auto relative px-4 py-[9px] text-[17px] " +
  "font-medium leading-[1.3] text-ink";

function SweepLabel({ label }: { label: string }) {
  return (
    <>
      <span aria-hidden="true" data-nl-hl="" className={SWEEP} />
      <span className="relative">{label}</span>
    </>
  );
}

export default function Nav() {
  const scope = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  /** Scroll links. #hero routes home first when off "/"; #footer (contact)
   *  scrolls in place — every page ends in the footer. */
  const goScroll = (target: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (target === "#hero" && pathname !== "/")
      navigateWithVeil((href) => router.push(href), "/");
    else scrollToSection(target);
  };
  const goHome = goScroll("#hero");

  /** about / work: intercept the real <a> and route through the page veil. */
  const goRoute =
    (target: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (pathname === target) return;
      navigateWithVeil((href) => router.push(href), target);
    };

  // Nav intro (§A7 #2) — default branch animates after the preloader
  // (onPreloaderDone fires immediately on pages without one); the
  // reduced-motion branch shows the nav instantly.
  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motionOk, () => {
        gsap.set(el, { yPercent: -100, autoAlpha: 0 });
        const off = onPreloaderDone(() => {
          gsap.to(el, {
            yPercent: 0,
            autoAlpha: 1,
            duration: DUR.intro,
            ease: EASE.outQuart,
          });
        });
        return () => off();
      });
      mm.add(MQ.reduced, () => {
        gsap.set(el, { yPercent: 0, autoAlpha: 1 });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <nav
      ref={scope}
      data-topnav=""
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 top-0 z-(--z-nav) flex items-center justify-between px-9 py-4 mix-blend-difference"
    >
      {/* Brand — negative margin keeps the text on the 36px gutter line */}
      <Link
        data-navlink=""
        data-scrollto="#hero"
        href="/"
        onClick={goHome}
        className="group pointer-events-auto relative -ml-4 px-4 py-[9px] text-[18px] font-medium leading-[1.3] text-ink"
      >
        <SweepLabel label={navCopy.brand} />
      </Link>

      {/* Center links — absolutely centered, hidden ≤700px (§A4) */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 max-b700:hidden">
        {navCopy.links.map((link) => {
          if (link.type === "scroll") {
            return (
              <Link
                key={link.label}
                data-navlink=""
                data-scrollto={link.target}
                href={`/${link.target}`}
                onClick={goScroll(link.target)}
                className={LINK}
              >
                <SweepLabel label={link.label} />
              </Link>
            );
          }
          return (
            <Link
              key={link.label}
              data-navlink=""
              href={link.target}
              onClick={goRoute(link.target)}
              className={LINK}
            >
              <SweepLabel label={link.label} />
            </Link>
          );
        })}
      </div>

      {/* Right cluster — theme toggle + say-hi */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <SayHi />
      </div>
    </nav>
  );
}
