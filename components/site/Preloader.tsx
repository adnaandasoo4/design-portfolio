"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { EASE, DUR } from "@/lib/gsap/motion";
import { markPreloaderDone } from "@/lib/preloader";
import { preloader as copy } from "@/content/copy";

/*
 * Preloader — dark welcome + pill-to-panel handoff (user-directed redesign,
 * 2026-07-19).
 *
 * Off-black #111214 stage (identical to the site surface); a centered white
 * Manrope line — "it's all (frame) about the / first touch" — with a small
 * rounded image frame INLINE in the text. Seven stills fade through the
 * frame (opacity 0→1, ~0.5s each, staggered 380 + i·120 ms). Then, 300ms
 * after the last still: the welcome line fades and a raised #1d1d21 PILL
 * clip-expands from the frame's exact rect into the hero panel's exact rect
 * (0.9s, ease-in-out-quint, radius morphs 999px → the panel's 10px). The
 * stage background matches the site, so at finish the overlay swaps to
 * transparent and the proxy fades over the identical real panel — an
 * invisible handoff — while the hero's elements rise in on top.
 *
 * Gating: cascade starts only after all stills decode() (hard 1200ms
 * fallback). Scroll locked + page inert for the duration; released on
 * finish, on reduced-motion skip, and on unmount — never left locked.
 *
 * Rendered from app/layout.tsx (OUTSIDE the ScrollSmoother transform
 * context). Plays only when the session's FIRST route is "/", once per
 * full page load.
 */

/** Slide stills, shown in order through the inline frame. */
const SLIDES = [1, 2, 3, 4, 5, 6, 7].map((n) => `/assets/preload-${n}.jpg`);

/* ---- Choreography timing (s) ---- */
const CASCADE_START = 0.38; // first slide at 380ms
const CASCADE_STEP = 0.12; // + i·120ms → 380, 500, …, 1100ms
const SLIDE_FADE = 0.5; // per-slide opacity fade (ease-out)
/** Pill expansion starts 300ms after the last slide: 380 + 7·120 + 300 */
const EXPAND_AT = CASCADE_START + SLIDES.length * CASCADE_STEP + 0.3;
/** Welcome line fades as the pill takes over */
const TEXT_FADE = 0.25;
/** Finish fires +900ms after expansion starts (= expansion end): 2420ms */
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
      const line = root.querySelector<HTMLElement>("[data-pre-line]");
      const proxy = root.querySelector<HTMLElement>("[data-pre-panel]");

      const tl = gsap.timeline({ paused: true });
      // Cascade: stills fade through the inline frame at 380 + i·120 ms
      slides.forEach((slide, i) => {
        tl.to(
          slide,
          { opacity: 1, duration: SLIDE_FADE, ease: "power1.out" },
          CASCADE_START + i * CASCADE_STEP,
        );
      });

      // Welcome line hands off to the pill
      if (line) {
        tl.to(
          line,
          { autoAlpha: 0, duration: TEXT_FADE, ease: "power1.out" },
          EXPAND_AT,
        );
      }

      // Pill → panel: measured at runtime so the clip starts on the inline
      // frame's exact rect and lands on the hero panel's exact rect.
      if (frame && proxy) {
        tl.call(
          () => {
            const f = frame.getBoundingClientRect();
            const panel = document.querySelector("[data-hero-panel]");
            const p = panel?.getBoundingClientRect();
            const endRadius = panel
              ? getComputedStyle(panel).borderRadius || "10px"
              : "10px";
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            gsap.set(proxy, {
              opacity: 1,
              clipPath: `inset(${f.top}px ${vw - f.right}px ${vh - f.bottom}px ${f.left}px round 999px)`,
            });
            gsap.to(proxy, {
              // Fallback: expand to the full viewport if the panel is absent
              clipPath: p
                ? `inset(${p.top}px ${vw - p.right}px ${vh - p.bottom}px ${p.left}px round ${endRadius})`
                : "inset(0px 0px 0px 0px round 0px)",
              duration: DUR.rect,
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

      {/* Pill→panel proxy — starts clipped to the inline frame (fully
          rounded), expands to the hero panel's rect, then fades over the
          identical real panel beneath */}
      <div
        data-pre-panel=""
        aria-hidden="true"
        className="absolute inset-0 bg-raise-2 opacity-0"
        style={{ clipPath: "inset(50% 50% 50% 50% round 999px)" }}
      />
    </div>
  );
}
