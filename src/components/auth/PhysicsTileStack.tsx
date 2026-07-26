/**
 * Physics pile — colored tiles (Version B) or Figma shapes (Versions C/D/E).
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import Matter from "matter-js";
import { usePrefersReducedMotion } from "../../lib/motion";
import PhysicsTileFace from "./PhysicsTileFace";
import PhysicsShapeFace from "./PhysicsShapeFace";
import { STATIC_TILE_POSES, TILES, type TileDef } from "./physicsTiles";
import { shapeBodyDimensions, type ShapeDef, type StaticShapePose } from "./physicsShapes";
import { SHAPES_C, SHAPES_C_SPAWN, STATIC_SHAPE_POSES_C } from "./physicsShapesC";
import { SHAPES_D, SHAPES_D_SPAWN, STATIC_SHAPE_POSES_D } from "./physicsShapesD";
import { SHAPES_E, SHAPES_E_SPAWN, STATIC_SHAPE_POSES_E } from "./physicsShapesE";

interface Props {
  variants?: Record<string, unknown>;
  fullCanvas?: boolean;
  obstacleRefs?: React.RefObject<HTMLElement | null>[];
  variant?: "tiles" | "shapes-c" | "shapes-d" | "shapes-e";
}

const COMPACT_TILE_SIZE = 48;
const FULL_CANVAS_TILE_SIZE = 240;
const FULL_CANVAS_TILE_COUNT = 12;
const SPAWN_DELAY_MS = 90;
const OBSTACLE_PAD = 12;
/** Below this speed/angular velocity, bodies are forced to sleep */
const REST_SPEED = 0.12;
const REST_ANGULAR = 0.025;

interface SpawnedBody {
  bodyId: number;
  bodyWidth: number;
  bodyHeight: number;
  tile?: TileDef;
  shape?: ShapeDef;
}

function getShapeConfig(variant: Props["variant"]) {
  if (variant === "shapes-d") {
    return {
      shapes: SHAPES_D,
      spawn: SHAPES_D_SPAWN,
      staticPoses: STATIC_SHAPE_POSES_D,
    };
  }
  if (variant === "shapes-e") {
    return {
      shapes: SHAPES_E,
      spawn: SHAPES_E_SPAWN,
      staticPoses: STATIC_SHAPE_POSES_E,
    };
  }
  return {
    shapes: SHAPES_C,
    spawn: SHAPES_C_SPAWN,
    staticPoses: STATIC_SHAPE_POSES_C,
  };
}

function baseSize(fullCanvas: boolean, width: number) {
  if (!fullCanvas) return COMPACT_TILE_SIZE;
  return Math.max(160, Math.min(FULL_CANVAS_TILE_SIZE, Math.round(width * 0.3)));
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
  const isShapes = variant === "shapes-c" || variant === "shapes-d" || variant === "shapes-e";
  const shapeConfig = getShapeConfig(variant);
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
      const size = baseSize(fullCanvas, width);
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
        : TILES.slice(0, FULL_CANVAS_TILE_COUNT)
      : isShapes
        ? shapeConfig.shapes
        : TILES;
    const spawnStartDelay = fullCanvas ? 500 : 0;

    const { Engine, Runner, Bodies, Composite, Body, Events, Sleeping } = Matter;
    const engine = Engine.create({
      enableSleeping: true,
      positionIterations: 8,
      velocityIterations: 6,
    });
    engine.gravity.y = 1.2;
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
        frictionAir: 0.02,
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
    const onResize = () => {
      measure();
      syncObstacles();
    };
    window.addEventListener("resize", onResize);

    return () => {
      spawnTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      spawnTimersRef.current = [];
      if (obstacleTimer) window.clearInterval(obstacleTimer);
      window.removeEventListener("resize", onResize);
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
