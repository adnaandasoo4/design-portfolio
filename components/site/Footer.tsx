"use client";

/*
 * Footer — 100svh redesign (user-directed, 2026-07-19; reference = MONOLOG
 * footer screenshots — the supplied images are the source of truth).
 *
 * Top block: "(navigation)" big-link list (left) + details / socials /
 * ask-AI columns (right); meta row (live Baltimore clock · back-to-top ·
 * copyright) spans toward the right, pinned above the band.
 * Bottom block: WebGL gradient band (FooterGradient) with brand + tagline.
 *
 * Big-link hover: light-gray flood (--color-ink-1) + black text snap ON
 * instantly, fade OFF at --dur-copy-2; label + arrow glide right subtly on
 * --dur-track ease-out-quart. NOTE: Tailwind v4 translate-* utilities set
 * the CSS `translate` property — transitions must list `translate`, not
 * `transform`, or the shift jumps. The email link reuses the same recipe.
 *
 * The fixed top nav hides while the footer is in view (ScrollTrigger at
 * "top 50%") and returns on scroll-back — the footer carries navigation.
 */

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap/register";
import { DUR, EASE, MQ } from "@/lib/gsap/motion";
import { scrollToSection, scrollToTop } from "@/lib/gsap/SmoothScroll";
import { navigateWithVeil } from "@/components/site/RouteVeil";
import FooterGradient from "@/components/site/FooterGradient";
import { footer, askAiPrompt, EMAIL } from "@/content/copy";

/** How long the SR "email copied" confirmation stays up (§A5 Copy-email) */
const COPY_REVERT_MS = 1700;

/** Column eyebrow — lowercase Manrope, shared by all four headers */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px]/[1] tracking-[0.04em] text-muted-2">{children}</p>
  );
}

/** Enter/return arrow before the email — straight corner per the reference */
function EnterArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 4v9h12" />
      <path d="m13 9 4 4-4 4" />
    </svg>
  );
}

