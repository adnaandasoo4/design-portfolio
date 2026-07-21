"use client";

/*
 * Footer — 100svh redesign (user-directed, 2026-07-19; reference = MONOLOG
 * footer screenshots — the supplied images are the source of truth).
 *
 * The WHOLE footer is one viewport: content block 70svh + gradient band
 * 30svh. Top block: "(navigation)" big-link list (left) + details /
 * socials / ask-AI columns (right); meta row (live Baltimore clock ·
 * back-to-top · copyright) spans toward the right, pinned above the band.
 * Big-link type is clamped by BOTH width and height (min(3.2vw, 6svh))
 * so five rows + meta always clear 70svh at desktop heights ~700–1100px
 * (row padding is py-1.5 — the fifth row ate the py-2 slack at ~700px).
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

/* Cross-route scroll handoff: home-only anchors (#hero, #disciplines) route
 * home first; the target is parked in sessionStorage and consumed by the
 * home page's Footer on mount, which finishes the trip through the same
 * scrollToSection mechanism. TTL guards against stale entries (aborted
 * navigations, refreshes mid-transition). */
const PENDING_SCROLL_KEY = "footer:pending-scroll";
const PENDING_SCROLL_TTL_MS = 3000;

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

/** Ask-AI tool icons — official brand marks (Simple Icons; Grok via LobeHub),
 * 24×24 viewBox filled with currentColor so the link's hover color applies. */
const ASK_AI_ICON_PATHS: Record<string, string> = {
  openai:
    "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  claude:
    "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z",
  gemini:
    "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
  grok: "M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815",
};

