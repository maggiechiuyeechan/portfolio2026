/**
 * Monster illustration (Figma node 354:79493) whose pupils track the pointer.
 * Each eye is a plain ellipse in the source art, so it is drawn as-is and doubles as
 * the clip for a pupil that drifts toward the cursor without escaping the rim.
 */
import { useEffect, useId, useRef } from "react";
import { usePrefersReducedMotion } from "../../lib/motion";
import { MONSTERS, MONSTER_VIEWBOX } from "./monsters";

const DEG = Math.PI / 180;

/** Pointer distance, in viewBox units, at which a pupil reaches full deflection. */
const FULL_GAZE_DISTANCE = 380;
/** Share of the remaining distance a pupil covers each frame. */
const GAZE_EASING = 0.18;
/** Below this drift, in viewBox units, the gaze is treated as settled. */
const SETTLE_EPSILON = 0.02;

interface PupilGeometry {
  /** Resting centre, where the pupil sits looking straight ahead. */
  rootX: number;
  rootY: number;
  travelX: number;
  travelY: number;
  /** Eye tilt, used to map the gaze into the eye's own frame. */
  cos: number;
  sin: number;
}

const PUPILS: PupilGeometry[] = MONSTERS.flatMap((monster) =>
  monster.eyes.map((eye) => {
    const radians = eye.rotate * DEG;
    return {
      rootX: eye.cx,
      rootY: eye.cy,
      travelX: eye.travelX,
      travelY: eye.travelY,
      cos: Math.cos(radians),
      sin: Math.sin(radians),
    };
  }),
);

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

export default function MonsterEyes({ className, style }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilRefs = useRef<(SVGEllipseElement | null)[]>([]);
  const clipPrefix = useId().replace(/:/g, "");

  useEffect(() => {
    if (reducedMotion) return;

    const svg = svgRef.current;
    if (!svg) return;

    const offsets = PUPILS.map(() => ({ x: 0, y: 0 }));
    const pointer = { clientX: 0, clientY: 0, seen: false };
    let frame = 0;

    const step = () => {
      frame = 0;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // The SVG keeps its intrinsic aspect ratio, so the box maps 1:1 onto the viewBox.
      const gazeX =
        MONSTER_VIEWBOX.x +
        ((pointer.clientX - rect.left) / rect.width) * MONSTER_VIEWBOX.width;
      const gazeY =
        MONSTER_VIEWBOX.y +
        ((pointer.clientY - rect.top) / rect.height) * MONSTER_VIEWBOX.height;

      let moving = false;

      PUPILS.forEach((pupil, index) => {
        const element = pupilRefs.current[index];
        if (!element) return;

        const dx = gazeX - pupil.rootX;
        const dy = gazeY - pupil.rootY;
        const distance = Math.hypot(dx, dy);

        let targetX = 0;
        let targetY = 0;

        if (distance > 0.001) {
          const reach = Math.min(1, distance / FULL_GAZE_DISTANCE);
          const dirX = dx / distance;
          const dirY = dy / distance;
          // Undo the eye's tilt so travel limits stay aligned to its own axes.
          targetX = (dirX * pupil.cos + dirY * pupil.sin) * pupil.travelX * reach;
          targetY = (dirY * pupil.cos - dirX * pupil.sin) * pupil.travelY * reach;
        }

        const current = offsets[index]!;
        current.x += (targetX - current.x) * GAZE_EASING;
        current.y += (targetY - current.y) * GAZE_EASING;

        if (
          Math.abs(targetX - current.x) > SETTLE_EPSILON ||
          Math.abs(targetY - current.y) > SETTLE_EPSILON
        ) {
          moving = true;
        }

        element.setAttribute(
          "transform",
          `translate(${current.x.toFixed(2)} ${current.y.toFixed(2)})`,
        );
      });

      if (moving) frame = requestAnimationFrame(step);
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(step);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.seen = true;
      schedule();
    };

    const onViewportChange = () => {
      if (pointer.seen) schedule();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  let pupilIndex = 0;

  return (
    <svg
      ref={svgRef}
      className={className}
      style={{ display: "block", width: "100%", height: "auto", ...style }}
      viewBox={`${MONSTER_VIEWBOX.x} ${MONSTER_VIEWBOX.y} ${MONSTER_VIEWBOX.width} ${MONSTER_VIEWBOX.height}`}
      role="img"
      aria-label="A crowd of cartoon monsters watching the cursor"
    >
      <defs>
        {MONSTERS.map((monster, monsterIndex) =>
          monster.eyes.map((eye, eyeIndex) => (
            <clipPath
              key={`${monster.id}-${eyeIndex}`}
              id={`${clipPrefix}-${monsterIndex}-${eyeIndex}`}
            >
              <ellipse
                cx={eye.cx}
                cy={eye.cy}
                rx={eye.rx}
                ry={eye.ry}
                transform={`rotate(${eye.rotate} ${eye.cx} ${eye.cy})`}
              />
            </clipPath>
          )),
        )}
      </defs>

      {MONSTERS.map((monster, monsterIndex) => (
        <g key={monster.id}>
          {monster.bodyPaths.map((d, index) => (
            <path key={index} d={d} fill={monster.color} />
          ))}

          {monster.eyes.map((eye, eyeIndex) => (
            <ellipse
              key={`white-${eyeIndex}`}
              cx={eye.cx}
              cy={eye.cy}
              rx={eye.rx}
              ry={eye.ry}
              transform={`rotate(${eye.rotate} ${eye.cx} ${eye.cy})`}
              fill="#FFFFFF"
            />
          ))}

          {monster.eyes.map((eye, eyeIndex) => {
            const index = pupilIndex++;
            return (
              <g
                key={`pupil-${eyeIndex}`}
                clipPath={`url(#${clipPrefix}-${monsterIndex}-${eyeIndex})`}
              >
                {/* Tilted into the eye's frame, so the pupil's drift follows its axes. */}
                <g transform={`rotate(${eye.rotate} ${eye.cx} ${eye.cy})`}>
                  <ellipse
                    ref={(element) => {
                      pupilRefs.current[index] = element;
                    }}
                    cx={eye.cx}
                    cy={eye.cy}
                    rx={eye.pupilRx}
                    ry={eye.pupilRy}
                    fill="#1D1D1B"
                  />
                </g>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
