/*
 * Preloader → intro-reveal contract. The preloader dispatches
 * "ad:preloader:done" and sets html[data-preloaded="true"] when the reveal
 * may fire (§A6 #0: nav + intro reveals fire after preload).
 *
 * WHAT IS WAITING ON THIS: the nav bar's arrival swipe, and the hero's whole
 * opening — the reel's clip, its caption and the split headline lines, all of
 * which start hidden. So a signal that never arrives does not mean "no
 * animation", it means the top of the site stays BLANK. That makes this the
 * one contract on the site that has to be un-hangable, and it was not:
 *
 *   - "no preloader here" was inferred from whether a [data-preloader] node
 *     happened to be in the DOM when someone asked. True for /about and
 *     /works, and true on "/" for any subscriber that runs before the
 *     preloader mounts or after it has already gone;
 *   - a preloader that mounted and then died without finishing — its tree
 *     regenerated after a hydration mismatch, a route change mid-play, an
 *     error in its own timeline — left every subscriber waiting forever.
 *
 * Both holes are closed below: the preloader now SAYS when it is not going to
 * play (see Preloader's `play` branch), and every subscription carries a
 * deadline regardless.
 */
export const PRELOADER_DONE_EVENT = "ad:preloader:done";

/**
 * Longest anything will wait before revealing itself anyway.
 *
 * The choreography is fixed and known: the cascade starts at 380ms, runs 8
 * slides at 150ms, holds 300ms, then expands for 1.15s — about 2.6s, plus a
 * 1.2s hard fallback if the stills never decode. 6s clears all of it with
 * room to spare, so this can only ever fire when something has genuinely
 * gone wrong, never as part of the normal flow.
 */
const SAFETY_MS = 6000;

export function markPreloaderDone() {
  document.documentElement.dataset.preloaded = "true";
  window.dispatchEvent(new CustomEvent(PRELOADER_DONE_EVENT));
}

/** True once the preloader has reported, or when there is none to report. */
function alreadyDone() {
  return (
    document.documentElement.dataset.preloaded === "true" ||
    !document.querySelector("[data-preloader]")
  );
}

/** Runs cb when the preloader finishes — immediately if it already has or
 *  there is none, and at the latest after SAFETY_MS whatever happens. */
export function onPreloaderDone(cb: () => void): () => void {
  if (alreadyDone()) {
    cb();
    return () => {};
  }

  let fired = false;
  const stop = () => {
    window.removeEventListener(PRELOADER_DONE_EVENT, onEvent);
    window.clearTimeout(timer);
  };
  const run = () => {
    if (fired) return;
    fired = true;
    stop();
    cb();
  };
  const onEvent = () => run();

  window.addEventListener(PRELOADER_DONE_EVENT, onEvent);
  const timer = window.setTimeout(() => {
    // The preloader never reported. Latch the flag so anything subscribing
    // after this point is told immediately rather than waiting its own 6s.
    document.documentElement.dataset.preloaded = "true";
    run();
  }, SAFETY_MS);

  return stop;
}
