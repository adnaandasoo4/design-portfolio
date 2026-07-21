"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { EASE } from "@/lib/gsap/motion";
import { markPreloaderDone } from "@/lib/preloader";

/*
 * Preloader — original handoff wire-up (§A5 [data-preloader], §A6 #0,
 * §A7 #1), restored 2026-07-20 over the short-lived welcome-line redesign.
 *
 * Light #f7f6f4 stage; centered 300×384 frame. Seven stills HARD-CUT over
 * one another (opacity snaps — the reference's slide divs have no opacity
 * transition) at 380 + i·120ms; the 8th cut is a solid SITE-OFF-BLACK
 * (#111214, --color-bg) slide. At 380 + 8·120 + 300ms = 1640ms the rect
 * expands (`rect .90 / ease-in-out-quint`) to the FULL VIEWPORT — the
 * off-black becomes the site background itself (user direction 2026-07-20;
 * no name overlay, no panel-rect target). The expanding layer is a flat
 * color, so the clip-path port honors the transform/opacity/clip-path rule.
 *
 * At expand-complete (+900ms): scroll unlocks, markPreloaderDone fires the
 * reveals — nav, hero PANEL fade-in, hero intro elements — and the stage
 * fades out .55s (display:none at +600ms, per the reference).
 *
 * Gating: cascade starts only after all stills decode() (hard 1200ms
 * fallback). Scroll locked + page inert for the duration; released on
 * finish, on reduced-motion skip, and on unmount — never left locked.
 * Reduced motion: skip cascade/expand, unlock immediately (§A10).
 *
 * Rendered from app/layout.tsx (OUTSIDE the smooth-scroll wrapper).
 * Plays only when the session's FIRST route is "/", once per full page
 * load.
 */

/** Image slides — preload-1…6 (preload-7, the 911 GT3 still, was cut by
 *  user direction 2026-07-21). The final slide is the solid off-black. */
const SLIDES = [1, 2, 3, 4, 5, 6].map((n) => `/assets/preload-${n}.jpg`);

/* ---- Choreography timing (s) — reference v1 port, verbatim ---- */
/** First hard cut lands at 380ms… */
const CASCADE_BASE = 0.38;
/** …then one cut every 150ms — each still holds the frame for exactly one
 *  step before the next covers it (120ms read rushed, 180ms dragged;
 *  150ms is the user-tuned middle) */
const CASCADE_STEP = 0.15;
/** 8 slides total: 7 stills + the solid color slide */
const SLIDE_COUNT = SLIDES.length + 1;
/** Expand at 380 + 8·120 + 300 = 1640ms */
const EXPAND_AT = CASCADE_BASE + SLIDE_COUNT * CASCADE_STEP + 0.3;
/** The off-black grows from the frame to the viewport edges over 1.15s —
 *  longer than the reference's .90s so the sweep reads smooth, not snappy */
const EXPAND_DUR = 1.15;
/** Finish (unlock + reveals + fade) only after the expansion has fully
 *  landed (+0.1s breath) so the reach-the-edges moment is never cut short
 *  by the stage fade */
const FINISH_AT = EXPAND_AT + EXPAND_DUR + 0.1;
const FADE_OUT = 0.55;
/** display:none 600ms after the fade starts (reference setTimeout) */
const HIDE_AT = FINISH_AT + 0.6;
/** Hard fallback if image decode() stalls or 404s (ms) */
const DECODE_FALLBACK_MS = 1200;

