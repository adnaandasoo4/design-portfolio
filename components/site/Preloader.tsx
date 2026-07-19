"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { EASE, DUR } from "@/lib/gsap/motion";
import { markPreloaderDone } from "@/lib/preloader";
import { preloader as copy } from "@/content/copy";

/*
 * Preloader — minimal welcome (user-directed redesign, 2026-07-19; replaces
 * the §A6 #0 name-handoff variant).
 *
 * White stage; a centered Manrope line — "it's all (frame) about the /
 * first touch" — with a small rounded image frame INLINE in the text. Seven
 * stills cascade through the frame (opacity, staggered 380 + i·120 ms), then
 * a #111214 layer clip-expands FROM the frame's rect to the full viewport
 * (rect .90 / ease-in-out-quint), swallowing the text and handing off to the
 * dark site surface. Scroll is locked and the page behind is inert for the
 * duration; markPreloaderDone() fires the nav + intro reveals at finish.
 *
 * Rendered from app/layout.tsx (OUTSIDE the ScrollSmoother transform context
 * — position:fixed breaks inside #smooth-content). Plays only when the
 * session's FIRST route is "/", and only once per full page load.
 */

/** Slide stills, shown in order through the inline frame. */
const SLIDES = [1, 2, 3, 4, 5, 6, 7].map((n) => `/assets/preload-${n}.jpg`);

/* ---- Choreography timing (s) ---- */
const CASCADE_START = 0.38; // first slide at 380ms
const CASCADE_STEP = 0.75; // hard cut to the next still every 750ms
/** Dark layer snaps over the frame after the last slide's full beat */
const DARK_AT = CASCADE_START + SLIDES.length * CASCADE_STEP;
/** …then expands to the full viewport 300ms later */
const EXPAND_AT = DARK_AT + 0.3;
/** Finish fires as the expansion completes */
const FINISH_AT = EXPAND_AT + DUR.rect;
const FADE_OUT = 0.55;
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

      /* ---- Scroll lock + inert page: non-passive wheel/touchmove + scroll
             keys, html overflow:hidden backup, and inert on the smooth
             wrapper so Tab can't reach content behind the opaque stage
             (§A10). Must NEVER stay locked. ---- */
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
      const unlock = () => {
        if (!locked) return;
        locked = false;
        window.removeEventListener("wheel", preventScroll);
        window.removeEventListener("touchmove", preventScroll);
        window.removeEventListener("keydown", preventKeys);
        html.style.overflow = prevOverflow;
        wrapper?.removeAttribute("inert");
      };

      /* ---- Reduced-motion branch (§A7 #1): skip cascade/expand entirely ---- */
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        markPreloaderDone();
        unlock();
        setDone(true);
        return unlock;
      }

      /* ---- Full-motion timeline ---- */
      const slides = gsap.utils.toArray<HTMLElement>("[data-pre-slide]", root);
      const frame = root.querySelector<HTMLElement>("[data-pre-frame]");
      const expand = root.querySelector<HTMLElement>("[data-pre-expand]");

      const tl = gsap.timeline({ paused: true });
      // Cascade: HARD CUTS — each still snaps in over the previous one
      // every 750ms (no crossfade)
      slides.forEach((slide, i) => {
        tl.set(slide, { opacity: 1 }, CASCADE_START + i * CASCADE_STEP);
      });
      // Dark layer snaps over the frame (reads as the final slide), then
      // clip-expands to the full viewport. The rect is measured at runtime
      // so the clip always matches the inline frame's actual position.
      if (frame && expand) {
        tl.call(
          () => {
            const r = frame.getBoundingClientRect();
            const radius = getComputedStyle(frame).borderRadius || "0px";
            gsap.set(expand, {
              opacity: 1,
              clipPath: `inset(${r.top}px ${window.innerWidth - r.right}px ${
                window.innerHeight - r.bottom
              }px ${r.left}px round ${radius})`,
            });
          },
          [],
          DARK_AT,
        );
        tl.to(
          expand,
          {
            clipPath: "inset(0px 0px 0px 0px round 0px)",
            duration: DUR.rect,
            ease: EASE.inOutQuint,
            immediateRender: false,
          },
          EXPAND_AT,
        );
      }
      // FINISH: reveal nav + intros, unlock scroll, fade the stage out
      // (dark-over-dark against the site surface — seamless)
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
      tl.call(() => setDone(true), [], FINISH_AT + FADE_OUT);

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
      className="fixed inset-0 z-(--z-preloader) flex items-center justify-center bg-preloader"
    >
      {/* Welcome line — Manrope, lowercase, ink-on-white, frame inline */}
      <div
        aria-hidden="true"
        className="flex flex-col items-center gap-[0.15em] text-center font-medium text-bg text-[clamp(28px,3.3vw,52px)] leading-[1.3] tracking-[-0.01em]"
      >
        <span className="flex items-center gap-[0.4em]">
          <span>{copy.line1Before}</span>

          {/* Inline slide frame — the stills cascade through here */}
          <span
            data-pre-frame=""
            className="relative inline-block h-[1.35em] w-[2.05em] overflow-hidden rounded-[0.3em] bg-bg/8"
          >
            {SLIDES.map((src, i) => (
              <span
                key={src}
                data-pre-slide=""
                className="absolute inset-0 opacity-0"
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
              </span>
            ))}
          </span>

          <span>{copy.line1After}</span>
        </span>
        <span>{copy.line2}</span>
      </div>

      {/* Expansion layer — starts fully clipped, snaps to the frame's rect
          as the "final slide", then grows to the whole viewport */}
      <div
        data-pre-expand=""
        aria-hidden="true"
        className="absolute inset-0 bg-bg opacity-0"
        style={{ clipPath: "inset(50% 50% 50% 50%)" }}
      />
    </div>
  );
}
