"use client";

/*
 * Theme toggle (§A5 [data-themetoggle]). 34×34 white button, half-filled
 * circle icon. Toggles html[data-theme="light"] → whole-canvas invert(1)
 * (transition lives in globals.css) and persists localStorage['ad-theme'].
 * Init before paint is handled by the inline head script in app/layout.tsx —
 * here we only observe/toggle the attribute. State is read via
 * useSyncExternalStore so SSR renders the default (dark) and the client
 * syncs from whatever the head script applied.
 */
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () =>
  document.documentElement.getAttribute("data-theme") === "light";
const getServerSnapshot = () => false;

export default function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !light;
    if (next) {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem("ad-theme", next ? "light" : "dark");
    } catch {
      /* storage unavailable — theme still toggles for the session */
    }
  };

  return (
    <button
      type="button"
      data-themetoggle=""
      onClick={toggle}
      aria-label="Toggle light mode"
      aria-pressed={light}
      className="pointer-events-auto grid size-8.5 cursor-pointer place-items-center rounded-btn bg-ink"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="#111214" strokeWidth="2" />
        <path d="M12 4a8 8 0 0 0 0 16Z" fill="#111214" />
      </svg>
    </button>
  );
}
