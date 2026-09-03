"use client";

/*
 * ArrowLink — the arrow-tailed text-link idiom (§A6 #4 work-list "See All",
 * the home About section's "Read more"): Manrope 500 at --text-lead in
 * `text-ink`, plus a 26×26 stroked arrow. Focus ring comes from the global
 * :focus-visible rule (§A10).
 *
 * That size token is SHARED with the About section's body copy (user,
 * 2026-09-03): the paragraphs and the link that follows them are one voice,
 * and a link set smaller than the copy it belongs to reads as a footnote to
 * it. Change the token, not this class.
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
 *
 * NAVIGATION goes through the route veil (2026-09-03) — it used to be a bare
 * next/link, so "Read more" and "See All" hard-cut to the next page while
 * every nav link faded. See components/site/RouteVeil.
 */
import Link from "next/link";
import { useVeiledRoute } from "@/components/site/RouteVeil";

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
  const goRoute = useVeiledRoute();

  return (
    <Link
      href={href}
      onClick={goRoute(href)}
      className={`group inline-flex items-center gap-3.5 font-medium leading-none text-ink text-lead ${className}`}
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
