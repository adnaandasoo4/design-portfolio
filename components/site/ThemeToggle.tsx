"use client";

/*
 * Theme toggle (user-directed 2026-09-02, relocated same day) — a square
 * button living in the nav's right cluster, beside the Menu.
 *
 * It started in the bottom-right gutter, mirroring the reference's
 * bulb-in-a-box. It moved here when the hero's headline and paragraph were
 * dropped to a 20px bottom margin: at that depth the paragraph runs
 * straight through the bottom-right corner, and the corner lost. Sitting in
 * the nav costs it nothing — it rode the nav's scroll choreography before
 * and now simply inherits it, so this component holds no motion of its own.
 *
 * ICON: two layers in a clipped window, swapped vertically — the same
 * motion idiom as CtaButton's label/arrow swap, so the chrome all moves in
 * one vocabulary. The icon shows the DESTINATION, not the current state: a
 * sun while the site is dark, a moon while it is light. Which layer sits in
 * the window is decided in pure CSS by the `theme-light:` variant reading
 * html[data-theme], so there is no React state to hydrate and no flash of
 * the wrong glyph on first paint.
 */
import { useRef } from "react";
import { toggleTheme } from "@/lib/theme";
import { nav as navCopy } from "@/content/copy";

const ICON_LAYER =
  "absolute inset-0 flex items-center justify-center " +
  "transition-[transform] duration-(--dur-swap) ease-(--ease-out-expo) " +
  "motion-reduce:transition-none";

function SunGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[17px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 2.4v2.2M12 19.4v2.2M4.2 12H2M22 12h-2.2M6.5 6.5 4.9 4.9M19.1 19.1l-1.6-1.6M17.5 6.5l1.6-1.6M4.9 19.1l1.6-1.6" />
    </svg>
  );
}

function MoonGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[17px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const button = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={button}
      type="button"
      onClick={() => toggleTheme(button.current)}
      title={navCopy.themeToggleLabel}
      aria-label={navCopy.themeToggleLabel}
      className="group pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-btn border-0 bg-raise-2 p-0 text-ink transition-colors duration-(--dur-hover) ease-(--ease-std) hover:bg-ink hover:text-bg focus-visible:bg-ink focus-visible:text-bg"
    >
      {/* Clipped window — the two glyph layers swap vertically. Sun rests in
          view while dark; light mode lifts it out and brings the moon up
          from below. */}
      <span
        aria-hidden="true"
        className="relative block size-[17px] overflow-hidden"
      >
        <span
          className={`${ICON_LAYER} theme-light:[transform:translateY(-150%)]`}
        >
          <SunGlyph />
        </span>
        <span
          className={`${ICON_LAYER} [transform:translateY(150%)] theme-light:[transform:translateY(0px)]`}
        >
          <MoonGlyph />
        </span>
      </span>
    </button>
  );
}
