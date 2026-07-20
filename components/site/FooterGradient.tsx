"use client";

/*
 * Footer WebGL gradient band (user-directed footer redesign, 2026-07-19).
 * Smooth black→white field: big soft blobs that slowly morph (low-frequency
 * domain-warped noise — palette iteration starts monochrome per user).
 *
 * Interaction: cursor position does nothing; HOLDING the pointer down ramps
 * uHold, which deepens the warp and speeds the sim clock (JS-side), both
 * relaxing on release.
 *
 * Runtime rules:
 * - rAF loop runs only while the band is on screen (IntersectionObserver).
 * - prefers-reduced-motion: single static frame, no listeners, no loop.
 * - DPR capped at 1.75; light theme counter-inverted via data-counter-invert.
 * - No WebGL → canvas stays transparent over the dark footer (acceptable).
 */

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime; // sim clock (JS-side, hold-accelerated)
uniform float uHold; // 0..1 pointer-held ramp

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y);
}
// 3 low-frequency octaves — smooth blobs, no fine detail
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = mat2(0.8, -0.6, 0.6, 0.8) * p * 1.9;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.05;

  // Domain warp — deepens while held
  float amp = 0.55 + uHold * 1.3;
  vec2 q = vec2(fbm(p * 0.9 + t * 0.7),
                fbm(p * 0.9 - t * 0.6 + vec2(3.7, 1.9)));
  vec2 r = p + (q - 0.5) * amp;

  // Big soft black→white blobs
  float f = fbm(r * 0.9 + t * 0.25);
  float g = smoothstep(0.2, 0.85, f);
  vec3 col = vec3(g);

  // Grain — keeps the slow ramps from banding
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.008;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function FooterGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

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
    const uHold = gl.getUniformLocation(program, "uHold");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Sim clock accumulates in JS so holding can speed the morph smoothly.
    let simTime = 0;
    let lastFrame = performance.now();
    let hold = 0;
    let holdTarget = 0;
    let raf = 0;
    let running = false;

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

    const draw = (timeSec: number) => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, timeSec);
      gl.uniform1f(uHold, hold);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastFrame) / 1000, 0.1);
      lastFrame = now;
      hold += (holdTarget - hold) * (holdTarget > hold ? 0.045 : 0.06);
      // Holding speeds the morph up to ~3.5×
      simTime += dt * (1 + hold * 2.5);
      draw(simTime);
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

    // Static frame for reduced motion (t picked for a developed field)
    if (reduced) draw(40);

    // The canvas may be fixed to the viewport (curtain reveal) — gate the
    // loop on the in-flow clip slot when present, not the always-on-screen
    // canvas itself.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play();
      else pause();
    });
    io.observe(canvas.closest("[data-band-clip]") ?? canvas);

    const ro = new ResizeObserver(() => {
      if (!running) draw(reduced ? 40 : simTime);
    });
    ro.observe(canvas);

    const onDown = () => {
      holdTarget = 1;
    };
    const onUp = () => {
      holdTarget = 0;
    };
    if (!reduced) {
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerleave", onUp);
      window.addEventListener("pointerup", onUp);
    }

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onUp);
      window.removeEventListener("pointerup", onUp);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-counter-invert=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