const SCROLL_KEYS = new Set([
  " ",
  "Spacebar",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

/** The preloader is an entry experience — once per full page load. */
let hasPlayed = false;

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const pathname = usePathname();
  // Play only when the session ENTERED on "/" (layout mounts once, so the
  // lazy initializer captures the landing route; client-side returns to "/"
  // don't replay).
  const [play] = useState(() => pathname === "/" && !hasPlayed);

  useGSAP(
    () => {
      if (!play) return;
      const root = rootRef.current;
      if (!root) return;
      hasPlayed = true;

      /* ---- Scroll lock + inert page (§A10) — must NEVER stay locked ---- */
      const preventScroll = (e: Event) => e.preventDefault();
      const preventKeys = (e: KeyboardEvent) => {
        if (SCROLL_KEYS.has(e.key)) e.preventDefault();
      };
      const html = document.documentElement;
      const wrapper = document.getElementById("smooth-wrapper");
      const prevOverflow = html.style.overflow;
      let locked = true;
      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
      window.addEventListener("keydown", preventKeys);
      html.style.overflow = "hidden";
      wrapper?.setAttribute("inert", "");
      window.scrollTo(0, 0);
      const unlock = () => {
        if (!locked) return;
        locked = false;
        window.removeEventListener("wheel", preventScroll);
        window.removeEventListener("touchmove", preventScroll);
        window.removeEventListener("keydown", preventKeys);
        html.style.overflow = prevOverflow;
        wrapper?.removeAttribute("inert");
      };

      /* ---- Reduced-motion branch: skip cascade/expand entirely ---- */
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        markPreloaderDone();
        unlock();
        setDone(true);
        return unlock;
      }

      /* ---- Full-motion timeline ---- */
      const slides = gsap.utils.toArray<HTMLElement>("[data-pre-slide]", root);
      const frame = root.querySelector<HTMLElement>("[data-pre-frame]");
      const proxy = root.querySelector<HTMLElement>("[data-pre-panel]");

      const tl = gsap.timeline({ paused: true });

      // Cascade: HARD CUTS — each slide (7 stills + the solid color layer)
      // snaps to opacity 1 at 380 + i·120ms, stacking over the previous.
      slides.forEach((slide, i) => {
        tl.set(slide, { opacity: 1 }, CASCADE_BASE + i * CASCADE_STEP);
      });

      // Expand: the full-viewport proxy (same flat off-black as the 8th
      // slide beneath it — the swap is invisible) clip-expands from the
      // frame's rect to the whole viewport, i.e. INTO the site background.
      // The inset is written MANUALLY from a tweened progress value —
      // GSAP's clip-path string interpolation proved unreliable here (the
      // rect snapped off-position before expanding); driving px insets per
      // tick guarantees the growth starts exactly at the frame and reaches
      // every edge together. Frame rect is read at call time so a resize
      // during the cascade can't go stale.
      if (frame && proxy) {
        tl.call(
          () => {
            const f = frame.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const setClip = (p: number) => {
              const k = 1 - p;
              proxy.style.clipPath =
                `inset(${f.top * k}px ${(vw - f.right) * k}px ` +
                `${(vh - f.bottom) * k}px ${f.left * k}px)`;
            };
            setClip(0);
            gsap.set(proxy, { opacity: 1 });
            const state = { p: 0 };
            gsap.to(state, {
              p: 1,
              duration: EXPAND_DUR,
              ease: EASE.inOutQuint,
              onUpdate: () => setClip(state.p),
            });
          },
          [],
          EXPAND_AT,
        );
      }

      // FINISH (expand complete): unlock scroll, fire nav + hero intro
      // reveals, fade the stage out over the revealed site.
      tl.set(root, { pointerEvents: "none" }, FINISH_AT);
      tl.call(
        () => {
          markPreloaderDone();
          unlock();
        },
        [],
        FINISH_AT,
      );
      tl.to(
        root,
        { autoAlpha: 0, duration: FADE_OUT, ease: EASE.std },
        FINISH_AT,
      );
      tl.call(() => setDone(true), [], HIDE_AT);

      /* ---- Start after image decode(), hard 1200ms fallback (404-proof) ---- */
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        tl.play(0);
      };
      const fallback = window.setTimeout(start, DECODE_FALLBACK_MS);
      const imgs = gsap.utils.toArray<HTMLImageElement>("img", root);
      Promise.allSettled(imgs.map((img) => img.decode())).then(() => start());

      return () => {
        window.clearTimeout(fallback);
        unlock(); // never leave scroll locked, even on early unmount
      };
    },
    { scope: rootRef },
  );

  if (!play || done) return null;

  return (
    <div
      ref={rootRef}
      data-preloader=""
      className="fixed inset-0 z-(--z-preloader) flex items-center justify-center overflow-hidden bg-preloader"
    >
      {/* Centered 300×384 frame — the stills hard-cut through here.
          Slightly smaller on phones (same 25:32 ratio); the expand reads
          the frame rect at call time, so the math follows automatically. */}
      <div
        data-pre-frame=""
        className="relative h-[384px] w-[300px] overflow-hidden max-b700:h-[307px] max-b700:w-[240px]"
      >
        {SLIDES.map((src, i) => (
          <div
            key={src}
            data-pre-slide=""
            className="absolute inset-0 bg-preloader-slide opacity-0"
            style={{ zIndex: i + 2 }}
          >
            {/* Plain <img> so decode() gates the cascade start */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading="eager"
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        ))}

        {/* 8th slide — solid site off-black; the expand proxy takes over
            from this exact flat color, so the handoff is invisible */}
        <div
          data-pre-slide=""
          aria-hidden="true"
          className="absolute inset-0 bg-bg opacity-0"
          style={{ zIndex: SLIDES.length + 2 }}
        />
      </div>

      {/* Expand proxy — snaps in clipped to the frame's rect, clip-expands
          to the full viewport (the site background), then fades with the
          stage while the page elements animate in beneath */}
      <div
        data-pre-panel=""
        aria-hidden="true"
        className="absolute inset-0 z-20 bg-bg opacity-0"
        style={{ clipPath: "inset(50% 50% 50% 50%)" }}
      />
    </div>
  );
}
