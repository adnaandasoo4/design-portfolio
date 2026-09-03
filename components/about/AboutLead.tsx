/*
 * Lead — the first-touch line, alone on a screen, indented deep into the
 * measure so it starts where the headline above it ended rather than at the
 * gutter.
 *
 * It sits between the display headline and the body: the page's argument,
 * not its metadata. That used to be a face distinction — the body tier was
 * a system mono and this line was Manrope — but the site is two faces now
 * (HK Grotesk Wide for headers, Manrope for everything else), so size and
 * measure carry it alone. The indent is the one device carried over from
 * the section this page replaces, which is the only part of it that was
 * working.
 */
import { about } from "@/content/about";

export default function AboutLead() {
  return (
    <section
      aria-label="Introduction"
      className="relative bg-bg px-5 py-[clamp(120px,20vh,260px)] max-b700:px-4 max-b700:py-24"
    >
      <p
        data-reveal=""
        className="ml-[36%] max-w-[26ch] text-[clamp(22px,2.7vw,46px)]/[1.22] font-medium tracking-[-0.018em] text-ink text-pretty max-b860:ml-0 max-b860:max-w-[30ch]"
      >
        {about.opening}
      </p>
    </section>
  );
}
