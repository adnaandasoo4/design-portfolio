/*
 * ArrowLink — the arrow-tailed text-link idiom (§A6 #4 work-list "See All",
 * the home About section's "Read more"): Manrope 500 clamp(20px,1.8vw,26px)
 * `text-ink` label + 26×26 stroked arrow. Focus ring comes from the global
 * :focus-visible rule (§A10).
 *
 * HOVER (2026-09-03) — the site's shared text-link motion, the same recipe
 * the footer's big links and the nav's menu rows use: label and arrow glide
 * right together on --dur-track / ease-out-quart, transitioning `translate`
 * and nothing else. The arrow travels twice the label's distance, so the
 * gap opens as the pair moves and the link reads as pulling toward where it
 * goes rather than sliding as a block.
 *
 * What it deliberately does NOT take from the footer recipe is the flood —
 * that is a treatment for a full-width row in a list, and behind an inline
 * link in flowing copy it would be a new pattern rather than a shared one.
 *
 * Tailwind v4 pitfall, as in CtaButton and Footer: translate-* utilities set
 * the CSS `translate` property, which is exactly the property transitioned
 * here — so the rest/hover states use translate-* and never [transform:].
 * Reduced motion: motion-safe-gated, so nothing moves.
 */
import Link from "next/link";

const LABEL =
  "[transition:translate_var(--dur-track)_var(--ease-out-quart)] " +
  "motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1";

const ARROW =
  "[transition:translate_var(--dur-track)_var(--ease-out-quart)] " +
  "motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2";

export default function ArrowLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3.5 font-medium leading-none text-ink text-[clamp(20px,1.8vw,26px)] ${className}`}
    >
      <span className={LABEL}>{children}</span>
      <svg
        className={ARROW}
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </Link>
  );
}
