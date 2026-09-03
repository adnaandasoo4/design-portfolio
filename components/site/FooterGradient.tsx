"use client";

/*
 * Footer WebGL gradient band (user-directed footer redesign, 2026-07-19;
 * rebuilt 2026-07-20 as a faithful port of the backhouse.com hero shader —
 * extracted from their production bundle at the user's direction; the user
 * supplied the site as the exact flow/colors they want).
 *
 * How the look works (their algorithm, verbatim):
 * - centered uv is domain-warped by FOUR stacked sin() octaves (the huge
 *   1.6 * sin(0.4 * uv.yx) term makes the big flowing tongues).
 * - color = chained mix() through uColors[4], each weighted by
 *   cos(i * length(warpedUv)). cos goes NEGATIVE, and GLSL mix()
 *   extrapolates — the ember reds/oranges are never in the palette, they
 *   emerge from extrapolation past cream/ice-blue/slate. Palette is their
 *   hero default: #000000 / #eff2c0 / #9feaf9 / #769ba2.
 * - reveal ramps 0→1 (2s, 0.3s delay) scaling both warp and brightness.
 *
 * Interaction (their params): holding the pointer lerps amplitude ×2 and
 * clock speed ×1.5 with lerp factor 0.03/frame — flow accelerates and
 * distorts while held, relaxes on release. While hovering, a small
 * CURSOR (redesigned 2026-09-02, user request — look, colour, icon and
 * lerp all replaced). The old light-grey "hold" pill with a
 * press-and-hold glyph, trailing on a single heavy 0.055 lerp, is gone.
 * In its place, two brand-vermilion marks on TWO different speeds: a
 * hairline ring that lags (0.12) and a small filled dot that tracks almost
 * exactly (0.34). The split is the whole idea — one mark reads as the
 * cursor, the other as weight behind it, and the gap between them widens
 * with speed and closes at rest, so the pair breathes instead of merely
 * sliding. Pressing collapses it: the ring contracts and floods solid, the
 * dot is swallowed, and the word "hold" surfaces in white inside the disc
 * — the label now confirms the state rather than instructing from the
 * sidelines.
 *
 * Each mark is a POSITIONER whose transform the rAF loop owns, wrapping a
 * VISUAL that owns its own CSS-transitioned transform. Splitting them is
 * what lets the press animate at all: one element cannot be driven per
 * frame by script and transitioned by CSS on the same property.
 * DOM elements, transform/opacity only, lerped inside the same rAF loop,
 * hover+fine-pointer devices only, pointer-events: none.
 *
 * Runtime rules:
 * - rAF loop runs only while the band is on screen (IntersectionObserver).
 * - prefers-reduced-motion: single static developed frame, no listeners,
 *   no loop, no cursor.
 * - DPR capped at 1.75.
 * - No WebGL → canvas stays transparent over the dark footer (acceptable).
 * - Colors live in the shader — they have no CSS token equivalents.
 */

