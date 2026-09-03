/*
 * Theme store (2026-09-02; view-transition sweep removed 2026-09-03).
 *
 * The ONLY state is `document.documentElement.dataset.theme` — every color
 * in the site resolves through the raw `--c-*` layer that attribute swaps
 * (app/globals.css), so flipping it repaints everything with no React
 * re-render and no per-component theme prop.
 *
 * The swap is a hard cut, deliberately (user-directed 2026-09-03). It used
 * to wipe open from the toggle inside a View Transition; that glitched, so
 * the decoration is gone — flipping the attribute is the whole mechanism.
 */

export type Theme = "dark" | "light";

export const THEME_KEY = "ad-theme";

/** Inlined in <head> before first paint — see app/layout.tsx. Keep in sync
 *  with THEME_KEY; it cannot import (it runs before any bundle). */
export const NO_FLASH_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;

export function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Flip the theme. Instant — no transition, no animation. */
export function toggleTheme() {
  const next: Theme = getTheme() === "light" ? "dark" : "light";
  const root = document.documentElement;

  // A handful of elements carry hover `transition: color` (Nav, Footer, the
  // toggle itself). Left alone they'd fade to their new token over 0.3–0.45s
  // while the rest of the page cuts, so the swap trails. Kill transitions
  // for the frame the attribute changes, then hand them back.
  root.dataset.themeCut = "";
  root.dataset.theme = next;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      delete root.dataset.themeCut;
    });
  });
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* private mode / storage disabled — the theme still applies for this page */
  }
}
