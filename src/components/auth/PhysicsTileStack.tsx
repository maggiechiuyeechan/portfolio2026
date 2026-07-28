/**
 * Physics pile — colored tiles (Version B) or Figma shapes (Version C).
 * Cursor contact pops a piece upward (B + C).
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import Matter from "matter-js";
import { usePrefersReducedMotion } from "../../lib/motion";
import { playHeroSound } from "../../lib/heroSounds";
import { unlockCuelume } from "../../lib/cuelume";
import PhysicsTileFace from "./PhysicsTileFace";
import PhysicsShapeFace from "./PhysicsShapeFace";
import { STATIC_TILE_POSES, TILES, TILES_SPAWN, TILES_SPAWN_MOBILE, type TileDef } from "./physicsTiles";
import { shapeBodyDimensions, type ShapeDef, type StaticShapePose } from "./physicsShapes";
import { SHAPES_C, SHAPES_C_SPAWN, STATIC_SHAPE_POSES_C } from "./physicsShapesC";

interface Props {
  variants?: Record<string, unknown>;
  fullCanvas?: boolean;
  obstacleRefs?: React.RefObject<HTMLElement | null>[];
  variant?: "tiles" | "shapes-c";
}

const COMPACT_TILE_SIZE = 48;
const FULL_CANVAS_TILE_SIZE = 240;
const TILE_VARIANT_SCALE = 0.5;
/** Version C shapes sit a touch smaller than the shared full-canvas size. */
const SHAPES_C_SIZE_SCALE = 0.9;
/** Floor for full-canvas shapes — low enough that phones can shrink further. */
const MIN_FULL_CANVAS_SHAPE_SIZE = 64;
/** Fraction of viewport width used as the shape's long edge (desktop). */
const FULL_CANVAS_SHAPE_WIDTH_RATIO = 0.18;
/** On mobile, Version B / C size from viewport height instead. */
const FULL_CANVAS_MOBILE_HEIGHT_RATIO = 0.18;
/** Single-column / mobile breakpoint (matches --single-column-break). */
const MOBILE_MAX_WIDTH_PX = 660;
const SPAWN_DELAY_MS = 90;
const OBSTACLE_PAD = 12;
/** Below this speed/angular velocity, bodies are forced to sleep */
const REST_SPEED = 0.12;
const REST_ANGULAR = 0.025;
/** Upward kick when the cursor touches a tile/shape. */
const POP_UP_SPEED = 18;
const POP_LATERAL = 2.5;
const POP_SPIN = 0.1;
const POP_COOLDOWN_MS = 480;

interface SpawnedBody {
  bodyId: number;
  bodyWidth: number;
  bodyHeight: number;
  tile?: TileDef;
  shape?: ShapeDef;
}

function isInteractiveTarget(target: Element | null) {
  if (!target) return true;
  return Boolean(
    target.closest(
      "a, button, input, textarea, select, label, nav, [role='button'], .compare-switch",
    ),
  );
}

function getShapeConfig() {
  return {
    shapes: SHAPES_C,
    spawn: SHAPES_C_SPAWN,
    staticPoses: STATIC_SHAPE_POSES_C,
  };
}

function baseSize(
  fullCanvas: boolean,
  width: number,
  height: number,
  variant: Props["variant"],
) {
  if (!fullCanvas) return Math.round(COMPACT_TILE_SIZE * TILE_VARIANT_SCALE);
  // Version B + C on mobile: size from vh; otherwise from vw.
  const useVh =
    (variant === "tiles" || variant === "shapes-c") && width <= MOBILE_MAX_WIDTH_PX;
  const reference = useVh ? height : width;
  const ratio = useVh ? FULL_CANVAS_MOBILE_HEIGHT_RATIO : FULL_CANVAS_SHAPE_WIDTH_RATIO;
  const shapeSize = Math.max(
    MIN_FULL_CANVAS_SHAPE_SIZE,
    Math.min(FULL_CANVAS_TILE_SIZE, Math.round(reference * ratio)),
  );
  if (variant === "tiles") {
    return Math.round(shapeSize * TILE_VARIANT_SCALE);
  }
  if (variant === "shapes-c") {
    return Math.round(shapeSize * SHAPES_C_SIZE_SCALE);
  }
  return shapeSize;
}