import { useEffect, useRef } from "react";
import { footer } from "@/content/copy";

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/* Backhouse fragment shader, ported from THREE.ShaderMaterial to raw GL
 * (vUv → gl_FragCoord / uRes). Only addition: a hair of hash dither so the
 * huge soft ramps don't band on 8-bit displays (their site layers a grain
 * overlay on top instead; the user told us to ignore that overlay). */
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uAmplitude;
uniform float uReveal;
uniform vec3 uColors[4];

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 centeredUv = 2.0 * uv - 1.0;
  float distortionStrength = uAmplitude * uReveal;

  centeredUv += distortionStrength * 0.4 * sin(1.0 * centeredUv.yx + vec2(1.2, 3.4) + uTime);
  centeredUv += distortionStrength * 0.2 * sin(5.2 * centeredUv.yx + vec2(3.5, 0.4) + uTime);
  centeredUv += distortionStrength * 0.3 * sin(3.5 * centeredUv.yx + vec2(1.2, 3.1) + uTime);
  centeredUv += distortionStrength * 1.6 * sin(0.4 * centeredUv.yx + vec2(0.8, 2.4) + uTime);

  vec3 color = uColors[0];
  for (int i = 0; i < 4; i++) {
    float r = cos(float(i) * length(centeredUv));
    color = mix(color, uColors[i], r);
  }

  // Reveal fades up from the SITE off-black (#111214), not pure black, so
  // the band's darks sit on the same surface as the page.
  color = mix(vec3(0.0667, 0.0706, 0.0784), color, uReveal);
  color = max(color, vec3(0.0667, 0.0706, 0.0784));
  color += (hash(gl_FragCoord.xy) - 0.5) * 0.012;
  gl_FragColor = vec4(color, 1.0);
}
`;

/* Their hero defaults (data-shader element with no color overrides) */
const AMPLITUDE = 0.65;
const TIME_SPEED = 0.008; // uTime increment per 60fps frame
const HOLD_AMP_MULT = 2;
const HOLD_SPEED_MULT = 1.5;
const LERP_SPEED = 0.03; // per-frame lerp toward hold/rest targets
/* Cursor follow — deliberately two speeds (see CURSOR above) */
const RING_LERP = 0.12; // the lagging outline
const DOT_LERP = 0.34; // the near-instant dot
/* Palette presets — color1 is always the site off-black (#111214). The
 * ember/flame hues still emerge from mix() extrapolation, so each preset
 * only names three real colors. Two options per user direction 2026-07-20:
 * the original backhouse set and a black-to-gray monochrome. DEV ONLY:
 * while the page has focus, keys 1–2 swap palettes live for art direction;
 * index 0 is what ships. */
const rgb = (h: number) => [
  ((h >> 16) & 255) / 255,
  ((h >> 8) & 255) / 255,
  (h & 255) / 255,
];
const palette = (a: number, b: number, c: number) =>
  new Float32Array([...rgb(0x111214), ...rgb(a), ...rgb(b), ...rgb(c)]);
const PALETTES = [
  { name: "backhouse", colors: palette(0xeff2c0, 0x9feaf9, 0x769ba2) },
  /* Mono is built by hand: every stop INCLUDING the base is strictly
   * neutral (R=G=B). The shared off-black base (#111214) leans blue, and
   * mix() extrapolation past it was subtracting blue from the greys —
   * which read as green. Equal channels can never tint. */
  {
    name: "mono",
    colors: new Float32Array([
      ...rgb(0x121212),
      ...rgb(0xf1f1f1),
      ...rgb(0xa6a6a6),
      ...rgb(0x2b2b2b),
    ]),
  },
];
/* uTime for the one-shot reduced-motion frame — a developed field */
const STATIC_TIME = 40;

export default function FooterGradient({
  speed = 1,
  cursor: showCursor = true,
}: {
  /** Clock-speed multiplier — <1 slows the flow. Only the footer band
   *  mounts this now (the hero's dimmed copy was dropped 2026-09-02), so
   *  both props sit at their defaults in practice. */
  speed?: number;
  /** false = no ring/dot cursor and the default arrow (hold still works). */
  cursor?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // FRESH canvas per effect run. A canvas whose context was released via
    // WEBGL_lose_context (our cleanup) hands back the same dead context on
    // every later getContext() call — so any reuse of the node (Fast
    // Refresh re-running the effect, remount edge cases during route
    // travel) rendered a permanently blank band. A new element can't
    // inherit a lost context.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "absolute inset-0 h-full w-full";
    host.appendChild(canvas);
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      canvas.remove();
      return;
    }

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Fullscreen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uAmplitude = gl.getUniformLocation(program, "uAmplitude");
    const uReveal = gl.getUniformLocation(program, "uReveal");
    const uColors =
      gl.getUniformLocation(program, "uColors") ??
      gl.getUniformLocation(program, "uColors[0]");
    gl.uniform3fv(uColors, PALETTES[0].colors);

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // The cursor is a hover-only cosmetic — fine pointers, full motion only
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const ringVisual = ring?.firstElementChild as HTMLElement | null;
    const dotVisual = dot?.firstElementChild as HTMLElement | null;
    const ringFill =
      ring?.querySelector<HTMLElement>("[data-cursor-fill]") ?? null;
    const ringLabel =
      ring?.querySelector<HTMLElement>("[data-cursor-label]") ?? null;

    // Sim state — time/amplitude/speed accumulate in JS so the hold lerp
    // matches the reference exactly (per-frame factor, frame-rate corrected).
    // NO fade-in (user direction): the sim clock starts at a developed
    // field time and reveal is pinned at 1, so the very first frame the
    // curtain exposes is the full gradient.
    const baseSpeed = TIME_SPEED * speed;
    let simTime = STATIC_TIME;
    let curAmp = AMPLITUDE;
    let curSpeed = baseSpeed;
    let holding = false;
    const reveal = 1;
    let lastFrame = performance.now();
    let raf = 0;
    let running = false;
    // Cursor follow state (canvas-local px; lerped in the rAF loop).
    // rx/ry is the lagging ring, dx/dy the near-instant dot.
    let cursorOn = false;
    let rx = 0;
    let ry = 0;
    let dx = 0;
    let dy = 0;
    let tx = 0;
    let ty = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = () => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, simTime);
      gl.uniform1f(uAmplitude, curAmp);
      gl.uniform1f(uReveal, reveal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    /* Both marks are CENTRED on their point — the −50% offsets live on the
       visuals as the `translate` property, leaving `transform` free here. */
    const placeCursor = () => {
      if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (dot) dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    };

    /** Frame-rate-corrected, so the gap between ring and dot is the same at
     *  any refresh rate rather than twice as tight at 120Hz. */
    const moveCursor = (frames: number) => {
      if (!cursorOn) return;
      const kr = 1 - Math.pow(1 - RING_LERP, frames);
      const kd = 1 - Math.pow(1 - DOT_LERP, frames);
      rx += (tx - rx) * kr;
      ry += (ty - ry) * kr;
      dx += (tx - dx) * kd;
      dy += (ty - dy) * kd;
      placeCursor();
    };

    /** The press: ring contracts and floods, dot is swallowed, label shows.
     *  Written as inline styles because the CLASSES declare the transitions
     *  — script sets the target, CSS does the interpolation. */
    const setHold = (on: boolean) => {
      if (ringVisual)
        ringVisual.style.transform = on ? "scale(0.8)" : "scale(1)";
      if (dotVisual) dotVisual.style.transform = on ? "scale(0)" : "scale(1)";
      if (ringFill) ringFill.style.opacity = on ? "1" : "0";
      if (ringLabel) ringLabel.style.opacity = on ? "1" : "0";
    };

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastFrame) / 1000, 0.1);
      lastFrame = now;
      const frames = dt * 60;

      // Hold lerp — reference: current += (target - current) * 0.03 / frame
      const k = 1 - Math.pow(1 - LERP_SPEED, frames);
      const targetAmp = holding ? AMPLITUDE * HOLD_AMP_MULT : AMPLITUDE;
      const targetSpeed = holding ? baseSpeed * HOLD_SPEED_MULT : baseSpeed;
      curAmp += (targetAmp - curAmp) * k;
      curSpeed += (targetSpeed - curSpeed) * k;
      simTime += curSpeed * frames;

      draw();
      moveCursor(frames);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || reduced) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // First frame immediately (both branches) — the canvas must already
    // hold the developed field when the footer curtain reveals it.
    draw();

    // The canvas may be fixed to the viewport (curtain reveal) — gate the
    // loop on the in-flow clip slot when present, not the always-on-screen
    // canvas itself.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play();
      else pause();
    });
    io.observe(canvas.closest("[data-band-clip]") ?? canvas);

    const ro = new ResizeObserver(() => {
      if (!running) draw();
    });
    ro.observe(canvas);

    const onDown = () => {
      holding = true;
      setHold(true);
    };
    const onUp = () => {
      holding = false;
      setHold(false);
    };
    const onLeave = () => {
      holding = false;
      setHold(false);
      cursorOn = false;
      if (ring) ring.style.opacity = "0";
      if (dot) dot.style.opacity = "0";
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!cursorOn) {
        // Snap BOTH marks onto the pointer on entry, or they would fly in
        // from 0,0 and the ring would arrive a beat late every time.
        rx = dx = tx;
        ry = dy = ty;
        cursorOn = true;
        placeCursor();
        if (ring) ring.style.opacity = "1";
        if (dot) dot.style.opacity = "1";
      }
    };
    if (!reduced) {
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerleave", onLeave);
      window.addEventListener("pointerup", onUp);
      if (showCursor && finePointer)
        canvas.addEventListener("pointermove", onMove);
    }

    // DEV-ONLY palette switcher (keys 1–5) — stripped from prod bundles.
    const onKey =
      process.env.NODE_ENV !== "production"
        ? (e: KeyboardEvent) => {
            const i = Number(e.key) - 1;
            if (i >= 0 && i < PALETTES.length) {
              gl.uniform3fv(uColors, PALETTES[i].colors);
              if (!running) draw();
            }
          }
        : null;
    if (onKey) window.addEventListener("keydown", onKey);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      if (onKey) window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [speed, showCursor]);

  return (
    <>
      {/* Canvas host — the canvas itself is created fresh per mount (see
          effect) so a lost WebGL context can never be inherited */}
      <div ref={hostRef} aria-hidden="true" className="absolute inset-0" />
      {/* CURSOR — two brand marks on two speeds (see CURSOR at the top).
          Each is a POSITIONER, whose transform the rAF loop writes, wrapping
          a VISUAL that owns its own CSS-transitioned transform for the
          press. The −50% centring is the `translate` property, so it never
          collides with either transform. */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 opacity-0 transition-opacity duration-(--dur-hover) ease-(--ease-std)"
      >
        <div className="relative size-[54px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand [transform:scale(1)] transition-[transform] duration-(--dur-copy) ease-(--ease-out-quart)">
          {/* Flood — fades in under the label on press */}
          <span
            data-cursor-fill=""
            className="absolute inset-0 rounded-full bg-brand opacity-0 transition-opacity duration-(--dur-copy) ease-(--ease-std)"
          />
          {/* Label — white on the vermilion flood, so it only ever reads
              against a colour it is guaranteed to clear */}
          <span
            data-cursor-label=""
            className="absolute inset-0 grid place-items-center text-[10px] leading-none font-medium tracking-[0.16em] text-brand-ink uppercase opacity-0 transition-opacity duration-(--dur-copy) ease-(--ease-std)"
          >
            {footer.holdLabel}
          </span>
        </div>
      </div>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 opacity-0 transition-opacity duration-(--dur-hover) ease-(--ease-std)"
      >
        <div className="size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand [transform:scale(1)] transition-[transform] duration-(--dur-copy) ease-(--ease-out-quart)" />
      </div>
    </>
  );
}
