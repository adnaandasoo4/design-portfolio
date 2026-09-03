/*
 * Theme store (2026-09-02). The site ships dark-first; light mode is an
 * opt-in the visitor toggles, persisted in localStorage.
 *
 * The ONLY state is `document.documentElement.dataset.theme` — every color
 * in the site resolves through the raw `--c-*` layer that attribute swaps
 * (app/globals.css), so flipping it repaints everything with no React
 * re-render and no per-component theme prop.
 *
 * Applying it is deliberately split from animating it: `applyTheme` is the
 * whole mechanism, `toggleTheme` only decorates the swap with a circular
 * View Transition wiping out from the toggle button. Browsers without the
 * API, and reduced-motion visitors, take the same code path minus the
 * animation — the theme still changes, it just cuts.
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

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* private mode / storage disabled — the theme still applies for this page */
  }
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Flip the theme, wiping the new one open from `origin`'s center.
 * @param origin the element the visitor clicked — the wipe radiates from it.
 */
export function toggleTheme(origin?: HTMLElement | null) {
  const next: Theme = getTheme() === "light" ? "dark" : "light";
  const root = document.documentElement;

  // startViewTransition is progressive enhancement; typed loosely because
  // lib.dom.d.ts only recently gained it.
  const start = (
    document as Document & {
      startViewTransition?: (cb: () => void) => {
        ready: Promise<void>;
        updateCallbackDone: Promise<void>;
        finished: Promise<void>;
      };
    }
  ).startViewTransition;

  // A hidden document cannot snapshot, so the browser aborts the transition
  // the moment it starts. Skip straight to the flip rather than start one
  // we know will fail.
  if (!start || prefersReducedMotion() || document.visibilityState !== "visible") {
    applyTheme(next);
    return;
  }

  // Anchor the wipe on the button, and size it to reach the furthest corner
  // so the circle always finishes covering the viewport.
  const r = origin?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
  const y = r ? r.top + r.height / 2 : window.innerHeight / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.style.setProperty("--theme-r", `${radius}px`);
  root.dataset.themeAnim = "";

  const transition = start.call(document, () => applyTheme(next));

  // ALL THREE of a ViewTransition's promises reject when the browser skips
  // the transition — the tab went hidden, or a second toggle superseded
  // this one. Any of them left unhandled surfaces as an unhandled rejection
  // ("InvalidStateError: Transition was aborted because of invalid state"),
  // so every one needs a catch, not just the one we actually await. The
  // theme itself is already applied by the callback regardless; the only
  // thing left to do is clear the animation flag.
  transition.ready.catch(() => {});
  transition.updateCallbackDone.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      delete root.dataset.themeAnim;
    });
}
