"use client";

/*
 * Fixed top nav (§A5 [data-topnav], user-redesigned 2026-07-20).
 * - fixed full-width, padding 16px 36px, z-nav 120; solid white ink
 * - container is pointer-events-none; interactive children re-enable
 * - LEFT: vertical stack of links (home / about / work / contact), small
 *   type, tight rows, no dividers — styled like the footer "( my socials )"
 *   column. Hover reuses the footer-socials recipe verbatim: light-gray
 *   flood (--color-ink-1) + dark text snap ON instantly, fade OFF at
 *   --dur-copy-2; label glides right on --dur-track ease-out-quart.
 *   (Tailwind v4: translate-* sets the CSS `translate` property, so the
 *   label transition lists `translate`, not `transform`. GSAP animates the
 *   ROW <li> via transform x — different element, no conflict.)
 * - RIGHT: small "let's collaborate" CtaButton (size="sm") → #footer.
 * - SCROLL BEHAVIOR (ScrollTrigger direction watcher, Lenis-fed):
 *   rows + CTA share ONE visibility state (this nav CTA is the only
 *   collaborate button at the page top — the hero renders none, so a
 *   duplicate can never appear). Visible at the very top; any scroll DOWN
 *   hides everything (quick fade/slide, no stagger); any scroll UP
 *   staggers the rows back in (~75ms apart, small x offset + autoAlpha)
 *   while the CTA slides in from the right. Children-only tweens — the ROOT is owned by the
 *   intro below and by Footer.tsx's ScrollTrigger, which hides
 *   [data-topnav] over the footer and must keep winning (root autoAlpha 0
 *   blankets the children, and GSAP autoAlpha restores `inherit`, never
 *   forcing children visible).
 * - "home" scrolls to #hero on "/" (Lenis) or routes home; about/work route
 *   through the page veil; contact scrolls to #footer
 * - intro (§A7 #2): slides down from the top after the preloader
 *   (ease-out-quart .85); reduced-motion branch shows instantly and the
 *   direction watcher degrades to instant autoAlpha sets — content is
 *   never permanently hidden.
 */
import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import { navigateWithVeil } from "@/components/site/RouteVeil";
import { scrollToSection } from "@/lib/gsap/SmoothScroll";
import { nav as navCopy, contactVisual } from "@/content/copy";
import CtaButton from "@/components/site/CtaButton";

/* -------- Footer-socials hover recipe at nav scale (Footer.tsx) -------- */
const LINK =
  "group pointer-events-auto relative inline-block text-[15px]/[1.3] " +
  "font-medium text-ink";

const FLOOD =
  "pointer-events-none absolute -left-1.5 -right-4 -inset-y-0.5 bg-ink-1 opacity-0 " +
  "transition-opacity duration-(--dur-copy-2) ease-(--ease-std) " +
  "group-hover:opacity-100 group-hover:duration-0 " +
  "group-focus-visible:opacity-100 group-focus-visible:duration-0";

