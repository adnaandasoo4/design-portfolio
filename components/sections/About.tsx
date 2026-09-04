"use client";

/*
 * About (§A6 #2) — the home page's statement.
 *
 * NO SCROLL ANIMATION (user, 2026-09-04). Several passes tried to make this
 * section move as you scrolled it — word gaps opening, redistributing,
 * breathing — and none of them landed. What is left is a paragraph whose
 * SHAPE does the work, and one thing that responds to the pointer.
 *
 * ── THE SHAPE ────────────────────────────────────────────────────────────
 * A deep first-line indent, then flush left and ragged right. It is the
 * whole device: the block reads as a set piece rather than body copy, and
 * the indent leaves a bite out of the top-left corner that the eye lands in
 * before it starts reading. Nothing else about the setting is unusual, which
 * is what keeps it from looking like a trick.
 *
 * ── THE GLARE ────────────────────────────────────────────────────────────
 * The paragraph is grey. TWO copies of it are stacked exactly: the grey one
 * you read, and a full-ink one clipped to a soft circle that follows the
 * pointer, so the words under the cursor light up and fall back as it moves
 * on. The mask, the circle and the layer's opacity live in globals.css under
 * [data-glare]; all this does is write where the circle is.
 *
 * Stacking two copies of the same text in the same box is what keeps them in
 * register — same string, same width, same wrap — so the lit copy can never
 * drift a pixel off the grey one. The lit copy is aria-hidden and inert: it
 * is the same sentence, and a screen reader should meet it once.
 *
 * LERP, not the raw pointer (user, 2026-09-04). The circle chases the cursor
 * at LERP per frame rather than being pinned to it, so it arrives a moment
 * late and settles rather than snapping. The fade in and out is lerped on
 * the same ticker, which is why neither is a CSS transition — a transition
 * on top of the lerp would be a second, competing lag.
 *
 * It runs on gsap.ticker rather than its own rAF so it shares the frame with
 * Lenis and ScrollTrigger, and it only listens while the pointer is actually
 * over the section.
 *
 * ── WHO GETS IT ──────────────────────────────────────────────────────────
 * Fine pointers only, and only when motion is welcome. On touch there is no
 * hover to follow and the lit copy would never be revealed; under reduced
 * motion a circle lagging behind the cursor is exactly the kind of thing
 * being opted out of. Both fall back to the grey paragraph alone, which is
 * the section reading perfectly well without it.
 */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";
import { aboutSection } from "@/content/copy";

/** Fine pointers only — a hover effect needs something to hover with. */
const MQ_GLARE = `${MQ.motionOk} and (pointer: fine)`;

/** Share of the remaining distance the circle closes each frame. Low enough
 *  to read as lag, high enough that it never feels detached from the hand. */
const LERP = 0.12;

/** Same idea for the fade, a little quicker — the glare should be gone
 *  shortly after the pointer leaves, not trailing behind it. */
const FADE = 0.16;

/* The setting is shared, not duplicated: both copies have to wrap to exactly
   the same lines or the lit one would sit a pixel off the grey one. */
const SETTING =
  "font-manrope text-[clamp(26px,4vw,64px)]/[1.06] font-semibold " +
  "tracking-[-0.03em] indent-[clamp(56px,20%,380px)]";

/** The paragraph, twice: once grey and read, once lit and clipped. */
function Statement({
  lit = false,
  className = "",
  ...rest
}: { lit?: boolean } & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      // className is appended, never replaced — the caller adds positioning,
      // it does not get to drop the setting.
      className={`${SETTING} ${lit ? "text-ink" : "text-muted-3"} ${className}`}
      {...rest}
    >
      {aboutSection.statement}
    </p>
  );
}

export default function About() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = scope.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add(MQ_GLARE, () => {
        const stack = section.querySelector<HTMLElement>("[data-glare-stack]");
        const glare = section.querySelector<HTMLElement>("[data-glare]");
        if (!stack || !glare) return;

        // Where the pointer is, where the circle currently is, and how far
        // the layer has faded in. Everything eases toward its target.
        let targetX = 0;
        let targetY = 0;
        let x = 0;
        let y = 0;
        let targetOn = 0;
        let on = 0;
        let seen = false;

        const onMove = (e: PointerEvent) => {
          const box = stack.getBoundingClientRect();
          targetX = e.clientX - box.left;
          targetY = e.clientY - box.top;
          if (!seen) {
            // First sighting: put the circle where the pointer already is
            // rather than flying it in from the last position, which on
            // re-entry would drag a bright streak across the paragraph.
            seen = true;
            x = targetX;
            y = targetY;
          }
          targetOn = 1;
        };
        const onLeave = () => {
          targetOn = 0;
          // Forget the position too, so the next entry starts under the
          // pointer instead of resuming from where it left.
          seen = false;
        };

        const tick = () => {
          x += (targetX - x) * LERP;
          y += (targetY - y) * LERP;
          on += (targetOn - on) * FADE;
          glare.style.setProperty("--glare-x", `${x}px`);
          glare.style.setProperty("--glare-y", `${y}px`);
          glare.style.setProperty("--glare-on", `${on}`);
        };

        stack.addEventListener("pointermove", onMove);
        stack.addEventListener("pointerleave", onLeave);
        gsap.ticker.add(tick);

        return () => {
          stack.removeEventListener("pointermove", onMove);
          stack.removeEventListener("pointerleave", onLeave);
          gsap.ticker.remove(tick);
          glare.style.removeProperty("--glare-x");
          glare.style.removeProperty("--glare-y");
          glare.style.removeProperty("--glare-on");
        };
      });

      // Touch and reduced-motion get the grey paragraph on its own.

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      id="about"
      ref={scope}
      aria-label="About"
      className="relative z-(--z-section) bg-bg px-5 py-[clamp(160px,24vh,300px)] max-b700:px-4 max-b700:py-24"
    >
      {/* Edge to edge on the site's own gutters (user, 2026-09-04) — no inner
          inset and no max-width, so the measure is the page's, the same one
          the nav and every other section sit on. */}
      <div data-glare-stack="" className="relative">
        <Statement />
        {/* The lit copy: same text, same box, clipped to the circle. */}
        <Statement
          lit
          data-glare=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        />
      </div>
    </section>
  );
}
