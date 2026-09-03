"use client";

/*
 * Showreel (user-directed, 2026-09-02) — the card the home page opens on,
 * playing the branding reel: no frame and no fill behind it, with a caption
 * beneath. The caption is set at --text-hero-meta, the same size and
 * family as the hero's eyebrow and paragraph, so the three read as one tier
 * rather than three near-misses. That is the hero's own size token, a step
 * above the site-wide --text-meta.
 *
 * TRAVEL. The card sweeps the full width of the hero's content box —
 * margin to margin, never past the page gutters. The amplitude is measured,
 * not guessed: half the slack left over once the card's own width is taken
 * out of the track, minus the extra footprint the card gains as it tilts
 * (a rotated rectangle is wider than an upright one). Re-measured on resize
 * and whenever the track changes, since both the card width and the gutters
 * are viewport-relative.
 *
 * ANGLE. Not authored — it falls out of the lag. Each frame the card eases
 * toward the pointer's target x; the distance it is still behind converts
 * straight into degrees. Sweep fast and the gap is wide, so the card banks
 * hard into the direction of travel. Stop moving and the gap closes to
 * zero, which takes the angle with it — the card settles perfectly flat,
 * because lag is the ONLY thing feeding rotation. (An earlier version also
 * added a tilt from pointer POSITION, which left the card holding a
 * permanent lean wherever the cursor happened to rest.) Speed reads as
 * angle for free, with no velocity sampling and no timers to keep in sync.
 *
 * Only `transform` is touched (§A7), from a single gsap.ticker callback
 * rather than a tween per event. Coarse pointers and reduced-motion
 * visitors get the card square and still — the effect is decoration over a
 * layout that is already correct without it.
 */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";
import { hero } from "@/content/copy";

/** Degrees of bank per pixel the card is still behind the pointer. This is
 *  the only input to rotation, so rotation returns to 0 whenever the card
 *  catches up — i.e. whenever the pointer stops. */
const LAG_TO_DEG = 0.085;
const MAX_DEG = 18;
/** Per-frame easing. Higher = the card snaps to the pointer harder. */
const EASE_FRAME = 0.14;
const EASE_ANGLE = 0.16;

export default function Showreel() {
  const scope = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      const track = scope.current;
      const frameEl = frame.current;
      if (!track || !frameEl) return;

      const mm = gsap.matchMedia();

      // Fine pointers only — on touch there is no hover to track, and a card
      // that only moves mid-drag reads as a bug.
      mm.add(`${MQ.motionOk} and (pointer: fine)`, () => {
        const clampDeg = gsap.utils.clamp(-MAX_DEG, MAX_DEG);

        let amp = 0;
        let nx = 0; // pointer position, −1 (left edge) … 1 (right edge)
        let targetX = 0;
        let frameX = 0;
        let frameRot = 0;

        /** Slack between the card's tilted footprint and the content box. */
        const measure = () => {
          const w = frameEl.offsetWidth;
          const h = frameEl.offsetHeight;
          const rad = (MAX_DEG * Math.PI) / 180;
          const tilted = w * Math.cos(rad) + h * Math.sin(rad);
          amp = Math.max(0, (track.clientWidth - tilted) / 2);
          targetX = nx * amp;
        };
        measure();

        const onMove = (e: PointerEvent) => {
          const half = window.innerWidth / 2;
          nx = gsap.utils.clamp(-1, 1, (e.clientX - half) / half);
          targetX = nx * amp;
        };

        const tick = () => {
          frameX += (targetX - frameX) * EASE_FRAME;
          // Everything the card has not caught up on yet, in pixels.
          const lag = targetX - frameX;
          const wantRot = clampDeg(lag * LAG_TO_DEG);
          frameRot += (wantRot - frameRot) * EASE_ANGLE;
          gsap.set(frameEl, { x: frameX, rotation: frameRot });
        };

        const ro = new ResizeObserver(measure);
        ro.observe(track);
        window.addEventListener("pointermove", onMove, { passive: true });
        gsap.ticker.add(tick);

        return () => {
          ro.disconnect();
          window.removeEventListener("pointermove", onMove);
          gsap.ticker.remove(tick);
          gsap.set(frameEl, { x: 0, rotation: 0 });
        };
      });

      // Reduced motion: the reel is decorative and loops, so hold it on its
      // first frame rather than autoplaying (§A7).
      mm.add(MQ.reduced, () => {
        video.current?.pause();
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    /* Full-width track: this element IS the hero's content box, so its
       width is what the amplitude above is measured against. */
    <div ref={scope} className="flex w-full justify-center">
      {/* The card and its caption bank as one piece */}
      <figure ref={frame} className="m-0 will-change-transform">
        <div className="aspect-16/9 w-[clamp(260px,26vw,470px)] overflow-hidden rounded-[3px]">
          <video
            className="size-full object-cover"
            ref={video}
            src={hero.reel.src}
            aria-label={hero.reel.alt}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>

        {/* Caption — hugs the card's own left and right edges */}
        {/* Label carries the ink; the action sits back in the same grey as
            the hero's eyebrow and paragraph, so the secondary tier is
            consistent across the whole section. */}
        <figcaption className="mt-[clamp(12px,1.4vw,20px)] flex items-center justify-between gap-6 font-manrope text-hero-meta leading-none text-ink">
          <span>{hero.reel.label}</span>
          <span className="text-muted-2">{hero.reel.note}</span>
        </figcaption>
      </figure>
    </div>
  );
}
