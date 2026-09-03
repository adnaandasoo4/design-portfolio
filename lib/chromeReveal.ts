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
 * One flag, `shown`: any scroll DOWN hides the chrome, any scroll UP shows
 * it, and sitting within TOP_EPS_PX of the document top always counts as
 * shown. (An `atTop` flag lived here for the vermilion banner, which
 * returned only at the very top; the banner was dropped 2026-09-02 and the
 * flag went with it.)
 */
import { ScrollTrigger } from "@/lib/gsap/register";

export type ChromeState = {
  /** direction rule — false after any scroll down, true after any scroll up */
  shown: boolean;
};

type Listener = (state: ChromeState) => void;

/** Within this many px of the top counts as "at the top". */
const TOP_EPS_PX = 8;

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
    trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const atTop = self.scroll() <= TOP_EPS_PX;
        publish({ shown: atTop || self.direction === -1 });
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
