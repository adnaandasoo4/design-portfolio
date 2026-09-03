/*
 * Lead — the first-touch line, alone on a screen, indented deep into the
 * measure so it starts where the headline above it ended rather than at the
 * gutter.
 *
 * Set in Manrope rather than the mono tier: it is the page's argument, not
 * its metadata, and it needs to sit between the display headline and the
 * mono body instead of joining one of them. The indent is the one device
 * carried over from the section this page replaces, which is the only part
 * of it that was working.
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
