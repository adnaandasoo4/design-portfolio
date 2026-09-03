"use client";

/*
 * Fixed top chrome (§A5 [data-topnav], user-redesigned 2026-09-02 against
 * the ethansuero.com reference). Four elements on one centred row:
 *
 *   ADNAAN  [designer × engineer]  ……  [Menu +]  DASOO
 *
 * - The name is ONE wordmark split across the header. Both halves are
 *   home links, set in HK Grotesk Wide SemiBold uppercase at the display
 *   scale the reference gives its logotype.
 * - The banner is the reference's partner badge re-cast as the bilingual
 *   designer × engineer sign-off, filled with the brand vermilion.
 * - The Menu box keeps the reference's proportions (≈4.3 : 1) and its "+"
 *   affordance; the plus rotates 45° into a "×" while the panel is open.
 * - The panel opens DOWNWARD on hover (and on click, and on keyboard
 *   focus): a clip-path wipe from the top edge with the rows staggering up
 *   behind it. Row hover is the footer-socials recipe carried over verbatim
 *   from the previous nav — light flood snaps ON, fades OFF, label glides
 *   right. (Tailwind v4: translate-* sets the CSS `translate` property, so
 *   the label transitions `translate`; the row <li> transitions `transform`
 *   — different elements, different properties, no conflict.)
 *
 * SCROLL BEHAVIOUR (lib/chromeReveal — one shared ScrollTrigger, also
 * driving ThemeToggle):
 * - wordmarks / Menu: any scroll DOWN slides them off to their OWN side
 *   (left cluster exits left, right cluster exits right); any scroll UP
 *   swipes them back in from those sides.
 * - the banner is deliberately different — it FLIPS up out of view about
 *   its top edge on the first scroll down and returns ONLY at the very top
 *   of the page, never on a mid-page scroll up (user spec).
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
  "group relative flex w-full items-center py-[7px] pl-5 pr-4 text-[15px]/[1.3] " +
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

/* Wordmark — the reference logotype scale, in the display face */
const WORDMARK =
  "pointer-events-auto font-hkgw text-[clamp(20px,2.1vw,30px)] font-semibold " +
  "uppercase leading-none tracking-[-0.02em] whitespace-nowrap text-ink " +
  "transition-opacity duration-(--dur-hover) ease-(--ease-std) hover:opacity-70";

/* Boxed chrome (Menu button + panel) share one surface recipe */
const BOX = "rounded-btn border border-line-13 bg-raise-2";

