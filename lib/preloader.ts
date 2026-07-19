/*
 * Preloader → intro-reveal contract. The preloader dispatches
 * "ad:preloader:done" and sets html[data-preloaded="true"] when the reveal
 * may fire (§A6 #0: nav + intro reveals fire after preload).
 *
 * On pages without a preloader (About/Works) the callback fires immediately.
 */
export const PRELOADER_DONE_EVENT = "ad:preloader:done";

export function markPreloaderDone() {
  document.documentElement.dataset.preloaded = "true";
  window.dispatchEvent(new CustomEvent(PRELOADER_DONE_EVENT));
}

/** Runs cb when the preloader finishes (immediately if already done/absent). */
export function onPreloaderDone(cb: () => void): () => void {
  const done =
    document.documentElement.dataset.preloaded === "true" ||
    !document.querySelector("[data-preloader]");
  if (done) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(PRELOADER_DONE_EVENT, handler, { once: true });
  return () => window.removeEventListener(PRELOADER_DONE_EVENT, handler);
}
