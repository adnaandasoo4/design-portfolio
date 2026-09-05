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
 * SCROLL BEHAVIOUR (lib/chromeReveal — one shared ScrollTrigger): the bar
 * swipes UP out of the frame on any scroll down and back DOWN on any scroll
 * up, moving as one piece rather than the two halves parting sideways. The
 * travel is measured — the bar's own offsetTop plus its height — so it
 * clears the viewport's top edge exactly, whatever the gutter is at this
 * width. Visibility is dropped only once the slide has landed, which keeps
 * the bar out of the tab order without the exit becoming a fade.
 *
 * The BAR, not the nav root, is what moves. The root is owned by the intro
 * below and by Footer.tsx's ScrollTrigger, which hides [data-topnav] over
 * the footer and must keep winning; giving the scroll watcher its own inner
 * element keeps those three off each other's properties entirely.
 *
 * (Root autoAlpha 0 blankets the bar, and GSAP autoAlpha restores
 * `inherit`, never forcing descendants visible.)
 *
 * Intro (§A7 #2, rebuilt 2026-09-03): the bar arrives by the SAME swipe it
 * uses returning from a scroll up — same element, same measured distance,
 * same duration and ease, and no fade. It used to be a gesture of its own,
 * the nav ROOT sliding yPercent -100 with autoAlpha over DUR.intro, so the
 * nav entered one way on load and a different way for the rest of the
 * visit. The reduced-motion branch shows instantly and every scroll tween
 * degrades to an instant set — content is never permanently hidden.
 */
import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { onPreloaderDone } from "@/lib/preloader";
import { subscribeChrome } from "@/lib/chromeReveal";
import { navigateWithVeil, useVeiledRoute } from "@/components/site/RouteVeil";
import { scrollToSection, scrollToTop } from "@/lib/gsap/SmoothScroll";
import { nav as navCopy } from "@/content/copy";
import ThemeToggle from "@/components/site/ThemeToggle";

/* -------- Footer-socials hover recipe at menu scale -------- */
const ROW_LINK =
  "group relative flex w-full items-center py-[0.4375rem] pr-4 pl-5 text-[0.9375rem]/[1.3] " +
  "font-medium text-ink";

/* Same recipe at full-screen scale: bigger type, taller target, and the
   flood spanning the gutters rather than a dropdown's width. */
const SHEET_LINK =
  "group relative flex w-full items-center py-[0.875rem] " +
  "text-[clamp(1.875rem,9vw,2.75rem)]/[1.15] font-medium text-ink";

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

/* Extra travel past the viewport's top edge, so nothing sits flush to it */
const OUT_PAD_PX = 12;

/** The link rows, rendered identically into the desktop dropdown and the
 *  phone's full-screen panel. Only `rowClass` differs — same targets, same
 *  handlers, so the two menus cannot drift apart in behaviour. */
function MenuRows({
  rowClass,
  goRoute,
  goScroll,
}: {
  rowClass: string;
  goRoute: (target: string) => (e: MouseEvent<HTMLAnchorElement>) => void;
  goScroll: (target: string) => (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <>
      {navCopy.links.map((link, i) => (
        <li key={link.label}>
          {link.type === "route" ? (
            <Link
              data-navlink=""
              href={link.target}
              onClick={goRoute(link.target)}
              className={rowClass}
            >
              <RowInner label={link.label} index={i} />
            </Link>
          ) : (
            <Link
              data-navlink=""
              data-scrollto={link.target}
              href={`/${link.target}`}
              onClick={goScroll(link.target)}
              className={rowClass}
            >
              <RowInner label={link.label} index={i} />
            </Link>
          )}
        </li>
      ))}
    </>
  );
}

function RowInner({ label, index }: { label: string; index: number }) {
  return (
    <>
      <span aria-hidden="true" className={FLOOD} />
      <span className={LABEL}>
        {/* Row numeral — flips dark with the label on the flood */}
        <span
          aria-hidden="true"
          className="mr-2.5 text-[0.6875rem] font-normal text-muted-2 tabular-nums group-hover:text-bg group-focus-visible:text-bg"
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
  const sheet = useRef<HTMLDivElement>(null);
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

  /** about / work: intercept the real <a> and route through the page veil.
   *  The panel closes on every click, same-page ones included. */
  const veiledRoute = useVeiledRoute();
  const goRoute = (target: string) => veiledRoute(target, () => setOpen(false));

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
      // The phone sheet lives outside menuWrap (it has to — see its note in
      // the markup), so it needs counting as "inside" too. Without this, a
      // pointerdown on one of its links closed the menu before the click
      // that follows could navigate.
      const node = e.target as Node;
      if (
        !menuWrap.current?.contains(node) &&
        !sheet.current?.contains(node)
      )
        setOpen(false);
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
      const bar = el.querySelector<HTMLElement>("[data-chrome-bar]");
      if (!bar) return;
      const mm = gsap.matchMedia();

      mm.add(MQ.motionOk, () => {
        /** How far up the bar sits when hidden — clear of the viewport's
         *  top edge.
         *
         *  The distance comes from `offsetTop`/`offsetHeight` — LAYOUT
         *  values, which ignore the transform we may be part-way through
         *  applying, so this stays correct when recomputed mid-tween
         *  (getBoundingClientRect would not). The bar's offsetParent is the
         *  nav, which is `fixed`, so offsetTop is the gutter above it. */
        const outY = () => -(bar.offsetTop + bar.offsetHeight + OUT_PAD_PX);

        const swipe = (shown: boolean) => {
          if (shown) gsap.set(bar, { visibility: "inherit" });
          gsap.to(bar, {
            y: shown ? 0 : outY(),
            duration: shown ? DUR.copy2 : DUR.copy,
            ease: EASE.outQuart,
            overwrite: "auto",
            // Hide only once it is off-frame — never a fade in place.
            onComplete: shown
              ? undefined
              : () => gsap.set(bar, { visibility: "hidden" }),
          });
        };

        // Intro: the bar arrives by the SAME swipe it uses coming back on a
        // scroll up (user, 2026-09-03) — same element, same distance, same
        // duration and ease, no fade. It used to be its own gesture: the
        // nav ROOT sliding yPercent -100 with autoAlpha over DUR.intro,
        // which meant the nav entered one way on load and another way for
        // the rest of the visit.
        gsap.set(bar, { y: outY(), visibility: "hidden" });
        let introDone = false;
        const offPreloader = onPreloaderDone(() => {
          introDone = true;
          swipe(true);
        });

        const offChrome = subscribeChrome(({ shown }) => {
          // Any scroll down closes the panel — an open menu floating over a
          // hidden Menu button would be orphaned.
          if (!shown) setOpen(false);
          // subscribeChrome calls back IMMEDIATELY on subscribe with the
          // current state (shown: true at the top of the page), which would
          // slide the bar in the instant this mounts and skip the intro
          // entirely. The intro owns the bar until it has landed. Nothing is
          // lost by ignoring the interim: scroll is locked for the
          // preloader's duration, so the state cannot have changed.
          if (!introDone) return;
          swipe(shown);
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
          gsap.set(bar, { autoAlpha: shown ? 1 : 0 });
        });
        return () => {
          offChrome();
          gsap.set(bar, { autoAlpha: 1 });
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
      className="pointer-events-none fixed inset-x-0 top-0 z-(--z-nav) px-5 py-5 max-b700:px-4 max-b700:py-4"
    >
      {/* ---- Phone: the menu is a full screen (user, 2026-09-03) ----

          It is a child of the NAV, not of the bar, and that is structural,
          not stylistic: the bar carries a GSAP transform for its swipe, and
          a transformed element becomes the containing block for any `fixed`
          descendant — a `fixed inset-0` panel inside it would size to the
          44px bar instead of the viewport. The nav root is untransformed, so
          here it resolves against the viewport.

          It also sits BEFORE the bar in source order, so the bar paints over
          it and the Menu button — now an × — and the theme toggle stay live
          on top of the open sheet. `invisible` when closed takes the whole
          subtree out of the tab order; the clip-path handles the pointer,
          since a clipped-away region is untargetable. */}
      <div
        ref={sheet}
        id="nav-menu-sheet"
        className={`pointer-events-auto fixed inset-0 hidden bg-bg [transition:clip-path_var(--dur-copy)_var(--ease-out-quart),visibility_0s_linear_var(--vis-delay)] motion-reduce:transition-none max-b700:block ${
          open
            ? "visible [--vis-delay:0s] [clip-path:inset(0_0_0_0)]"
            : "invisible [--vis-delay:var(--dur-copy)] [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        {/* pt clears the bar: the nav's 16px phone gutter plus the 44px
            button. justify-center puts the rows in the space that leaves. */}
        <ul className="flex h-full flex-col justify-center px-4 pt-[3.75rem] pb-[12vh]">
          <MenuRows
            rowClass={SHEET_LINK}
            goRoute={goRoute}
            goScroll={goScroll}
          />
        </ul>
      </div>

      {/* The bar is the moving part — see SCROLL BEHAVIOUR above */}
      <div
        data-chrome-bar=""
        className="flex items-start justify-between gap-6"
      >
        {/* ---- LEFT: the wordmark, whole ---- */}
        <Link
          href="/"
          onClick={goHome}
          aria-label={`${navCopy.wordmark} — home`}
          className="pointer-events-auto flex h-11 items-center font-hkgw text-[clamp(1.25rem,2.1vw,1.875rem)] leading-none font-bold tracking-[-0.02em] whitespace-nowrap text-ink uppercase transition-opacity duration-(--dur-hover) ease-(--ease-std) hover:opacity-70"
        >
          {navCopy.wordmark}
        </Link>

        {/* ---- RIGHT: theme toggle + the Menu, which extends into its own
           panel ---- */}
        <div className="flex items-center gap-2">
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
              aria-controls="nav-menu-panel nav-menu-sheet"
              onClick={() => setOpen((o) => !o)}
              className={`flex h-11 w-[clamp(10rem,14vw,12.25rem)] cursor-pointer items-center justify-between rounded-t-btn bg-raise-2 pr-4 pl-5 text-[0.9375rem] leading-none font-medium text-ink max-b700:w-[7.75rem] max-b700:pr-3 max-b700:pl-4 ${
                open ? "" : "rounded-b-btn"
              }`}
            >
              {navCopy.menuLabel}
              {/* Half a turn PLUS the 45° that makes the "+" an "×" — enough
              rotation to read as a spin, short of the full revolution that
              read as too much. */}
              <svg
                viewBox="0 0 24 24"
                className={`size-[0.9375rem] transition-transform duration-(--dur-copy) ease-(--ease-out-quart) motion-reduce:transition-none ${
                  open ? "rotate-[225deg]" : "rotate-0"
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
            grows downward.

            TWO elements, and the split matters. The OUTER is the hit area:
            it is full height the instant the menu opens, transparent, and
            unclipped. The INNER carries the visual roll — and a clip-path
            does not merely hide what it cuts, it makes it untargetable by
            the pointer. With the roll on a single element, moving the mouse
            from the button down into a panel that had not finished
            unrolling landed on nothing, which fired mouseleave on the
            wrapper and shut the menu the moment you tried to reach it. The
            outer shield keeps the pointer inside the wrapper the whole way
            down.

            `invisible` when closed takes the whole subtree out of the tab
            order and off the pointer. */}
            <div
              id="nav-menu-panel"
              className={`absolute top-full left-0 w-full [transition:visibility_0s_linear_var(--vis-delay)] ${
                open
                  ? "visible [--vis-delay:0s]"
                  : "invisible [--vis-delay:var(--dur-copy)]"
              }`}
            >
              <div
                className={`overflow-hidden rounded-b-btn bg-raise-2 max-b700:hidden [transition:clip-path_var(--dur-copy)_var(--ease-out-quart)] motion-reduce:transition-none ${
                  open
                    ? "[clip-path:inset(0_0_0_0)]"
                    : "[clip-path:inset(0_0_100%_0)]"
                }`}
              >
                <ul
                  className={`flex flex-col py-1.5 [transition:transform_var(--dur-copy)_var(--ease-out-quart)] motion-reduce:transition-none ${
                    open
                      ? "[transform:translateY(0rem)]"
                      : "[transform:translateY(-100%)]"
                  }`}
                >
                  <MenuRows
                    rowClass={ROW_LINK}
                    goRoute={goRoute}
                    goScroll={goScroll}
                  />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