function AskAiIcon({ label }: { label: string }) {
  const d = ASK_AI_ICON_PATHS[label];
  if (!d) return null;
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
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
    // Sized to match the (my details) column type at both breakpoints
    <div className="text-[18px]/[1.4] text-ink max-b700:text-[15px]/[1.4]">
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
  "relative text-[clamp(28px,min(3.2vw,6svh),54px)]/[1.12] font-medium " +
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
  "group relative flex items-center justify-between gap-6 py-1.5 pr-4 " +
  "text-[clamp(28px,min(3.2vw,6svh),54px)]/[1.12] " +
  // Mobile (MONOLOG ref): bigger rows, medium weight, taller tap targets
  "max-b700:py-3 max-b700:text-[34px] max-b700:font-medium";

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

  /* Finish a routed scroll: when the home page's Footer mounts with a parked
   * target (set below by goScroll on another page), scroll to it in-page. */
  useEffect(() => {
    if (pathname !== "/") return;
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(PENDING_SCROLL_KEY);
      if (raw !== null) sessionStorage.removeItem(PENDING_SCROLL_KEY);
    } catch {
      /* storage unavailable — land at top, same as the #hero case */
    }
    if (raw === null) return;
    const sep = raw.lastIndexOf("|");
    const target = raw.slice(0, sep);
    const stamp = Number(raw.slice(sep + 1));
    if (!target || Date.now() - stamp > PENDING_SCROLL_TTL_MS) return;
    // Wait one frame so home layout (and Lenis) settle before scrolling.
    const id = requestAnimationFrame(() => scrollToSection(target));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  /** Scroll links. Every page ends in the footer, so #footer (contact)
   *  scrolls in place anywhere; all other anchors (#hero, #disciplines)
   *  live on "/" only — off "/" they route home first, parking non-top
   *  targets for the handoff effect above to finish. */
  const goScroll = (target: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (target !== "#footer" && pathname !== "/") {
      if (target !== "#hero") {
        try {
          sessionStorage.setItem(
            PENDING_SCROLL_KEY,
            `${target}|${Date.now()}`,
          );
        } catch {
          /* storage unavailable — land at top, same as the #hero case */
        }
      }
      navigateWithVeil((href) => router.push(href), "/");
    } else scrollToSection(target);
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
      {/* ---- Top block: navigation + columns — 70svh (7/10 viewport) ---- */}
      <div className="flex min-h-[70svh] flex-col bg-bg px-9 pt-8 pb-5 max-b700:px-5.5">
        <div className="grid grid-cols-[1fr_0.85fr] gap-x-[8vw] max-b860:grid-cols-1 max-b860:gap-y-14">
          {/* LEFT — "(navigation)" + big links. Mobile (MONOLOG ref): the
              eyebrow disappears and the ruled rows start immediately. */}
          <div>
            <div className="max-b700:hidden">
              <Eyebrow>{footer.navEyebrow}</Eyebrow>
            </div>
            <nav aria-label="Footer">
              <ul className="mt-5 max-b700:mt-0">
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

          {/* RIGHT — details / socials / ask-AI columns. Mobile (MONOLOG
              ref): details + socials sit side by side, ask-AI spans below. */}
          <div className="grid grid-cols-[1.3fr_1fr_1fr] content-start gap-x-10 gap-y-10 max-b700:grid-cols-[1.25fr_1fr] max-b700:gap-x-6 max-b700:gap-y-14">
            {/* (details) */}
            <div>
              <Eyebrow>{footer.detailsEyebrow}</Eyebrow>
              <button
                type="button"
                data-foot-copy
                onClick={onCopyClick}
                className="group relative mt-5 inline-flex cursor-pointer items-center border-0 bg-transparent p-0 text-[18px]/[1.4] max-b700:text-[15px]/[1.4]"
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
              <p className="mt-4 text-[16px]/[1.55] whitespace-pre-line text-muted-1 max-b700:text-[13px]/[1.55]">
                {footer.basedIn}
              </p>
            </div>

            {/* (socials) — mobile: hugs the right edge like back-to-top */}
            <div className="max-b700:justify-self-end max-b700:text-right">
              <Eyebrow>{footer.socialsEyebrow}</Eyebrow>
              <ul className="mt-5 flex flex-col items-start gap-1 max-b700:items-end">
                {footer.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="group relative inline-block text-[19px]/[1.2] text-ink max-b700:text-[21px]/[1.5]"
                    >
                      <span aria-hidden="true" className={SOCIAL_FLOOD} />
                      <span className={SOCIAL_LABEL}>{s.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* (ask ai about me) — mobile: spans under both columns */}
            <div className="max-b700:col-span-2">
              <Eyebrow>{footer.askAiEyebrow}</Eyebrow>
              <ul className="mt-5 flex flex-wrap items-center gap-4">
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

        {/* ---- Meta row (right above the gradient): clock bottom-left;
             right side stacks back-to-top OVER the bilingual sign-off ---- */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-6 pt-6 text-[19px]/[1.5]">
          <LocalClock />
          <div className="flex flex-col items-end gap-2 text-right">
            <button
              type="button"
              data-back-top
              onClick={() => scrollToTop()}
              className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[19px]/[1.5] text-ink transition-transform duration-(--dur-copy-2) ease-(--ease-out-expo) motion-safe:hover:-translate-y-0.5 motion-safe:focus-visible:-translate-y-0.5 max-b700:text-[15px]/[1.5]"
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
            {/* Bilingual sign-off — JP sub-line keeps the dimmer treatment */}
            <div className="flex flex-col gap-1">
              <p className="text-[19px]/[1.4] whitespace-nowrap text-ink max-b700:text-[15px]/[1.4]">
                {footer.metaLatin}
              </p>
              <p
                lang="ja"
                className="font-ja text-[14px]/[1.4] tracking-[0.14em] whitespace-nowrap text-text-38 max-b700:text-[11px]/[1.4]"
              >
                {footer.metaJa}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Bottom block: WebGL gradient band, curtain-revealed ----
           30svh (3/10 viewport) — slot and fixed band heights MUST match.
           The in-flow slot reserves the height; the band itself is FIXED to
           the viewport bottom and clip-path'd to the slot, so scrolling the
           last stretch expands the visible strip up from the bottom edge —
           the band stays stationary while the page lifts off it.
           (clip-path clips fixed descendants without moving them.) */}
      <div
        data-band-clip=""
        className="relative h-[30svh] min-h-48 [clip-path:inset(0)]"
      >
        <div className="fixed inset-x-0 bottom-0 h-[30svh] min-h-48">
          <FooterGradient />
        </div>
      </div>
    </footer>
  );
}