function canvasDimensions(fullCanvas: boolean, container: HTMLElement) {
  if (fullCanvas) {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return { width: container.clientWidth, height: container.clientHeight };
}

function measureObstacles(refs: React.RefObject<HTMLElement | null>[]) {
  const obstacles: Array<{ x: number; y: number; width: number; height: number }> = [];

  refs.forEach((ref) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    obstacles.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width + OBSTACLE_PAD * 2,
      height: rect.height + OBSTACLE_PAD * 2,
    });
  });

  return obstacles;
}

export default function PhysicsTileStack({
  variants,
  fullCanvas = false,
  obstacleRefs = [],
  variant = "tiles",
}: Props) {
  const isShapes = variant === "shapes-c";
  const shapeConfig = getShapeConfig();
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const tileElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const baseSizeRef = useRef(COMPACT_TILE_SIZE);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const tileBodiesRef = useRef<Matter.Body[]>([]);
  const spawnedBodiesRef = useRef<Map<number, SpawnedBody>>(new Map());
  const obstacleBodiesRef = useRef<Matter.Body[]>([]);
  const spawnTimersRef = useRef<number[]>([]);
  const [spawnedBodies, setSpawnedBodies] = useState<SpawnedBody[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 288, height: 180 });
  const [activeBaseSize, setActiveBaseSize] = useState(COMPACT_TILE_SIZE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !mounted) return;

    const measure = () => {
      const { width, height } = canvasDimensions(fullCanvas, container);
      const size = baseSize(fullCanvas, width, height, variant);
      baseSizeRef.current = size;
      setContainerSize({ width, height });
      setActiveBaseSize(size);
      return { width, height, size };
    };

    const { width, height, size } = measure();
    if (width <= 0 || height <= 0) return;

    tileElementsRef.current.clear();
    tileBodiesRef.current = [];
    spawnedBodiesRef.current.clear();
    obstacleBodiesRef.current = [];
    setSpawnedBodies([]);

    if (reducedMotion) return;

    const spawnSet = fullCanvas
      ? isShapes
        ? shapeConfig.spawn
        : width <= MOBILE_MAX_WIDTH_PX
          ? TILES_SPAWN_MOBILE
          : TILES_SPAWN
      : isShapes
        ? shapeConfig.shapes
        : TILES;
    const spawnStartDelay = fullCanvas ? 500 : 0;

    const { Engine, Runner, Bodies, Composite, Body, Events, Sleeping, Query } = Matter;
    const engine = Engine.create({
      enableSleeping: true,
      positionIterations: 8,
      velocityIterations: 6,
    });
    engine.gravity.y = 2;
    engineRef.current = engine;

    const wallThickness = 120;
    const ground = Bodies.rectangle(width / 2, height + wallThickness / 2, width + wallThickness * 2, wallThickness, {
      isStatic: true,
      friction: 0.95,
    });
    const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 3, { isStatic: true });
    const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 3, { isStatic: true });

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    let lastObstacleKey = "";

    const syncObstacles = () => {
      if (!fullCanvas || obstacleRefs.length === 0) return;

      const obstacles = measureObstacles(obstacleRefs);
      const key = obstacles
        .map((o) => `${Math.round(o.x)}:${Math.round(o.y)}:${Math.round(o.width)}:${Math.round(o.height)}`)
        .join("|");

      if (key === lastObstacleKey) return;
      lastObstacleKey = key;

      Composite.remove(engine.world, obstacleBodiesRef.current);
      obstacleBodiesRef.current = [];

      const bodies = obstacles.map((obstacle) =>
        Bodies.rectangle(obstacle.x, obstacle.y, obstacle.width, obstacle.height, {
          isStatic: true,
          friction: 0.9,
          restitution: 0.05,
          label: "obstacle",
        }),
      );

      obstacleBodiesRef.current = bodies;
      if (bodies.length > 0) Composite.add(engine.world, bodies);
    };

    const spawnItem = (item: TileDef | ShapeDef, index: number) => {
      const bodyDims = isShapes
        ? shapeBodyDimensions(size, item as ShapeDef)
        : { width: size, height: size };
      const { width: bodyWidth, height: bodyHeight } = bodyDims;
      const spawnWidth = Math.max(bodyWidth, bodyHeight);

      const x = spawnWidth * 0.6 + Math.random() * Math.max(spawnWidth, width - spawnWidth * 1.2);
      const y = -spawnWidth * 2 - Math.random() * 120 - index * (spawnWidth * 0.12);

      const chamfer = Math.min(bodyWidth, bodyHeight) * (isShapes ? 0.08 : 0.17);

      const body = Bodies.rectangle(x, y, bodyWidth, bodyHeight, {
        chamfer: { radius: chamfer },
        restitution: 0.15,
        friction: 0.85,
        frictionAir: 0.012,
        density: 0.0016,
        sleepThreshold: 25,
        label: item.id,
      });

      Body.setAngle(body, (Math.random() - 0.5) * 1.1);
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.14);

      Composite.add(engine.world, body);
      tileBodiesRef.current.push(body);

      const spawned: SpawnedBody = {
        bodyId: body.id,
        bodyWidth,
        bodyHeight,
        ...(isShapes ? { shape: item as ShapeDef } : { tile: item as TileDef }),
      };
      spawnedBodiesRef.current.set(body.id, spawned);
      setSpawnedBodies((current) => [...current, spawned]);
    };

    const updateElementTransform = (body: Matter.Body, spawned: SpawnedBody, el: HTMLDivElement) => {
      if (
        !body.isStatic &&
        body.speed < REST_SPEED &&
        Math.abs(body.angularVelocity) < REST_ANGULAR
      ) {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
        Sleeping.set(body, true);
      }

      const x = Math.round(body.position.x - spawned.bodyWidth / 2);
      const y = Math.round(body.position.y - spawned.bodyHeight / 2);
      el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
    };

    const onAfterUpdate = () => {
      tileBodiesRef.current.forEach((body) => {
        const el = tileElementsRef.current.get(body.id);
        const spawned = spawnedBodiesRef.current.get(body.id);
        if (!el || !spawned) return;
        updateElementTransform(body, spawned, el);
      });
    };

    Events.on(engine, "afterUpdate", onAfterUpdate);

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    syncObstacles();
    spawnSet.forEach((item, index) => {
      const timer = window.setTimeout(
        () => spawnItem(item, index),
        spawnStartDelay + index * SPAWN_DELAY_MS,
      );
      spawnTimersRef.current.push(timer);
    });

    const obstacleTimer = fullCanvas ? window.setInterval(syncObstacles, 500) : undefined;
    let measuredWidth = width;
    let measuredHeight = height;
    let measuredSize = size;

    const onResize = () => {
      const next = measure();
      const sizeScale = next.size / measuredSize;

      if (Math.abs(sizeScale - 1) > 0.001) {
        tileBodiesRef.current.forEach((body) => Body.scale(body, sizeScale, sizeScale));

        spawnedBodiesRef.current.forEach((spawned) => {
          spawned.bodyWidth *= sizeScale;
          spawned.bodyHeight *= sizeScale;
        });
        setSpawnedBodies([...spawnedBodiesRef.current.values()]);
      }

      Body.scale(
        ground,
        (next.width + wallThickness * 2) / (measuredWidth + wallThickness * 2),
        1,
      );
      Body.setPosition(ground, {
        x: next.width / 2,
        y: next.height + wallThickness / 2,
      });
      Body.scale(leftWall, 1, next.height / measuredHeight);
      Body.setPosition(leftWall, { x: -wallThickness / 2, y: next.height / 2 });
      Body.scale(rightWall, 1, next.height / measuredHeight);
      Body.setPosition(rightWall, {
        x: next.width + wallThickness / 2,
        y: next.height / 2,
      });

      measuredWidth = next.width;
      measuredHeight = next.height;
      measuredSize = next.size;
      syncObstacles();
    };
    window.addEventListener("resize", onResize);

    const lastPopAt = new Map<number, number>();
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "pointer";

    // Cursor contact wakes a piece and kicks it upward.
    const popAt = (clientX: number, clientY: number, withSound: boolean) => {
      const hits = Query.point(tileBodiesRef.current, {
        x: clientX,
        y: clientY,
      });
      if (hits.length === 0) return;

      const now = performance.now();
      for (const body of hits) {
        const last = lastPopAt.get(body.id) ?? 0;
        if (now - last < POP_COOLDOWN_MS) continue;
        lastPopAt.set(body.id, now);

        if (withSound) playHeroSound("whisper", "physics-pop");

        Sleeping.set(body, false);
        Body.setVelocity(body, {
          x: body.velocity.x + (Math.random() - 0.5) * POP_LATERAL * 2,
          y: -POP_UP_SPEED,
        });
        Body.setAngularVelocity(
          body,
          body.angularVelocity + (Math.random() - 0.5) * POP_SPIN * 2,
        );
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (isInteractiveTarget(event.target as Element | null)) return;
      popAt(event.clientX, event.clientY, true);
    };

    // Click/tap unlocks audio and pops with sound in the same gesture.
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (isInteractiveTarget(event.target as Element | null)) return;
      unlockCuelume();
      popAt(event.clientX, event.clientY, true);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      spawnTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      spawnTimersRef.current = [];
      if (obstacleTimer) window.clearInterval(obstacleTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.body.style.cursor = previousCursor;
      Events.off(engine, "afterUpdate", onAfterUpdate);
      Runner.stop(runner);
      Engine.clear(engine);
      engineRef.current = null;
      runnerRef.current = null;
      tileBodiesRef.current = [];
      spawnedBodiesRef.current.clear();
      obstacleBodiesRef.current = [];
      tileElementsRef.current.clear();
    };
  }, [reducedMotion, fullCanvas, obstacleRefs, mounted, isShapes, variant]);

  const canvasStyle: React.CSSProperties = fullCanvas
    ? {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 5,
        overflow: "visible",
        pointerEvents: "none",
      }
    : {
        position: "relative",
        width: "18rem",
        height: "11.25rem",
        overflow: "hidden",
      };

  const renderStatic = (staticPoses: StaticShapePose[], shapes: ShapeDef[]) => {
    if (isShapes) {
      return staticPoses.map(({ shapeId, x, y, angle }) => {
        const shape = shapes.find((entry) => entry.id === shapeId);
        if (!shape) return null;
        const { width: bodyWidth, height: bodyHeight } = shapeBodyDimensions(activeBaseSize, shape);
        return (
          <div
            key={`${shapeId}-${x}-${y}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: bodyWidth,
              height: bodyHeight,
              transform: `translate(${x * containerSize.width - bodyWidth / 2}px, ${y * containerSize.height - bodyHeight / 2}px) rotate(${angle}rad)`,
            }}
          >
            <PhysicsShapeFace shape={shape} baseSize={activeBaseSize} />
          </div>
        );
      });
    }

    return STATIC_TILE_POSES.map(({ tileId, x, y, angle }) => {
      const tile = TILES.find((entry) => entry.id === tileId);
      if (!tile) return null;
      return (
        <div
          key={tileId}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: activeBaseSize,
            height: activeBaseSize,
            transform: `translate(${x * containerSize.width - activeBaseSize / 2}px, ${y * containerSize.height - activeBaseSize / 2}px) rotate(${angle}rad)`,
          }}
        >
          <PhysicsTileFace tile={tile} size={activeBaseSize} />
        </div>
      );
    });
  };

  const canvas = (
    <div ref={containerRef} className="physics-tiles" style={canvasStyle} aria-hidden="true">
      {reducedMotion
        ? renderStatic(shapeConfig.staticPoses, shapeConfig.shapes)
        : spawnedBodies.map((spawned) => (
            <div
              key={spawned.bodyId}
              ref={(el) => {
                if (el) {
                  tileElementsRef.current.set(spawned.bodyId, el);
                  const body = tileBodiesRef.current.find((entry) => entry.id === spawned.bodyId);
                  if (body) {
                    const x = Math.round(body.position.x - spawned.bodyWidth / 2);
                    const y = Math.round(body.position.y - spawned.bodyHeight / 2);
                    el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
                  }
                } else {
                  tileElementsRef.current.delete(spawned.bodyId);
                }
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: spawned.bodyWidth,
                height: spawned.bodyHeight,
                willChange: "transform",
                pointerEvents: "none",
              }}
            >
              {spawned.shape ? (
                <PhysicsShapeFace shape={spawned.shape} baseSize={activeBaseSize} />
              ) : spawned.tile ? (
                <PhysicsTileFace tile={spawned.tile} size={activeBaseSize} />
              ) : null}
            </div>
          ))}
    </div>
  );

  if (fullCanvas) {
    if (!mounted) return null;
    return createPortal(canvas, document.body);
  }

  return (
    <motion.div className="physics-tiles-entrance" style={{ marginBottom: "1rem" }} variants={variants}>
      {canvas}
    </motion.div>
  );
}
