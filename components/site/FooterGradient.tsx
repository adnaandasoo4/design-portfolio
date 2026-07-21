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
 * outlined "hold" pill (copy from content/copy.ts) trails the cursor —
 * DOM element, transform-only lerp inside the same rAF loop,
 * hover+fine-pointer devices only, pointer-events: none.
 *
 * Runtime rules:
 * - rAF loop runs only while the band is on screen (IntersectionObserver).
 * - prefers-reduced-motion: single static developed frame, no listeners,
 *   no loop, no pill.
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
  pill: showPill = true,
}: {
  /** Clock-speed multiplier — <1 slows the flow (hero uses 0.5). */
  speed?: number;
  /** false = no cursor "hold" pill and default cursor (hold still works). */
  pill?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

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
    // Cursor pill is a hover-only cosmetic — fine pointers, full motion only
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const pill = pillRef.current;

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
    // Pill follow state (canvas-local px; lerped in the rAF loop)
    let pillOn = false;
    let px = 0;
    let py = 0;
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

    // Pill sits to the TOP-RIGHT of the cursor (offset right + fully above)
    const placePill = () => {
      if (!pill) return;
      pill.style.transform = `translate3d(${px}px, ${py}px, 0) translate(16px, -115%)`;
    };
    const movePill = () => {
      if (!pill || !pillOn) return;
      // Heavy lag — the chip swings well behind the cursor before settling
      px += (tx - px) * 0.055;
      py += (ty - py) * 0.055;
      placePill();
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
      movePill();
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
    };
    const onUp = () => {
      holding = false;
    };
    const onLeave = () => {
      holding = false;
      pillOn = false;
      if (pill) pill.style.opacity = "0";
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!pillOn) {
        // Snap to the cursor on entry so the pill doesn't fly in from 0,0
        px = tx;
        py = ty;
        pillOn = true;
        if (pill) {
          placePill();
          pill.style.opacity = "1";
        }
      }
    };
    if (!reduced) {
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerleave", onLeave);
      window.addEventListener("pointerup", onUp);
      if (showPill && finePointer)
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
  }, [speed, showPill]);

  return (
    <>
      {/* Canvas host — the canvas itself is created fresh per mount (see
          effect) so a lost WebGL context can never be inherited */}
      <div ref={hostRef} aria-hidden="true" className="absolute inset-0" />
      {/* "hold" chip — subtly rounded hover-accent white rectangle: a
          press-and-hold icon (dot in a ring) beside the dark word, dragging
          well behind the arrow cursor (heavy lerp). Shown/moved only from
          the rAF loop above (transform + opacity); absent on non-pill
          instances. */}
      <div
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 flex items-center gap-2 rounded-tag bg-ink-1 px-6 py-2.5 text-[15px] leading-none font-medium tracking-[0.08em] text-bg opacity-0 transition-opacity duration-(--dur-hover) ease-(--ease-std) select-none"
      >
        {footer.holdLabel}
        {/* Click-and-hold pointer — cursor arrow with radiating press ticks */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 9 5 12 1.8-5.2L21 14Z" />
          <path d="M7.2 2.2 8 5.1" />
          <path d="m5.1 8-2.9-.8" />
          <path d="M14 4.1 12 6" />
          <path d="m6 12-1.9 2" />
        </svg>
      </div>
    </>
  );
}
