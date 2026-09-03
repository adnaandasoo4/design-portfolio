"use client";

/*
 * Shared scroll-direction state for the fixed chrome (2026-09-02).
 *
 * The top nav and the bottom-right theme toggle hide and return together,
 * so they must agree frame-for-frame. Rather than give each component its
 * own ScrollTrigger — two triggers reading the same scroller, free to drift
 * — this module owns exactly ONE, created on the first subscribe and killed
 * when the last subscriber leaves.
 *
 * One flag, `shown`. Sitting within TOP_EPS_PX of the document top always
 * counts as shown; otherwise it takes a deliberate GESTURE to flip, not a
 * single frame's direction.
 *
 * Direction alone was the original rule, and it was fine while hiding only
 * nudged the chrome 28px sideways. Once the nav started leaving the frame
 * vertically, the same rule read as the nav vanishing at the slightest
 * touch — and Lenis makes it worse, because a lerped scroll settles with
 * sub-pixel steps whose sign flips, so `direction` alone can flicker while
 * the page is effectively still.
 *
 * So travel is ACCUMULATED instead. Scrolling down banks distance toward
 * hiding and zeroes the up counter; scrolling up does the reverse. Neither
 * flips until its threshold is passed, which means jitter around zero can
 * never reach one. Hiding asks for a real push (HIDE_AFTER_PX); showing is
 * deliberately much cheaper (SHOW_AFTER_PX), because a visitor reaching for
 * the nav should not have to hunt for it.
 */
import { ScrollTrigger } from "@/lib/gsap/register";

export type ChromeState = {
  /** direction rule — false after any scroll down, true after any scroll up */
  shown: boolean;
};

type Listener = (state: ChromeState) => void;

/** Within this many px of the top counts as "at the top". */
const TOP_EPS_PX = 8;
/** Sustained downward travel before the chrome hides. */
const HIDE_AFTER_PX = 64;
/** Upward travel before it comes back — smaller, so it returns eagerly. */
const SHOW_AFTER_PX = 24;

let state: ChromeState = { shown: true };
const listeners = new Set<Listener>();
let trigger: ScrollTrigger | null = null;

function publish(next: ChromeState) {
  if (next.shown === state.shown) return;
  state = next;
  for (const listener of listeners) listener(state);
}

/**
 * Subscribe to chrome visibility. The listener is called once immediately
 * with the current state (so a late subscriber is never out of sync), then
 * on every change. Returns an unsubscribe.
 */
export function subscribeChrome(listener: Listener): () => void {
  listeners.add(listener);

  if (!trigger) {
    let lastY = 0;
    let downTravel = 0;
    let upTravel = 0;

    trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const y = self.scroll();
        const dy = y - lastY;
        lastY = y;

        if (y <= TOP_EPS_PX) {
          downTravel = 0;
          upTravel = 0;
          publish({ shown: true });
          return;
        }

        if (dy > 0) {
          downTravel += dy;
          upTravel = 0;
          if (downTravel > HIDE_AFTER_PX) publish({ shown: false });
        } else if (dy < 0) {
          upTravel -= dy;
          downTravel = 0;
          if (upTravel > SHOW_AFTER_PX) publish({ shown: true });
        }
      },
    });
  }

  listener(state);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      trigger?.kill();
      trigger = null;
      // Next mount starts from a clean top-of-page assumption.
      state = { shown: true };
    }
  };
}
