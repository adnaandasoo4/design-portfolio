"use client";

/*
 * Showreel (user-directed, 2026-09-02) — the centred card the home page
 * opens on, standing in for the projects reel until the video lands.
 *
 * MOTION (reference: the reel on ethansuero.com). The card tracks the
 * pointer along the HORIZONTAL axis only, and the angle is not authored —
 * it falls out of the lag. Each frame the card eases toward the pointer's
 * target x; the distance it is still behind (`lag`) is converted straight
 * into degrees. Sweep the mouse fast and the gap is wide, so the card
 * banks hard into the direction of travel; let it settle and the gap
 * closes, so the angle relaxes to a small tilt held by pointer position
 * alone. Speed reads as angle for free, with no velocity sampling and no
 * timers to keep in sync.
 *
 * The inner panel chases the FRAME's own solved transform at a slower ease,
 * then renders as the difference between the two. Because it is a child,
 * that difference is what is left over once the frame's transform has
 * composed — so it trails visibly through a turn and, since both values
 * converge on the same target, settles perfectly square inside the frame
 * the moment the pointer stops. Anything less than full convergence would
 * leave the panel permanently askew.
 *
 * Only `transform` is touched (§A7), from a single gsap.ticker callback
 * rather than a tween per event. Coarse pointers and reduced-motion
 * visitors get the card square and still — the whole effect is decoration
 * over a layout that is already correct without it.
 */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap/register";
import { MQ } from "@/lib/gsap/motion";
import { hero } from "@/content/copy";

/** Pointer sweep → horizontal travel, as a share of viewport width (capped). */
const AMP_X_RATIO = 0.06;
const AMP_X_MAX = 110;
/** Steady tilt held by pointer POSITION once the card has caught up. */
const TILT_POS_DEG = 4;
/** Degrees of bank per pixel the card is still behind the pointer. */
const LAG_TO_DEG = 0.26;
const MAX_DEG = 15;
/** Per-frame easing — the frame chases the pointer, the panel chases the frame. */
const EASE_FRAME = 0.075;
const EASE_ANGLE = 0.085;
const EASE_PANEL = 0.045;

function PlayGlyph({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.4" />
      <path d="M10.2 8.6 15.6 12l-5.4 3.4Z" />
    </svg>
  );
}

export default function Showreel() {
  const scope = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const frameEl = frame.current;
      const panelEl = panel.current;
      if (!frameEl || !panelEl) return;

      const mm = gsap.matchMedia();

      // Fine pointers only — on touch there is no hover to track, and a
      // card that only moves mid-drag reads as a bug.
      mm.add(`${MQ.motionOk} and (pointer: fine)`, () => {
        const clamp = gsap.utils.clamp(-MAX_DEG, MAX_DEG);
        let amp = Math.min(AMP_X_MAX, window.innerWidth * AMP_X_RATIO);

        let nx = 0; // pointer position, −1 (left edge) … 1 (right edge)
        let targetX = 0;
        let frameX = 0;
        let frameRot = 0;
        let panelX = 0;
        let panelRot = 0;

        const onMove = (e: PointerEvent) => {
          const half = window.innerWidth / 2;
          nx = gsap.utils.clamp(-1, 1, (e.clientX - half) / half);
          targetX = nx * amp;
        };
        const onResize = () => {
          amp = Math.min(AMP_X_MAX, window.innerWidth * AMP_X_RATIO);
          targetX = nx * amp;
        };

        const tick = () => {
          frameX += (targetX - frameX) * EASE_FRAME;
          // Everything the card has not caught up on yet, in pixels.
          const lag = targetX - frameX;
          const wantRot = clamp(nx * TILT_POS_DEG + lag * LAG_TO_DEG);
          frameRot += (wantRot - frameRot) * EASE_ANGLE;

          // Both chase the frame's OWN values, so the leftover difference
          // below decays to zero and the panel sits square at rest.
          panelX += (frameX - panelX) * EASE_PANEL;
          panelRot += (frameRot - panelRot) * EASE_PANEL;

          gsap.set(frameEl, { x: frameX, rotation: frameRot });
          // Child of the frame: render only what the frame's transform has
          // NOT already applied, so the panel trails instead of doubling up.
          gsap.set(panelEl, {
            x: panelX - frameX,
            rotation: panelRot - frameRot,
          });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("resize", onResize);
        gsap.ticker.add(tick);

        return () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("resize", onResize);
          gsap.ticker.remove(tick);
          gsap.set([frameEl, panelEl], { x: 0, rotation: 0 });
        };
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope}>
      {/* The whole group banks together — card AND captions, as in the
          reference, so the captions read as printed on the card. */}
      <figure ref={frame} className="m-0 will-change-transform">
        <div className="relative aspect-16/9 w-[clamp(260px,26vw,470px)] overflow-hidden rounded-[3px] bg-brand">
          {/* Placeholder for the reel video — an inset panel that trails the
              frame through a turn. Swap for the <video> when it exists. */}
          <div
            ref={panel}
            className="absolute inset-[clamp(9px,1vw,15px)] grid place-items-center rounded-[2px] bg-slot-2 will-change-transform"
          >
            <PlayGlyph className="size-[clamp(30px,3.4vw,46px)] text-muted-2" />
            <span className="sr-only">{hero.reel.alt}</span>
          </div>
        </div>

        {/* Captions sit on the card's own left and right edges */}
        <figcaption className="mt-[clamp(12px,1.4vw,20px)] flex items-center justify-between text-[clamp(13px,1vw,15px)] leading-none font-medium text-ink">
          <span className="inline-flex items-center gap-2">
            {hero.reel.label}
            <PlayGlyph className="size-[15px] text-ink" />
          </span>
          <span>{hero.reel.action}</span>
        </figcaption>
      </figure>
    </div>
  );
}
