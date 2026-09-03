"use client";

/*
 * Fixed top chrome (§A5 [data-topnav], user-redirected 2026-09-02). Two
 * elements, one per side:
 *
 *   ADNAAN DASOO  …………………………………………  [☀] [Menu +]
 *
 * - The wordmark is whole again on the left (the earlier split halves and
 *   the vermilion designer × engineer banner were both dropped), set in HK
 *   Grotesk Wide SemiBold uppercase at the reference's logotype scale.
 * - The theme toggle rides here too (moved out of the bottom-right gutter
 *   when the hero's paragraph was dropped to a 20px bottom margin and took
 *   that corner). It carries no motion of its own — it is simply inside the
 *   right cluster, so the choreography below already covers it.
 * - The Menu carries no outline — it is a bare surface, and the panel is
 *   FLUSH beneath it with no gap, so opening reads as the bar extending
 *   itself downward rather than a popover appearing under it. The button
 *   drops its bottom radius while open so the two halves fuse.
 * - Opening ROLLS: the panel's clip-path opens from the button's bottom
 *   edge while the list inside travels down from translateY(-100%), so the
 *   rows are drawn out from behind the button like a blind unrolling. No
 *   opacity anywhere on the panel — a fade is exactly what this is not.
 *   Row hover is the footer-socials recipe carried over verbatim —
 *   (Tailwind v4: translate-* sets the CSS `translate` property, so the
 *   label transitions `translate`; the row <li> transitions `transform` —
 *   different elements, different properties, no conflict.)
 * - The "+" does not merely tip 45° into an "×": it spins a full turn PLUS
 *   the 45°, landing on the same glyph from the long way round. Spin and
 *   wipe share --dur-copy so they read as one gesture.
 *
 * SCROLL BEHAVIOUR (lib/chromeReveal — one shared ScrollTrigger, also
 * driving ThemeToggle): any scroll DOWN swipes each side clean off its OWN
 * edge of the viewport, and any scroll UP swipes it back. The travel is the
 * element's own width plus the gutter, measured per element, so the piece
 * genuinely leaves the frame instead of dimming in place — the nav clips on
 * the x axis so nothing shows past the edge. Visibility is only dropped
 * once the slide has finished, which keeps it out of the tab order without
 * turning the exit into a fade.
 *
 * The children carry every scroll tween; the ROOT is owned by the intro
 * below and by Footer.tsx's ScrollTrigger, which hides [data-topnav] over
 * the footer and must keep winning (root autoAlpha 0 blankets the children,
 * and GSAP autoAlpha restores `inherit`, never forcing children visible).
 *
 * Intro (§A7 #2): the root slides down from the top after the preloader
 * (ease-out-quart .85); the reduced-motion branch shows instantly and every
 * scroll tween degrades to an instant set — content is never permanently
 * hidden.
 */
import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import { subscribeChrome } from "@/lib/chromeReveal";
import { navigateWithVeil } from "@/components/site/RouteVeil";
import { scrollToSection, scrollToTop } from "@/lib/gsap/SmoothScroll";
import { nav as navCopy } from "@/content/copy";
import ThemeToggle from "@/components/site/ThemeToggle";

/* -------- Footer-socials hover recipe at menu scale -------- */
const ROW_LINK =
  "group relative flex w-full items-center py-[7px] pr-4 pl-5 text-[15px]/[1.3] " +
  "font-medium text-ink";

const FLOOD =
  "pointer-events-none absolute inset-0 bg-ink-1 opacity-0 " +
  "transition-opacity duration-(--dur-copy-2) ease-(--ease-std) " +
  "group-hover:opacity-100 group-hover:duration-0 " +
  "group-focus-visible:opacity-100 group-focus-visible:duration-0";

