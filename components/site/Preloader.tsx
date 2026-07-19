"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { EASE } from "@/lib/gsap/motion";
import { markPreloaderDone } from "@/lib/preloader";
import { preloader as copy } from "@/content/copy";

/*
 * Preloader — dark welcome + pill-to-panel handoff (user-directed redesign,
 * 2026-07-19).
 *
 * Off-black #111214 stage (identical to the site surface); a centered white
 * Manrope line — "it's all (frame) about the / first touch" — with a small
 * rounded image frame INLINE in the text. Six stills HARD-CUT through the
 * frame (equal 250ms beats, the first visible from first paint, hands
 * still last); the 7th cut is the solid #1d1d21
 * panel color; the hands still before it holds a double beat. 300ms later
 * that color frame clip-expands directly into the hero panel's exact rect
 * (0.65s, ease-in-out-quint, radius unwinding to the panel's square
 * corners), covering the still-visible welcome line on the way. The stage
 * background matches the site, so at finish the
 * overlay swaps to transparent and the proxy fades over the identical real
 * panel — an invisible handoff — while the hero's elements rise in on top.
 *
 * Gating: cascade starts only after all stills decode() (hard 1200ms
 * fallback). Scroll locked + page inert for the duration; released on
 * finish, on reduced-motion skip, and on unmount — never left locked.
 *
 * Rendered from app/layout.tsx (OUTSIDE the ScrollSmoother transform
 * context). Plays only when the session's FIRST route is "/", once per
 * full page load.
 */

/** Slide stills — 6 photos, hands-touching still last; the 7th "slide" is
 *  the solid panel color. The FIRST still renders visible from first paint
 *  (no blank frame). */
const SLIDES = [1, 2, 3, 4, 6, 5].map((n) => `/assets/preload-${n}.jpg`);

/* ---- Choreography timing (s) ---- */
/** Equal hard-cut beats, first still from t=0 */
const CASCADE_STEP = 0.25;
/** The LAST still (hands) holds 2× the beat of the others… */
const COLOR_AT = (SLIDES.length - 1) * CASCADE_STEP + CASCADE_STEP * 2;
/** …then the solid color frame lands and expands shortly after */
const EXPAND_AT = COLOR_AT + 0.3;
/** Fast expansion — it swallows the (still-visible) welcome line */
const EXPAND_DUR = 0.65;
/** Finish fires as the expansion completes */
const FINISH_AT = EXPAND_AT + EXPAND_DUR;
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
      // Cascade: HARD CUTS — the first still is already visible (markup);
      // each following still snaps in on an equal beat
      slides.forEach((slide, i) => {
        if (i === 0) return;
        tl.set(slide, { opacity: 1 }, i * CASCADE_STEP);
      });

      // 7th cut: the solid panel-color frame snaps in (via the proxy layer,
      // clipped to the frame's exact rounded rect). The welcome line stays
      // put — the fast expansion simply covers it.
      if (frame && proxy) {
        tl.call(
          () => {
            const f = frame.getBoundingClientRect();
            const radius = getComputedStyle(frame).borderRadius || "0px";
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            gsap.set(proxy, {
              opacity: 1,
              clipPath: `inset(${f.top}px ${vw - f.right}px ${vh - f.bottom}px ${f.left}px round ${radius})`,
            });
          },
          [],
          COLOR_AT,
        );
      }

      // Expansion: the color frame grows directly into the hero panel's
      // exact rect (square corners — radius unwinds to 0 mid-flight),
      // swallowing the welcome line on the way.
      if (frame && proxy) {
        tl.call(
          () => {
            const panel = document.querySelector("[data-hero-panel]");
            const p = panel?.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            gsap.to(proxy, {
              // Fallback: expand to the full viewport if the panel is absent
              clipPath: p
                ? `inset(${p.top}px ${vw - p.right}px ${vh - p.bottom}px ${p.left}px round 0px)`
                : "inset(0px 0px 0px 0px round 0px)",
              duration: EXPAND_DUR,
              ease: EASE.inOutQuint,
            });
          },
          [],
          EXPAND_AT,
        );
      }

      // FINISH: stage bg → transparent (identical surfaces, invisible swap),
      // nav + hero elements fire, proxy fades over the real panel.
      tl.set(root, { pointerEvents: "none" }, FINISH_AT);
      tl.call(
        () => {
          markPreloaderDone();
          unlock();
        },
        [],
        FINISH_AT,
      );
      tl.set(root, { backgroundColor: "transparent" }, FINISH_AT);
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
      {/* Welcome line — Manrope, white on the dark stage, frame inline */}
      <div
        data-pre-line=""
        aria-hidden="true"
        className="flex flex-col items-center gap-[0.15em] text-center font-medium text-ink text-[clamp(28px,3.3vw,52px)] leading-[1.3] tracking-[-0.01em]"
      >
        <span className="flex items-center gap-[0.4em]">
          <span>{copy.line1Before}</span>

          {/* Inline slide frame — the stills cascade through here */}
          <span
            data-pre-frame=""
            className="relative inline-block h-[1.35em] w-[2.05em] overflow-hidden rounded-[0.3em] bg-ink/8"
          >
            {SLIDES.map((src, i) => (
              <span
                key={src}
                data-pre-slide=""
                className={`absolute inset-0 ${i === 0 ? "opacity-100" : "opacity-0"}`}
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

      {/* Color-frame → panel proxy — snaps in clipped to the inline frame's
          rect (the "7th slide"), expands to the hero panel's rect, then
          fades over the identical real panel beneath */}
      <div
        data-pre-panel=""
        aria-hidden="true"
        className="absolute inset-0 bg-raise-2 opacity-0"
        style={{ clipPath: "inset(50% 50% 50% 50%)" }}
      />
    </div>
  );
}
