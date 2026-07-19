"use client";

/*
 * Footer (§A5 / §A6 #7) — top hairline, BiLabel + est. row, 2-col grid
 * (socials + ask-AI · reel video + JP paragraph), bottom row with the
 * oversized copy-email interactive and back-to-top.
 *
 * Motion: §A7 #16 (copy-confirm: check pops on ease-back, revert 1700ms)
 * and #17 (hovers: color .30 ease-std, lift .45 ease-out-expo).
 * Reduced motion: color hovers kept, transforms dropped; the copy-confirm
 * feedback is KEPT (essential), reduced to instant opacity swaps.
 */

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { scrollToTop } from "@/lib/gsap/SmoothScroll";
import BiLabel from "@/components/site/BiLabel";
import { footer, askAiPrompt, EMAIL } from "@/content/copy";

/** Copy-confirm revert delay (§A5 Copy-email) */
const COPY_REVERT_MS = 1700;

/** Footer eyebrow — Manrope 400 12px/1, ls 0.18em, #8a8a8e (§A3) */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px]/[1] font-normal tracking-[0.18em] text-muted-2">
      {children}
    </p>
  );
}

/** Ask-AI tool icons — 24×24, currentColor (spec-exact geometry) */
function AskAiIcon({ label }: { label: string }) {
  switch (label) {
    case "claude":
      // 12-line radial burst
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <line
              key={i}
              x1="17"
              y1="12"
              x2="22"
              y2="12"
              transform={`rotate(${i * 30} 12 12)`}
            />
          ))}
        </svg>
      );
    case "chatgpt":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
        </svg>
      );
    case "gemini":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2c.63 5.53 4.47 9.37 10 10-5.53.63-9.37 4.47-10 10-.63-5.53-4.47-9.37-10-10 5.53-.63 9.37-4.47 10-10Z" />
        </svg>
      );
    case "grok":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8" />
          <path d="M4.5 19.5 19.5 4.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Footer() {
  const rootRef = useRef<HTMLElement>(null);
  const copyIconRef = useRef<SVGSVGElement>(null);
  const checkIconRef = useRef<SVGSVGElement>(null);
  const emailTextRef = useRef<HTMLSpanElement>(null);
  const reelRef = useRef<HTMLVideoElement>(null);
  const revertTimer = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  const { contextSafe } = useGSAP({ scope: rootRef });

  // Clear any pending revert timer on unmount.
  useEffect(() => {
    return () => {
      if (revertTimer.current !== null) window.clearTimeout(revertTimer.current);
    };
  }, []);

  // Reel autoplay (§A10): only when a src exists AND the visitor has not
  // opted into reduced motion — reduced users keep the poster still.
  useEffect(() => {
    if (footer.reelSrc === null) return;
    if (window.matchMedia(MQ.reduced).matches) return;
    reelRef.current?.play().catch(() => {
      /* autoplay blocked — poster remains, which is fine */
    });
  }, []);

  /*
   * Copy-email confirm (§A7 #16). The ref-reading callbacks are created
   * INSIDE the click handler (not during render) and wrapped in contextSafe
   * so their tweens stay scoped to this component's gsap context.
   */
  const onCopyClick = () => {
    /** Revert check → copy after the confirm window. */
    const revertConfirm = contextSafe(() => {
      const copyIcon = copyIconRef.current;
      const checkIcon = checkIconRef.current;
      if (!copyIcon || !checkIcon) return;
      revertTimer.current = null;
      setCopied(false);
      if (window.matchMedia(MQ.reduced).matches) {
        gsap.set(checkIcon, { opacity: 0, scale: 0.6 });
        gsap.set(copyIcon, { opacity: 1, scale: 1 });
        return;
      }
      gsap.to(checkIcon, {
        opacity: 0,
        scale: 0.6,
        duration: DUR.copy,
        ease: EASE.outExpo,
      });
      gsap.to(copyIcon, {
        opacity: 1,
        scale: 1,
        duration: DUR.copy,
        ease: EASE.outExpo,
      });
    });

    /** Confirm choreography — only runs after a successful clipboard write. */
    const playConfirm = contextSafe(() => {
      const copyIcon = copyIconRef.current;
      const checkIcon = checkIconRef.current;
      const text = emailTextRef.current;
      if (!copyIcon || !checkIcon || !text) return;
      if (revertTimer.current !== null)
        window.clearTimeout(revertTimer.current);
      gsap.killTweensOf([copyIcon, checkIcon, text]);
      setCopied(true);

      if (window.matchMedia(MQ.reduced).matches) {
        // Essential feedback KEPT (§A7 #17) — instant opacity swap, no transforms.
        gsap.set(copyIcon, { opacity: 0 });
        gsap.set(checkIcon, { opacity: 1, scale: 1 });
      } else {
        gsap.to(copyIcon, {
          opacity: 0,
          scale: 0.6,
          duration: DUR.copy,
          ease: EASE.outExpo,
        });
        // Check pops in on ease-back (.6 → 1)
        gsap.fromTo(
          checkIcon,
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, duration: DUR.copy2, ease: EASE.back },
        );
        // Text nudge scale .98 → 1 (≈180ms)
        gsap.fromTo(
          text,
          { scale: 0.98 },
          { scale: 1, duration: 0.18, ease: EASE.std },
        );
      }
      revertTimer.current = window.setTimeout(revertConfirm, COPY_REVERT_MS);
    });

    // Only confirm on success; on failure do nothing visible.
    navigator.clipboard.writeText(EMAIL).then(playConfirm, () => {});
  };

  return (
    <footer
      id="footer"
      aria-label="Footer"
      ref={rootRef}
      className="relative z-(--z-section) flex min-h-[44vh] flex-col bg-bg px-9 pt-0 pb-[clamp(40px,5vh,64px)]"
    >
      {/* Top hairline */}
      <div aria-hidden="true" className="h-px bg-line-09" />

      {/* Labels row */}
      <div className="flex items-start justify-between pt-6.5 pb-[clamp(40px,7vh,80px)]">
        <BiLabel latin={footer.metaLatin} ja={footer.metaJa} />
        <p className="text-right text-[16px]/[1.4] font-normal text-text-50">
          {footer.est}
        </p>
      </div>

      {/* Main grid: socials + ask-AI · reel video */}
      <div
        data-foot-grid
        className="grid grid-cols-[1.25fr_1fr] gap-12 max-b700:grid-cols-1 max-b700:gap-11"
      >
        {/* LEFT — socials + ask-AI */}
        <div className="flex flex-col items-start">
          <Eyebrow>{footer.socialsEyebrow}</Eyebrow>
          <ul className="mt-4.5 flex flex-col items-start gap-3.5">
            {footer.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className="text-[19px]/[1] font-normal tracking-[0.02em] text-muted-2 transition-colors duration-(--dur-hover) ease-(--ease-std) hover:text-ink focus-visible:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-11">
            <Eyebrow>{footer.askAiEyebrow}</Eyebrow>
          </div>
          <ul className="mt-4.5 flex items-center gap-5.5">
            {footer.askAi.map((ai) => (
              <li key={ai.label}>
                <a
                  href={ai.base + encodeURIComponent(askAiPrompt)}
                  target="_blank"
                  rel="noopener"
                  aria-label={ai.aria}
                  className="block text-muted-3 [transition:color_var(--dur-hover)_var(--ease-std),transform_var(--dur-copy-2)_var(--ease-out-expo)] hover:text-ink focus-visible:text-ink motion-safe:hover:-translate-y-0.5 motion-safe:focus-visible:-translate-y-0.5"
                >
                  <AskAiIcon label={ai.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT — reel video + JP paragraph */}
        <div
          data-foot-video
          className="flex w-[min(26vw,380px)] flex-col gap-5 max-b700:w-full"
        >
          {/* Autoplaying reel src arrives with the real assets (§A8) —
              poster-only until `footer.reelSrc` is supplied. No autoPlay
              attribute: playback starts from the ref effect below, which is
              gated on prefers-reduced-motion (§A10 — reduced users keep the
              poster still). */}
          <video
            ref={reelRef}
            className="aspect-[16/10] w-full bg-slot-2 object-cover"
            poster={footer.reelPoster}
            muted
            loop
            playsInline
            preload="metadata"
          >
            {footer.reelSrc !== null ? (
              <source src={footer.reelSrc} type="video/mp4" />
            ) : null}
          </video>
          <p
            lang="ja"
            className="font-ja text-[13px]/[2] font-normal tracking-[0.14em] text-muted-3"
          >
            {footer.jaParagraph}
          </p>
        </div>
      </div>

      {/* Bottom row — copy-email + back-to-top */}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-10 pt-11">
        <button
          type="button"
          data-foot-copy
          onClick={onCopyClick}
          className="group inline-flex cursor-pointer items-center gap-[0.3em] border-0 bg-transparent p-0 text-[clamp(28px,3.3vw,58px)]/[1.1] font-medium tracking-[-0.02em] text-ink transition-colors duration-(--dur-hover) ease-(--ease-std) hover:text-accent focus-visible:text-accent"
        >
          {/* SR users need to know activation copies (not mails) — §A10 */}
          <span className="sr-only">copy email address: </span>
          <span ref={emailTextRef} className="inline-block">
            {EMAIL}
          </span>
          {/* Icon slot: slides in on hover/focus (§A7 #17); copy ↔ check (§A7 #16) */}
          <span
            aria-hidden="true"
            className="relative inline-block size-[0.52em] translate-x-2.5 opacity-0 transition-[opacity,transform] duration-(--dur-copy) ease-(--ease-out-expo) group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:translate-x-0"
          >
            <svg
              ref={copyIconRef}
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
            <svg
              ref={checkIconRef}
              className="absolute inset-0 h-full w-full"
              style={{ opacity: 0, transform: "scale(0.6)" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c7c2ce"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.5 12.5 10 18 19.5 6.5" />
            </svg>
          </span>
        </button>
        {/* Screen-reader confirmation (§A10) */}
        <span aria-live="polite" className="sr-only">
          {copied ? "email copied" : ""}
        </span>

        <button
          type="button"
          data-back-top
          onClick={() => scrollToTop()}
          className="inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap border-0 bg-transparent p-0 text-[17px]/[1] font-normal tracking-[0.02em] text-ink transition-transform duration-(--dur-copy-2) ease-(--ease-out-expo) motion-safe:hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1"
        >
          {footer.backToTop}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
