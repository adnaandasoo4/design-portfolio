"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { EASE, DUR } from "@/lib/gsap/motion";
import { markPreloaderDone } from "@/lib/preloader";
import { hero } from "@/content/copy";

/*
 * Preloader (§A5 / §A6 #0 / §A7 row #1).
 *
 * Full-screen #f7f6f4 stage; a centered 300×384 window (clip-path inset on a
 * viewport-sized frame — compositor-friendly, §A10; the reference animated
 * width/height). Seven image slides plus a final dark (#111214) slide cascade
 * in (opacity, staggered 380 + i·120 ms), then the clip window expands to the
 * full viewport (rect .90 / ease-in-out-quint). A mix-blend-mode:difference
 * "adnaan / dasoo" rides the cascade and lands exactly on the minimal hero
 * name. Scroll is locked and the page behind is inert for the duration;
 * markPreloaderDone() fires the nav + intro reveals at finish.
 *
 * Rendered from app/layout.tsx (OUTSIDE the ScrollSmoother transform context
 * — position:fixed breaks inside #smooth-content). Plays only when the
 * session's FIRST route is "/", and only once per full page load.
 */

/** Placeholder slide assets — note there is intentionally NO preload-6 (§A8). */
const SLIDES = [1, 2, 3, 4, 5, 7, 8].map((n) => `/assets/preload-${n}.png`);

/* ---- Frame geometry (px) ---- */
const FRAME_W = 300;
const FRAME_H = 384;

/* ---- Choreography timing (s) — §A6 #0(c) ---- */
const CASCADE_START = 0.38; // first slide at 380ms
const CASCADE_STEP = 0.12; // + i·120ms
const SLIDE_FADE = 0.5; // per-slide opacity fade
const SLIDE_COUNT = SLIDES.length + 1; // 7 images + 1 dark slide = 8
/** Expansion starts at 380 + 8·120 + 300 ms = 1.64s */
const EXPAND_AT = CASCADE_START + SLIDE_COUNT * CASCADE_STEP + 0.3;
/** Finish fires +900ms after expansion starts (= expansion end) */
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
      const frame = root.querySelector<HTMLElement>("[data-pre-rect]");

      const tl = gsap.timeline({ paused: true });
      // Cascade: opacity 0→1 at 380 + i·120 ms (i = 0..7, dark slide included)
      slides.forEach((slide, i) => {
        tl.to(
          slide,
          { opacity: 1, duration: SLIDE_FADE, ease: EASE.std },
          CASCADE_START + i * CASCADE_STEP,
        );
      });
      // Clip window expands to the full viewport (rect .90 / ease-in-out-quint)
      if (frame) {
        const ix = Math.max(0, (window.innerWidth - FRAME_W) / 2);
        const iy = Math.max(0, (window.innerHeight - FRAME_H) / 2);
        tl.fromTo(
          frame,
          { clipPath: `inset(${iy}px ${ix}px)` },
          {
            clipPath: "inset(0px 0px)",
            duration: DUR.rect,
            ease: EASE.inOutQuint,
          },
          EXPAND_AT,
        );
      }
      // FINISH: reveal nav + intros, unlock scroll, fade the stage out
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
      className="fixed inset-0 z-(--z-preloader) bg-preloader"
    >
      {/* Viewport-sized frame clipped to a centered 300×384 window; the clip
          expands to inset(0). The initial inline clip covers the pre-JS
          paint; GSAP re-sets it in px before tweening. */}
      <div
        data-pre-rect=""
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `inset(calc(50% - ${FRAME_H / 2}px) calc(50% - ${FRAME_W / 2}px))`,
        }}
      >
        {/* Image slides, stacked z 2..8 */}
        {SLIDES.map((src, i) => (
          <div
            key={src}
            data-pre-slide=""
            className="absolute inset-0 bg-preloader-slide opacity-0"
            style={{ zIndex: i + 2 }}
          >
            {/* Placeholder stills — plain <img> so decode() gates the start */}
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

        {/* Final dark slide — hands the stage to the #111214 site surface */}
        <div
          data-pre-slide=""
          className="absolute inset-0 bg-bg opacity-0"
          style={{ zIndex: 9 }}
        />

        {/* Difference-blend name — viewport-centered, so it sits exactly on
            the minimal hero name (Manrope 400 clamp(32px,2.7vw,58px)/1.12,
            LS −0.01em, 2nd line indented 1.15em) throughout */}
        <div
          data-pre-name=""
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <div className="flex flex-col mix-blend-difference font-normal text-ink text-[clamp(32px,2.7vw,58px)] leading-[1.12] tracking-[-0.01em]">
            {hero.nameLines.map((line, i) => (
              <span key={line} className={i === 1 ? "ml-[1.15em]" : undefined}>
                {line}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
