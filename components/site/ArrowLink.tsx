/*
 * ArrowLink — the arrow-tailed "See All" CTA idiom (§A6 #4 work-list CTA,
 * reused by the About closing §A9): Manrope 500 clamp(20px,1.8vw,26px) white
 * label + 26×26 stroked arrow. Focus ring comes from the global
 * :focus-visible rule (§A10).
 */
import Link from "next/link";

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
      className={`inline-flex items-center gap-3.5 font-medium leading-none text-white text-[clamp(20px,1.8vw,26px)] ${className}`}
    >
      {children}
      <svg
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
