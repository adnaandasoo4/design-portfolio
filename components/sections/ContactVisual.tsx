import Image from "next/image";
import { contactVisual } from "@/content/copy";

/*
 * Contact visual (user-directed, 2026-07-19) — replaces the big CONTACT
 * statement section: full-viewport monochrome desk photo with a stark
 * white typographic line overtop.
 *
 * Grayscale sits on the WRAPPER (not the img) so the light-theme
 * counter-invert on img (§A5) composes with it instead of being clobbered
 * by its !important filter.
 */
export default function ContactVisual() {
  return (
    <section
      id="contact-visual"
      aria-label="Contact"
      className="relative z-(--z-section) h-svh w-full overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 grayscale">
        <Image
          src={contactVisual.imageSrc}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Soft dim so the line stays stark over bright areas */}
        <div className="absolute inset-0 bg-bg/30" />
      </div>
      <div className="relative flex h-full flex-col items-center justify-center gap-6 px-9 text-center">
        <p className="text-[14px]/[1] tracking-[0.04em] text-ink-1">
          {contactVisual.eyebrow}
        </p>
        <h2 className="text-[clamp(56px,10vw,190px)]/[1] font-medium tracking-[-0.02em] text-ink">
          {contactVisual.heading}
        </h2>
        <p className="max-w-[34em] text-[clamp(17px,1.4vw,22px)]/[1.5] text-ink-1">
          {contactVisual.sub}
        </p>
      </div>
    </section>
  );
}
