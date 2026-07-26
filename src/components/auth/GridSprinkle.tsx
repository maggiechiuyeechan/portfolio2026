/**
 * Version H — 28px grid + sprinkled multiply dots (canvas, single layer).
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GRID_CELL = 28;
const DOT_DIAMETER = 28;
const DOT_RADIUS = DOT_DIAMETER / 2;
const EXCLUSION_PAD = GRID_CELL * 2;

const DOT_COLORS = ["#eda6d0", "#e74c3c", "#6ba97e", "#bbbbbb"] as const;

interface Dot {
  nx: number;
  ny: number;
  color: (typeof DOT_COLORS)[number];
}

interface ExclusionZone {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Props {
  obstacleRefs?: React.RefObject<HTMLElement | null>[];
}

function dotCount(width: number, height: number) {
  return Math.min(80, Math.max(32, Math.round((width * height) / 14_000)));
}

function measureExclusionZones(refs: React.RefObject<HTMLElement | null>[]): ExclusionZone[] {
  const zones: ExclusionZone[] = [];

  refs.forEach((ref) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    zones.push({
      left: rect.left - EXCLUSION_PAD,
      top: rect.top - EXCLUSION_PAD,
      right: rect.right + EXCLUSION_PAD,
      bottom: rect.bottom + EXCLUSION_PAD,
    });
  });

  return zones;
}

function dotInExclusion(x: number, y: number, zones: ExclusionZone[]) {
  return zones.some(
    (zone) => x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom,
  );
}

function cullDots(dots: Dot[], width: number, height: number, zones: ExclusionZone[]) {
  if (zones.length === 0) return dots;
  return dots.filter((dot) => !dotInExclusion(dot.nx * width, dot.ny * height, zones));
}

function createDots(count: number, width: number, height: number, zones: ExclusionZone[]): Dot[] {
  const dots: Dot[] = [];
  const maxAttempts = count * 50;
  let attempts = 0;

  while (dots.length < count && attempts < maxAttempts) {
    attempts += 1;
    const x = DOT_RADIUS + Math.random() * Math.max(DOT_DIAMETER, width - DOT_DIAMETER);
    const y = DOT_RADIUS + Math.random() * Math.max(DOT_DIAMETER, height - DOT_DIAMETER);
    if (dotInExclusion(x, y, zones)) continue;

    dots.push({
      nx: x / width,
      ny: y / height,
      color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)]!,
    });
  }

  return dots;
}

function drawDots(canvas: HTMLCanvasElement, dots: Dot[]) {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  if (width <= 0 || height <= 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "multiply";

  for (const dot of dots) {
    ctx.fillStyle = dot.color;
    ctx.beginPath();
    ctx.arc(dot.nx * width, dot.ny * height, DOT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function GridSprinkle({ obstacleRefs = [] }: Props) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const dotsPlacedRef = useRef(false);
  const viewportRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const layout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const zones = measureExclusionZones(obstacleRefs);
      const sizeChanged =
        width !== viewportRef.current.width || height !== viewportRef.current.height;

      if (!dotsPlacedRef.current) {
        if (obstacleRefs.length > 0 && zones.length === 0) {
          drawDots(canvas, []);
          return;
        }

        dotsRef.current = createDots(dotCount(width, height), width, height, zones);
        dotsPlacedRef.current = true;
        viewportRef.current = { width, height };
      } else if (sizeChanged) {
        dotsRef.current = createDots(dotCount(width, height), width, height, zones);
        viewportRef.current = { width, height };
      } else {
        dotsRef.current = cullDots(dotsRef.current, width, height, zones);
      }

      drawDots(canvas, dotsRef.current);
    };

    layout();
    const syncTimer =
      obstacleRefs.length > 0 ? window.setInterval(layout, 250) : undefined;
    const stopSync = window.setTimeout(() => {
      if (syncTimer) window.clearInterval(syncTimer);
    }, 2500);
    window.addEventListener("resize", layout);

    return () => {
      window.removeEventListener("resize", layout);
      if (syncTimer) window.clearInterval(syncTimer);
      window.clearTimeout(stopSync);
    };
  }, [mounted, obstacleRefs]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="grid-sprinkle"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 5,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        className="grid-sprinkle__grid"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--color-background-main)",
          backgroundImage: `
            linear-gradient(var(--color-border-low-contrast) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border-low-contrast) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_CELL}px ${GRID_CELL}px`,
        }}
      />
      <canvas
        ref={canvasRef}
        className="grid-sprinkle__dots"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>,
    document.body,
  );
}