/** Ask-AI tool icons — 24×24, currentColor (spec-exact geometry) */
function AskAiIcon({ label }: { label: string }) {
  switch (label) {
    case "claude":
      // 12-line radial burst
      return (
        <svg
          width="22"
          height="22"
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
          width="22"
          height="22"
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
          width="22"
          height="22"
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
          width="22"
          height="22"
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

/** Live clock — reference "Hanoi City 11:24:20 PM / Monday, Jul 19, 2026 (GMT +07)" */
function LocalClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Server render + first client paint: reserve the two lines, no mismatch.
  if (now === null) return <div aria-hidden="true" className="min-h-[2.9em]" />;

  const zone = { timeZone: footer.clockZone };
  const time = new Intl.DateTimeFormat("en-US", {
    ...zone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);
  const date = new Intl.DateTimeFormat("en-US", {
    ...zone,
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);
  const offset =
    new Intl.DateTimeFormat("en-US", { ...zone, timeZoneName: "shortOffset" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";

  return (
    <div className="text-ink">
      <p>
        {footer.clockCity} {time}
      </p>
      <p>
        {date} ({offset})
      </p>
    </div>
  );
}

/* -------- Big-link hover recipe --------
 * Flood (light gray, --color-ink-1) + label color snap ON instantly (hover
 * duration 0) and fade OFF at --dur-copy-2; label + arrow glide right
 * subtly on --dur-track ease-out-quart (transitioning `translate`). */
const FLOOD =
  "pointer-events-none absolute -inset-x-2 inset-y-0 bg-ink-1 opacity-0 " +
  "transition-opacity duration-(--dur-copy-2) ease-(--ease-std) " +
  "group-hover:opacity-100 group-hover:duration-0 " +
  "group-focus-visible:opacity-100 group-focus-visible:duration-0";

const LABEL =
  "relative text-[clamp(34px,3vw,60px)]/[1.15] font-medium " +
  "tracking-[-0.01em] text-ink " +
  "[transition:color_var(--dur-copy-2)_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "group-hover:[transition:color_0s_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "group-hover:text-bg group-focus-visible:text-bg " +
  "motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2";

const ARROW =
  "relative size-[0.8em] text-bg opacity-0 " +
  "[transition:opacity_var(--dur-copy-2)_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "motion-safe:-translate-x-3 " +
  "motion-safe:group-hover:translate-x-0 motion-safe:group-focus-visible:translate-x-0 " +
  "group-hover:opacity-100 group-focus-visible:opacity-100";

const BIG_LINK =
  "group relative flex items-center justify-between gap-6 py-2.5 pr-4 " +
  "text-[clamp(34px,3vw,60px)]/[1.15]";

function BigLinkInner({ label }: { label: string }) {
  return (
    <>
      <span aria-hidden="true" className={FLOOD} />
      <span className={LABEL}>{label}</span>
      <svg
        className={ARROW}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 12h16" />
        <path d="m13 5 7 7-7 7" />
      </svg>
    </>
  );
}

/* Email link — same hover recipe at detail scale, no copy-confirm
 * choreography (user-removed); SR announcement retained. The underline is a
 * border-bottom (currentColor) so it spans the enter arrow too. */
const EMAIL_FLOOD =
  "pointer-events-none absolute -left-2.5 -right-5 -inset-y-2 bg-ink-1 opacity-0 " +
  "transition-opacity duration-(--dur-copy-2) ease-(--ease-std) " +
  "group-hover:opacity-100 group-hover:duration-0 " +
  "group-focus-visible:opacity-100 group-focus-visible:duration-0";

const EMAIL_LABEL =
  "relative inline-flex items-center border-b border-current text-ink " +
  "[transition:color_var(--dur-copy-2)_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "group-hover:[transition:color_0s_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "group-hover:text-bg group-focus-visible:text-bg " +
  "motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2";

/* Social links — same hover recipe at list scale */
const SOCIAL_FLOOD =
  "pointer-events-none absolute -left-1.5 -right-4 -inset-y-0.5 bg-ink-1 opacity-0 " +
  "transition-opacity duration-(--dur-copy-2) ease-(--ease-std) " +
  "group-hover:opacity-100 group-hover:duration-0 " +
  "group-focus-visible:opacity-100 group-focus-visible:duration-0";

const SOCIAL_LABEL =
  "relative inline-block text-ink " +
  "[transition:color_var(--dur-copy-2)_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "group-hover:[transition:color_0s_ease,translate_var(--dur-track)_var(--ease-out-quart)] " +
  "group-hover:text-bg group-focus-visible:text-bg " +
  "motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2";

export default function Footer() {
  const rootRef = useRef<HTMLElement>(null);
  const copyTimer = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Clear any pending SR-revert timer on unmount.
  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  /* Footer carries navigation while in view: hide the fixed top nav when the
   * footer reaches mid-viewport, bring it back on scroll-up. */
  useGSAP(
    () => {
      const root = rootRef.current;
      const topnav = document.querySelector<HTMLElement>("[data-topnav]");
      if (!root || !topnav) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motionOk, () => {
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top 50%",
          onEnter: () =>
            gsap.to(topnav, {
              yPercent: -100,
              autoAlpha: 0,
              duration: DUR.copy2,
              ease: EASE.outExpo,
              overwrite: "auto",
            }),
          onLeaveBack: () =>
            gsap.to(topnav, {
              yPercent: 0,
              autoAlpha: 1,
              duration: DUR.copy2,
              ease: EASE.outExpo,
              overwrite: "auto",
            }),
        });
        return () => {
          st.kill();
          gsap.set(topnav, { yPercent: 0, autoAlpha: 1 });
        };
      });
      mm.add(MQ.reduced, () => {
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top 50%",
          onEnter: () => gsap.set(topnav, { autoAlpha: 0 }),
          onLeaveBack: () => gsap.set(topnav, { autoAlpha: 1 }),
        });
        return () => {
          st.kill();
          gsap.set(topnav, { autoAlpha: 1 });
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  /** Scroll links. #hero routes home first when off "/"; #footer (contact)
   *  scrolls in place — every page ends in the footer. */
  const goScroll = (target: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (target === "#hero" && pathname !== "/")
      navigateWithVeil((href) => router.push(href), "/");
    else scrollToSection(target);
  };

  /** About / Work: intercept the real <a> and route through the page veil. */
  const goRoute = (target: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === target) return;
    navigateWithVeil((href) => router.push(href), target);
  };

  /** Copy email — no choreography (user-removed); SR confirmation kept. */
  const onCopyClick = () => {
    navigator.clipboard.writeText(EMAIL).then(
      () => {
        setCopied(true);
        if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(
          () => setCopied(false),
          COPY_REVERT_MS,
        );
      },
      () => {},
    );
  };

  return (
    <footer
      id="footer"
      aria-label="Footer"
      ref={rootRef}
      className="relative z-(--z-section) bg-bg"
    >
      {/* ---- Top block: navigation + columns — full viewport ---- */}
      <div className="flex min-h-svh flex-col bg-bg px-9 pt-14 pb-6">
        <div className="grid grid-cols-[1fr_0.85fr] gap-x-[8vw] max-b860:grid-cols-1 max-b860:gap-y-14">
          {/* LEFT — "(navigation)" + big links */}
          <div>
            <Eyebrow>{footer.navEyebrow}</Eyebrow>
            <nav aria-label="Footer">
              <ul className="mt-8">
                {footer.links.map((link) => (
                  <li key={link.label} className="border-b border-line-09">
                    {link.type === "scroll" ? (
                      <Link
                        href={`/${link.target}`}
                        onClick={goScroll(link.target)}
                        className={BIG_LINK}
                      >
                        <BigLinkInner label={link.label} />
                      </Link>
                    ) : (
                      <Link
                        href={link.target}
                        onClick={goRoute(link.target)}
                        className={BIG_LINK}
                      >
                        <BigLinkInner label={link.label} />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* RIGHT — details / socials / ask-AI columns */}
          <div className="grid grid-cols-[1.3fr_1fr_1fr] content-start gap-x-10 gap-y-10 max-b700:grid-cols-1">
            {/* (details) */}
            <div>
              <Eyebrow>{footer.detailsEyebrow}</Eyebrow>
              <button
                type="button"
                data-foot-copy
                onClick={onCopyClick}
                className="group relative mt-7 inline-flex cursor-pointer items-center border-0 bg-transparent p-0 text-[18px]/[1.4]"
              >
                <span aria-hidden="true" className={EMAIL_FLOOD} />
                {/* SR users need to know activation copies (not mails) — §A10 */}
                <span className="sr-only">copy email address: </span>
                <span className={EMAIL_LABEL}>
                  <EnterArrow />
                  {EMAIL}
                </span>
              </button>
              {/* Screen-reader confirmation (§A10) */}
              <span aria-live="polite" className="sr-only">
                {copied ? "email copied" : ""}
              </span>
              <p className="mt-6 text-[16px]/[1.55] whitespace-pre-line text-muted-1">
                {footer.basedIn}
              </p>
            </div>

            {/* (socials) */}
            <div>
              <Eyebrow>{footer.socialsEyebrow}</Eyebrow>
              <ul className="mt-7 flex flex-col items-start gap-1">
                {footer.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="group relative inline-block text-[19px]/[1.2] text-ink"
                    >
                      <span aria-hidden="true" className={SOCIAL_FLOOD} />
                      <span className={SOCIAL_LABEL}>{s.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* (ask ai about me) */}
            <div>
              <Eyebrow>{footer.askAiEyebrow}</Eyebrow>
              <ul className="mt-7 flex flex-wrap items-center gap-4">
                {footer.askAi.map((ai) => (
                  <li key={ai.label}>
                    <a
                      href={ai.base + encodeURIComponent(askAiPrompt)}
                      target="_blank"
                      rel="noopener"
                      aria-label={ai.aria}
                      className="block text-muted-3 transition-colors duration-(--dur-hover) ease-(--ease-std) hover:text-ink focus-visible:text-ink"
                    >
                      <AskAiIcon label={ai.label} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ---- Meta row: clock · back-to-top · bilingual sign-off, full span ---- */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-6 pt-16 text-[19px]/[1.5]">
          <LocalClock />
          <button
            type="button"
            data-back-top
            onClick={() => scrollToTop()}
            className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[19px]/[1.5] text-ink transition-transform duration-(--dur-copy-2) ease-(--ease-out-expo) motion-safe:hover:-translate-y-0.5 motion-safe:focus-visible:-translate-y-0.5"
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
          {/* Bilingual sign-off — latin line white + meta-row size (user);
              JP sub-line keeps the dimmer recurring treatment */}
          <div className="flex flex-col gap-1">
            <p className="text-[19px]/[1.4] whitespace-nowrap text-ink">
              {footer.metaLatin}
            </p>
            <p
              lang="ja"
              className="font-ja text-[14px]/[1.4] tracking-[0.14em] whitespace-nowrap text-text-38"
            >
              {footer.metaJa}
            </p>
          </div>
        </div>
      </div>

      {/* ---- Bottom block: WebGL gradient band, curtain-revealed ----
           The in-flow slot reserves the height; the band itself is FIXED to
           the viewport bottom and clip-path'd to the slot, so scrolling the
           last stretch expands the visible strip up from the bottom edge —
           the band stays stationary while the page lifts off it.
           (clip-path clips fixed descendants without moving them.) */}
      <div
        data-band-clip=""
        className="relative h-[32svh] min-h-60 [clip-path:inset(0)]"
      >
        <div className="fixed inset-x-0 bottom-0 h-[32svh] min-h-60">
          <FooterGradient />
        </div>
      </div>
    </footer>
  );
}