const LABEL =
  "relative inline-flex items-baseline text-ink " +
  "[transition:color_var(--dur-copy-2)_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "group-hover:[transition:color_0s_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "group-hover:text-bg group-focus-visible:text-bg " +
  "motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2";

/* Extra travel past the viewport edge, so nothing sits flush against it */
const OUT_PAD_PX = 48;

function RowInner({ label, index }: { label: string; index: number }) {
  return (
    <>
      <span aria-hidden="true" className={FLOOD} />
      <span className={LABEL}>
        {/* Row numeral — flips dark with the label on the flood */}
        <span
          aria-hidden="true"
          className="mr-2.5 text-[11px] font-normal text-muted-2 tabular-nums group-hover:text-bg group-focus-visible:text-bg"
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
  const menuWrap = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  /** Scroll links. #hero routes home first when off "/"; #footer (contact)
   *  scrolls in place — every page ends in the footer. */
  const goScroll = (target: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(false);
    if (target === "#hero" && pathname !== "/")
      navigateWithVeil((href) => router.push(href), "/");
    else scrollToSection(target);
  };

  /** about / work: intercept the real <a> and route through the page veil. */
  const goRoute = (target: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(false);
    if (pathname === target) return;
    navigateWithVeil((href) => router.push(href), target);
  };

  /** The wordmark — home from anywhere, top-of-page when already home. */
  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(false);
    if (pathname === "/") scrollToTop();
    else navigateWithVeil((href) => router.push(href), "/");
  };

  /* Escape closes the panel and returns focus to the button; a pointerdown
     anywhere outside closes it too (the hover path alone would strand an
     open panel after a tap). */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuWrap.current?.querySelector("button")?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!menuWrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;
      const left = gsap.utils.toArray<HTMLElement>("[data-chrome-left]", el);
      const right = gsap.utils.toArray<HTMLElement>("[data-chrome-right]", el);
      const all = [...left, ...right];
      const mm = gsap.matchMedia();

      mm.add(MQ.motionOk, () => {
        // Intro: the root slides down after the preloader (fires immediately
        // on pages that never show one).
        gsap.set(el, { yPercent: -100, autoAlpha: 0 });
        const offPreloader = onPreloaderDone(() => {
          gsap.to(el, {
            yPercent: 0,
            autoAlpha: 1,
            duration: DUR.intro,
            ease: EASE.outQuart,
          });
        });

        /** Slide one side clean past its own edge of the viewport.
         *
         *  The distance is derived from `offsetLeft`/`offsetWidth`, never
         *  from getBoundingClientRect: offsets are LAYOUT positions and
         *  ignore the transform we are mid-way through applying, so this
         *  stays correct even when called again before the last tween has
         *  landed. Both animated elements are direct children of the nav,
         *  which is `fixed` and therefore their offsetParent — so offsetLeft
         *  is measured against the viewport, and `el.offsetWidth` alone
         *  would be wrong for anything not already touching its edge. */
        const slide = (els: HTMLElement[], dir: 1 | -1, shown: boolean) => {
          const frame = el.offsetWidth;
          for (const item of els) {
            if (shown) gsap.set(item, { visibility: "inherit" });
            const out =
              dir < 0
                ? -(item.offsetLeft + item.offsetWidth + OUT_PAD_PX)
                : frame - item.offsetLeft + OUT_PAD_PX;
            gsap.to(item, {
              x: shown ? 0 : out,
              duration: shown ? DUR.copy2 : DUR.copy,
              ease: EASE.outQuart,
              overwrite: "auto",
              // Hide only once it is off-frame — never a fade in place.
              onComplete: shown
                ? undefined
                : () => gsap.set(item, { visibility: "hidden" }),
            });
          }
        };

        const offChrome = subscribeChrome(({ shown }) => {
          // Any scroll down closes the panel — an open menu floating over a
          // hidden Menu button would be orphaned.
          if (!shown) setOpen(false);
          slide(left, -1, shown);
          slide(right, 1, shown);
        });

        return () => {
          offPreloader();
          offChrome();
        };
      });

      mm.add(MQ.reduced, () => {
        gsap.set(el, { yPercent: 0, autoAlpha: 1 });
        const offChrome = subscribeChrome(({ shown }) => {
          if (!shown) setOpen(false);
          gsap.set(all, { autoAlpha: shown ? 1 : 0 });
        });
        return () => {
          offChrome();
          gsap.set(all, { autoAlpha: 1 });
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
      className="pointer-events-none fixed inset-x-0 top-0 z-(--z-nav) flex items-start justify-between gap-6 overflow-x-clip px-5 py-5 max-b700:px-4 max-b700:py-4"
    >
      {/* ---- LEFT: the wordmark, whole ---- */}
      <Link
        data-chrome-left=""
        href="/"
        onClick={goHome}
        aria-label={`${navCopy.wordmark} — home`}
        className="pointer-events-auto flex h-11 items-center font-hkgw text-[clamp(20px,2.1vw,30px)] leading-none font-bold tracking-[-0.02em] whitespace-nowrap text-ink uppercase transition-opacity duration-(--dur-hover) ease-(--ease-std) hover:opacity-70"
      >
        {navCopy.wordmark}
      </Link>

      {/* ---- RIGHT: theme toggle + the Menu, which extends into its own
           panel. The CLUSTER is what animates — it is a direct child of the
           nav, so its offsetLeft is viewport-relative (see slide above). --- */}
      <div data-chrome-right="" className="flex items-center gap-2">
        <ThemeToggle />

        <div
          ref={menuWrap}
          className="pointer-events-auto relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node))
              setOpen(false);
          }}
        >
          <button
            type="button"
            aria-expanded={open}
            aria-controls="nav-menu-panel"
            onClick={() => setOpen((o) => !o)}
            className={`flex h-11 w-[clamp(160px,14vw,196px)] cursor-pointer items-center justify-between rounded-t-btn bg-raise-2 pr-4 pl-5 text-[15px] leading-none font-medium text-ink max-b700:w-[124px] max-b700:pr-3 max-b700:pl-4 ${
              open ? "" : "rounded-b-btn"
            }`}
          >
            {navCopy.menuLabel}
            {/* A full turn PLUS the 45° that makes the "+" an "×" — same glyph,
              arrived at the long way round. */}
            <svg
              viewBox="0 0 24 24"
              className={`size-[15px] transition-transform duration-(--dur-copy) ease-(--ease-out-quart) motion-reduce:transition-none ${
                open ? "rotate-[405deg]" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {/* Panel — flush under the button, same surface, so the bar simply
            grows downward. The ROLL is two things moving together: the panel
            unclips from its top edge while the list travels down from behind
            the button. `invisible` when closed keeps it out of the tab order
            and off the pointer. */}
          <div
            id="nav-menu-panel"
            className={`absolute top-full left-0 w-full overflow-hidden rounded-b-btn bg-raise-2 [transition:clip-path_var(--dur-copy)_var(--ease-out-quart),visibility_0s_linear_var(--vis-delay)] motion-reduce:transition-none ${
              open
                ? "visible [--vis-delay:0s] [clip-path:inset(0_0_0_0)]"
                : "invisible [--vis-delay:var(--dur-copy)] [clip-path:inset(0_0_100%_0)]"
            }`}
          >
            <ul
              className={`flex flex-col py-1.5 [transition:transform_var(--dur-copy)_var(--ease-out-quart)] motion-reduce:transition-none ${
                open
                  ? "[transform:translateY(0px)]"
                  : "[transform:translateY(-100%)]"
              }`}
            >
              {navCopy.links.map((link, i) => (
                <li key={link.label}>
                  {link.type === "route" ? (
                    <Link
                      data-navlink=""
                      href={link.target}
                      onClick={goRoute(link.target)}
                      className={ROW_LINK}
                    >
                      <RowInner label={link.label} index={i} />
                    </Link>
                  ) : link.type === "scroll" ? (
                    <Link
                      data-navlink=""
                      data-scrollto={link.target}
                      href={`/${link.target}`}
                      onClick={goScroll(link.target)}
                      className={ROW_LINK}
                    >
                      <RowInner label={link.label} index={i} />
                    </Link>
                  ) : (
                    /* "pending": the row exists and hovers, but has nowhere to
                     go yet — announced as disabled rather than faked. */
                    <a
                      href={link.target}
                      aria-disabled="true"
                      onClick={(e) => e.preventDefault()}
                      className={`${ROW_LINK} cursor-default`}
                    >
                      <RowInner label={link.label} index={i} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