const LABEL =
  "relative inline-block text-ink " +
  "[transition:color_var(--dur-copy-2)_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "group-hover:[transition:color_0s_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "group-hover:text-bg group-focus-visible:text-bg " +
  "motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2";

/* Scroll-direction reveal constants */
const TOP_EPS_PX = 8; // within this of the top counts as "at the top"
const ROW_STAGGER = 0.075; // ~75ms between rows on the scroll-up reveal
const ROW_X = -14; // hidden rows park slightly left
const CTA_X = 24; // hidden CTA parks slightly right (animates in FROM the right)

function LinkInner({ label, index }: { label: string; index: number }) {
  return (
    <>
      <span aria-hidden="true" className={FLOOD} />
      <span className={LABEL}>
        {/* Row numeral — white ink; flips dark with the label on the flood */}
        <span
          aria-hidden="true"
          className="mr-2 text-[11px] font-normal text-ink tabular-nums group-hover:text-bg group-focus-visible:text-bg"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {label}
      </span>
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

  /** about / work: intercept the real <a> and route through the page veil. */
  const goRoute =
    (target: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (pathname === target) return;
      navigateWithVeil((href) => router.push(href), target);
    };

  // Intro (§A7 #2) + scroll-direction show/hide. The intro and the footer
  // trigger own the ROOT; the direction watcher only tweens the CHILDREN
  // (rows + CTA), so the footer-hide always blankets it.
  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-nav-row]", el);
      const cta = el.querySelector<HTMLElement>("[data-nav-cta]");
      const items = cta ? [...rows, cta] : rows;
      const mm = gsap.matchMedia();

      mm.add(MQ.motionOk, () => {
        // Intro: root slides down after the preloader (fires immediately on
        // pages without one). The nav CTA is THE one collaborate button for
        // the page top — the hero no longer renders its own, so rows and
        // CTA share one visibility state and duplicates are impossible.
        gsap.set(el, { yPercent: -100, autoAlpha: 0 });
        const off = onPreloaderDone(() => {
          gsap.to(el, {
            yPercent: 0,
            autoAlpha: 1,
            duration: DUR.intro,
            ease: EASE.outQuart,
          });
        });

        let shown = true; // page loads at the top with everything visible
        const show = () => {
          shown = true;
          gsap.to(rows, {
            x: 0,
            autoAlpha: 1,
            duration: DUR.copy2,
            ease: EASE.outQuart,
            stagger: ROW_STAGGER,
            overwrite: "auto",
          });
          if (cta)
            gsap.to(cta, {
              x: 0,
              autoAlpha: 1,
              duration: DUR.copy2,
              ease: EASE.outQuart,
              overwrite: "auto",
            });
        };
        const hide = () => {
          shown = false;
          // Quick uniform exit — no reverse stagger.
          gsap.to(rows, {
            x: ROW_X,
            autoAlpha: 0,
            duration: DUR.copy,
            ease: EASE.outQuart,
            overwrite: "auto",
          });
          if (cta)
            gsap.to(cta, {
              x: CTA_X,
              autoAlpha: 0,
              duration: DUR.copy,
              ease: EASE.outQuart,
              overwrite: "auto",
            });
        };

        const st = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate(self) {
            if (self.scroll() <= TOP_EPS_PX) {
              if (!shown) show();
            } else if (self.direction === 1) {
              if (shown) hide();
            } else if (self.direction === -1) {
              if (!shown) show();
            }
          },
        });
        return () => {
          off();
          st.kill();
        };
      });

      mm.add(MQ.reduced, () => {
        gsap.set(el, { yPercent: 0, autoAlpha: 1 });
        let shown = true;
        const st = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate(self) {
            if (self.scroll() <= TOP_EPS_PX || self.direction === -1) {
              if (!shown) {
                shown = true;
                gsap.set(items, { autoAlpha: 1 });
              }
            } else if (self.direction === 1 && shown) {
              shown = false;
              gsap.set(items, { autoAlpha: 0 });
            }
          },
        });
        return () => {
          st.kill();
          gsap.set(items, { autoAlpha: 1 });
        };
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
      className="pointer-events-none fixed inset-x-0 top-0 z-(--z-nav) flex items-start justify-between px-9 py-4 max-b700:px-5"
    >
      {/* Vertical link stack — top-left, footer-socials styling */}
      <ul className="flex flex-col items-start gap-1">
        {navCopy.links.map((link, i) => (
          <li key={link.label} data-nav-row="">
            {link.type === "scroll" ? (
              <Link
                data-navlink=""
                data-scrollto={link.target}
                href={`/${link.target}`}
                onClick={goScroll(link.target)}
                className={LINK}
              >
                <LinkInner label={link.label} index={i} />
              </Link>
            ) : (
              <Link
                data-navlink=""
                href={link.target}
                onClick={goRoute(link.target)}
                className={LINK}
              >
                <LinkInner label={link.label} index={i} />
              </Link>
            )}
          </li>
        ))}
      </ul>

      {/* Small collaborate CTA — top-right; hidden at the very top of the
          page (the hero shows its own), slides in from the right on
          scroll-up away from the top */}
      <div data-nav-cta="">
        <CtaButton
          size="sm"
          label={contactVisual.cta}
          href="/#footer"
          scrollTarget="#footer"
        />
      </div>
    </nav>
  );
}
