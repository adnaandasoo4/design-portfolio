"use client";

/*
 * Fixed top chrome (§A5 [data-topnav], user-redirected 2026-09-02). Two
 * elements, one per side:
 *
 *   ADNAAN DASOO  ……………………………………………………  [Menu +]
 *
 * - The wordmark is whole again on the left (the earlier split halves and
 *   the vermilion designer × engineer banner were both dropped), set in HK
 *   Grotesk Wide SemiBold uppercase at the reference's logotype scale.
 * - The Menu carries no outline — it is a bare surface, and the panel is
 *   FLUSH beneath it with no gap, so opening reads as the bar extending
 *   itself downward rather than a popover appearing under it. The button
 *   drops its bottom radius while open so the two halves fuse.
 * - Opening is a clip-path wipe from the button's bottom edge with the rows
 *   staggering in behind it. Row hover is the footer-socials recipe carried
 *   over verbatim — light flood snaps ON, fades OFF, label glides right.
 *   (Tailwind v4: translate-* sets the CSS `translate` property, so the
 *   label transitions `translate`; the row <li> transitions `transform` —
 *   different elements, different properties, no conflict.)
 * - The "+" does not merely tip 45° into an "×": it spins a full turn PLUS
 *   the 45°, landing on the same glyph from the long way round. Spin and
 *   wipe share --dur-copy so they read as one gesture.
 *
 * SCROLL BEHAVIOUR (lib/chromeReveal — one shared ScrollTrigger, also
 * driving ThemeToggle): any scroll DOWN slides each side off its OWN edge;
 * any scroll UP swipes them back in.
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

/* Hidden offsets — each side parks on its own edge of the viewport */
const LEFT_OUT_X = -28;
const RIGHT_OUT_X = 28;

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

        const offChrome = subscribeChrome(({ shown }) => {
          // Any scroll down closes the panel — an open menu floating over a
          // hidden Menu button would be orphaned.
          if (!shown) setOpen(false);

          gsap.to(left, {
            x: shown ? 0 : LEFT_OUT_X,
            autoAlpha: shown ? 1 : 0,
            duration: shown ? DUR.copy2 : DUR.copy,
            ease: EASE.outQuart,
            overwrite: "auto",
          });
          gsap.to(right, {
            x: shown ? 0 : RIGHT_OUT_X,
            autoAlpha: shown ? 1 : 0,
            duration: shown ? DUR.copy2 : DUR.copy,
            ease: EASE.outQuart,
            overwrite: "auto",
          });
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
      className="pointer-events-none fixed inset-x-0 top-0 z-(--z-nav) flex items-start justify-between gap-6 px-5 py-5 max-b700:px-4 max-b700:py-4"
    >
      {/* ---- LEFT: the wordmark, whole ---- */}
      <Link
        data-chrome-left=""
        href="/"
        onClick={goHome}
        aria-label={`${navCopy.wordmark} — home`}
        className="pointer-events-auto flex h-11 items-center font-hkgw text-[clamp(20px,2.1vw,30px)] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap text-ink uppercase transition-opacity duration-(--dur-hover) ease-(--ease-std) hover:opacity-70"
      >
        {navCopy.wordmark}
      </Link>

      {/* ---- RIGHT: the Menu, which extends into its own panel ---- */}
      <div
        data-chrome-right=""
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
            grows downward. `invisible` when closed keeps it out of the tab
            order and off the pointer. */}
        <div
          id="nav-menu-panel"
          className={`absolute top-full left-0 w-full overflow-hidden rounded-b-btn bg-raise-2 pb-1.5 [transition:clip-path_var(--dur-copy)_var(--ease-out-quart),opacity_var(--dur-micro)_var(--ease-std),visibility_0s_linear_var(--vis-delay)] motion-reduce:transition-none ${
            open
              ? "visible opacity-100 [--vis-delay:0s] [clip-path:inset(0_0_0_0)]"
              : "invisible opacity-0 [--vis-delay:var(--dur-copy)] [clip-path:inset(0_0_100%_0)]"
          }`}
        >
          <ul className="flex flex-col">
            {navCopy.links.map((link, i) => (
              <li
                key={link.label}
                style={{ transitionDelay: open ? `${40 + i * 22}ms` : "0ms" }}
                className={`[transition:transform_var(--dur-copy)_var(--ease-out-quart),opacity_var(--dur-micro)_var(--ease-std)] motion-reduce:transition-none ${
                  open
                    ? "opacity-100 [transform:translateY(0px)]"
                    : "opacity-0 [transform:translateY(-8px)]"
                }`}
              >
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
    </nav>
  );
}
