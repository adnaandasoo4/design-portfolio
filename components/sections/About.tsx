/*
 * About — §A6 #2 (minimal-hero build = NO pin).
 * Mission blurb right after the hero, rendered at full ink immediately
 * (scroll-driven word fill removed). Editorial layout per user reference
 * (2026-07-20): generous vertical padding, a large first-line indent so the
 * opening starts deep into the measure, and the block wrapping well short
 * of the right edge — offset, ragged, deliberate.
 */

import { aboutBlurb } from "@/content/copy";

export default function About() {
  return (
    <section
      id="about"
      aria-label="About"
      className="relative z-(--z-about) bg-bg px-9 py-[clamp(160px,24vh,300px)] max-b700:px-5.5 max-b700:py-28"
    >
      <p className="mx-auto max-w-[76%] indent-[36%] font-medium text-[clamp(28px,3.9vw,62px)] leading-[1.2] tracking-[-0.016em] text-ink text-pretty max-b700:max-w-full max-b700:indent-[20%]">
        {aboutBlurb}
      </p>
    </section>
  );
}