/* Hidden offsets — each cluster parks on its own side of the viewport */
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

  /** The wordmark halves — home from anywhere, top-of-page when already home. */
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
      const banner = el.querySelector<HTMLElement>("[data-chrome-banner]");
      const all = [...left, ...right, ...(banner ? [banner] : [])];
      // Hinge the banner on its TOP edge — the fold pivots there, matching
      // the cluster's perspective.
      if (banner) gsap.set(banner, { transformOrigin: "50% 0%" });
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

        const offChrome = subscribeChrome(({ shown, atTop }) => {
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
          // The banner answers to atTop only: it flips away about its top
          // edge and does not come back until the page is back at the top.
          if (banner)
            gsap.to(banner, {
              rotationX: atTop ? 0 : -104,
              autoAlpha: atTop ? 1 : 0,
              duration: atTop ? DUR.copy2 : DUR.copy,
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
        const offChrome = subscribeChrome(({ shown, atTop }) => {
          if (!shown) setOpen(false);
          gsap.set([...left, ...right], { autoAlpha: shown ? 1 : 0 });
          if (banner) gsap.set(banner, { autoAlpha: atTop ? 1 : 0 });
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
      className="pointer-events-none fixed inset-x-0 top-0 z-(--z-nav) flex items-center justify-between gap-6 px-5 py-5 max-b700:px-4 max-b700:py-4"
    >
      {/* ---- LEFT: first name + bilingual banner ---- */}
      {/* perspective lives on the CLUSTER so the banner's rotationX reads as
          a fold in depth rather than a flat squash */}
      <div className="flex items-center gap-[clamp(14px,2vw,28px)] [perspective:520px]">
        <Link
          data-chrome-left=""
          href="/"
          onClick={goHome}
          aria-label={`${navCopy.wordmarkFirst} ${navCopy.wordmarkLast} — home`}
          className={WORDMARK}
        >
          {navCopy.wordmarkFirst}
        </Link>

        {/* Vermilion banner. transformPerspective + a top-edge origin give
            the scroll-away its fold; the JP half drops below 1024px and the
            whole banner below 860px, where the row runs out of width. */}
        <div
          data-chrome-banner=""
          aria-label={`${navCopy.bannerLatin} (${navCopy.bannerJa})`}
          className="flex h-[34px] items-center gap-2.5 rounded-btn bg-brand px-3.5 text-brand-ink max-b860:hidden"
        >
          <span className="text-[13px] leading-none font-semibold tracking-[-0.005em] whitespace-nowrap">
            {navCopy.bannerLatin}
          </span>
          <span
            aria-hidden="true"
            className="h-3 w-px bg-brand-ink/40 max-b1024:hidden"
          />
          <span
            lang="ja"
            className="font-ja text-[12px] leading-none font-medium whitespace-nowrap text-brand-ink/85 max-b1024:hidden"
          >
            {navCopy.bannerJa}
          </span>
        </div>
      </div>

      {/* ---- RIGHT: Menu box + last name ---- */}
      <div className="flex items-center gap-2">
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
            className={`flex h-11 w-[clamp(160px,14vw,196px)] cursor-pointer items-center justify-between pr-4 pl-5 text-[15px] leading-none font-medium text-ink transition-colors duration-(--dur-hover) ease-(--ease-std) hover:border-line-14 max-b700:w-[124px] max-b700:pr-3 max-b700:pl-4 ${BOX}`}
          >
            {navCopy.menuLabel}
            {/* "+" → "×" — a rotation, so it rides the transform-only rule */}
            <svg
              viewBox="0 0 24 24"
              className={`size-[15px] transition-transform duration-(--dur-copy-2) ease-(--ease-out-quart) motion-reduce:transition-none ${open ? "rotate-45" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {/* Panel — clip-path wipe down from the top edge. `invisible` when
              closed keeps it out of the tab order and off the pointer. */}
          <div
            id="nav-menu-panel"
            className={`absolute top-[calc(100%+7px)] left-0 w-full overflow-hidden py-1.5 [transition:clip-path_var(--dur-copy-2)_var(--ease-out-quart),opacity_var(--dur-copy)_var(--ease-std),visibility_0s_linear_var(--vis-delay)] motion-reduce:transition-none ${BOX} ${
              open
                ? "visible [--vis-delay:0s] opacity-100 [clip-path:inset(0_0_0_0)]"
                : "invisible [--vis-delay:var(--dur-copy-2)] opacity-0 [clip-path:inset(0_0_100%_0)]"
            }`}
          >
            <ul className="flex flex-col">
              {navCopy.links.map((link, i) => (
                <li
                  key={link.label}
                  style={{
                    transitionDelay: open ? `${70 + i * 34}ms` : "0ms",
                  }}
                  className={`[transition:transform_var(--dur-copy-2)_var(--ease-out-quart),opacity_var(--dur-copy)_var(--ease-std)] motion-reduce:transition-none ${
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
                    /* "pending": the row exists and hovers, but has nowhere
                       to go yet — announced as disabled rather than faked. */
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

        <Link
          data-chrome-right=""
          href="/"
          onClick={goHome}
          tabIndex={-1}
          aria-hidden="true"
          className={WORDMARK}
        >
          {navCopy.wordmarkLast}
        </Link>
      </div>
    </nav>
  );
}
