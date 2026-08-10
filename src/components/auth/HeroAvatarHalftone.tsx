/**
 * Hero avatar video with a mouse-driven ripple.
 * Starts as a normal video; ripples follow the cursor (active anywhere on screen).
 * Click empty background to drop a pond splash from that point.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { usePrefersReducedMotion } from "../../lib/motion";
import { playHeroSoundOnClick } from "../../lib/heroSounds";
import { dismissCursorLabel } from "../../scripts/cursor-label";

interface Props {
  src: string;
  alt: string;
  /** Still frame shown until the video has decodable frames. */
  poster?: string;
  variants?: Variants;
}

const frameStyle: React.CSSProperties = {
  position: "relative",
  flexShrink: 0,
  overflow: "hidden",
  // Radius lives in hero.css (--hero-avatar-radius) so mobile can use a
  // smaller rem and keep a tall capsule instead of rounding into a circle.
};

const fillStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "cover",
  objectPosition: "center",
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  // Flip Y so video texels match canvas orientation (0 = top).
  vUv = vec2(aPos.x * 0.5 + 0.5, 1.0 - (aPos.y * 0.5 + 0.5));
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uHasMouse;
uniform float uTime;
uniform vec2 uSplash;
uniform float uSplashAge;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);

  // --- Soft cursor follow ---
  float dist = distance(uv, uMouse);
  float brush = uHasMouse * (1.0 - smoothstep(0.05, 0.65, dist));
  float wave = sin(dist * 36.0 - uTime * 6.5);
  vec2 dir = dist > 0.0001 ? (uv - uMouse) / dist : vec2(0.0);
  dir.x *= aspect;
  vec2 mouseOffset = dir * wave * brush * 0.022;

  // --- Rock-drop splash: expanding ring from click ---
  float age = uSplashAge;
  float sDist = distance(uv, uSplash);
  vec2 sDir = sDist > 0.0001 ? (uv - uSplash) / sDist : vec2(0.0);
  sDir.x *= aspect;

  float front = age * 0.72;
  float thickness = 0.055 + age * 0.035;
  float ring = abs(sDist - front);
  float ring2 = abs(sDist - front * 0.62);
  float ring3 = abs(sDist - front * 0.32);
  float pulse =
    exp(-(ring * ring) / (2.0 * thickness * thickness)) +
    0.55 * exp(-(ring2 * ring2) / (2.0 * thickness * thickness)) +
    0.3 * exp(-(ring3 * ring3) / (2.0 * thickness * thickness));

  float splashWave = sin(sDist * 42.0 - age * 14.0);
  float fade = exp(-age * 1.15) * step(age, 2.4);
  // Initial impact punch near the drop point.
  float impact = exp(-sDist * sDist * 28.0) * exp(-age * 5.5) * 1.4;
  vec2 splashOffset = sDir * (pulse * splashWave + impact) * fade * 0.045;

  vec2 rippledUv = uv + mouseOffset + splashOffset;
  vec3 color = texture2D(uTex, clamp(rippledUv, 0.0, 1.0)).rgb;
  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return true;
  return Boolean(
    target.closest(
      "a, button, input, textarea, select, label, nav, [role='button'], .compare-switch",
    ),
  );
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export default function HeroAvatarHalftone({ src, alt, poster, variants }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaSrc = encodeURI(src);
  /** WebGL path starts blank — keep the poster visible until the first video frame uploads. */
  const [hasVideoFrame, setHasVideoFrame] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!video || !canvas || !frame) return;

    setHasVideoFrame(false);

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTex = gl.getUniformLocation(program, "uTex");
    const uRes = gl.getUniformLocation(program, "uRes");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uHasMouse = gl.getUniformLocation(program, "uHasMouse");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uSplash = gl.getUniformLocation(program, "uSplash");
    const uSplashAge = gl.getUniformLocation(program, "uSplashAge");
    gl.uniform1i(uTex, 0);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255]),
    );

    const IDLE_MS = 500;
    const mouse = { x: 0.5, y: 0.5 };
    const smooth = { x: 0.5, y: 0.5 };
    const splash = { x: 0.5, y: 0.5, t0: -1e9 };
    const start = performance.now();
    let lastMove = 0;
    let intensity = 0;
    let raf = 0;
    let running = true;
    let paintedFrame = false;

    const frameUvFromEvent = (event: { clientX: number; clientY: number }) => {
      const rect = frame.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      return {
        x: clamp01((event.clientX - rect.left) / rect.width),
        y: clamp01((event.clientY - rect.top) / rect.height),
      };
    };

    const syncSize = () => {
      const rect = frame.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        gl.viewport(0, 0, bw, bh);
      }
      gl.uniform2f(uRes, w, h);
    };

    const onPointerMove = (event: PointerEvent) => {
      const uv = frameUvFromEvent(event);
      if (!uv) return;
      mouse.x = uv.x;
      mouse.y = uv.y;
      lastMove = performance.now();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (isInteractiveTarget(event.target)) return;
      const uv = frameUvFromEvent(event);
      if (!uv) return;
      dismissCursorLabel();
      playHeroSoundOnClick("droplet", "halftone-splash");
      // Drop a rock at the click, clamped to the frame edge.
      splash.x = uv.x;
      splash.y = uv.y;
      splash.t0 = performance.now();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);

    const draw = () => {
      if (!running) return;
      syncSize();

      // Stick close to the cursor (light smoothing only).
      smooth.x += (mouse.x - smooth.x) * 0.55;
      smooth.y += (mouse.y - smooth.y) * 0.55;

      const now = performance.now();
      const target = lastMove > 0 && now - lastMove < IDLE_MS ? 1 : 0;
      // Fade in faster when moving; ease out gently after idle.
      intensity += (target - intensity) * (target > intensity ? 0.28 : 0.045);

      if (video.readyState >= 2) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        if (!paintedFrame) {
          paintedFrame = true;
          setHasVideoFrame(true);
        }
      }

      gl.uniform2f(uMouse, smooth.x, smooth.y);
      gl.uniform1f(uHasMouse, intensity);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uSplash, splash.x, splash.y);
      gl.uniform1f(uSplashAge, (now - splash.t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(draw);
    };

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay can fail until a user gesture; still render when frames exist.
      });
    };
    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      video.removeEventListener("loadeddata", tryPlay);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [reducedMotion, mediaSrc]);

  return (
    <motion.div
      className="hero-avatar-entrance"
      variants={variants}
      initial={variants ? "hidden" : false}
      animate={variants ? "visible" : undefined}
    >
      <div ref={frameRef} className="hero-avatar-frame" style={frameStyle}>
        {poster && !reducedMotion && !hasVideoFrame ? (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            width={400}
            height={712}
            style={{
              ...fillStyle,
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          />
        ) : null}
        <video
          ref={videoRef}
          className="hero-avatar"
          src={mediaSrc}
          poster={poster}
          aria-label={alt}
          width={400}
          height={712}
          style={{
            ...fillStyle,
            position: "absolute",
            inset: 0,
            opacity: reducedMotion ? 1 : 0,
            pointerEvents: "none",
          }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
        />
        {!reducedMotion ? (
          <canvas
            ref={canvasRef}
            className="hero-avatar-halftone"
            aria-hidden="true"
            style={{
              ...fillStyle,
              position: "relative",
              opacity: hasVideoFrame ? 1 : 0,
            }}
          />
        ) : null}
      </div>
    </motion.div>
  );
}
