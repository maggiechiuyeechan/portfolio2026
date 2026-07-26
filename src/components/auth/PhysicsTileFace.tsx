import type { TileDef } from "./physicsTiles";

interface Props {
  tile: TileDef;
  size: number;
}

const iconStyle = (size: number): React.CSSProperties => ({
  width: size * 0.72,
  height: size * 0.72,
  objectFit: "contain",
  display: "block",
});

function Asterisk({ size, bar }: { size: number; bar: number }) {
  const barWidth = size * 0.6;
  const barHeight = size * bar;
  const barStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: barWidth,
    height: barHeight,
    marginLeft: -barWidth / 2,
    marginTop: -barHeight / 2,
    background: "#000",
    borderRadius: barHeight / 2,
  };

  return (
    <div style={{ position: "relative", width: size * 0.72, height: size * 0.72 }}>
      {[0, 45, 90, 135].map((deg) => (
        <div key={deg} style={{ ...barStyle, transform: `rotate(${deg}deg)` }} />
      ))}
    </div>
  );
}

function Sunburst({ size }: { size: number }) {
  const rays = Array.from({ length: 12 }, (_, i) => i * 15);
  return (
    <div style={{ position: "relative", width: size * 0.72, height: size * 0.72 }}>
      {rays.map((deg) => (
        <div
          key={deg}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: size * 0.55,
            height: Math.max(2, size * 0.04),
            marginLeft: -(size * 0.55) / 2,
            marginTop: -Math.max(1, size * 0.02),
            background: "#000",
            transform: `rotate(${deg}deg)`,
            transformOrigin: "center center",
          }}
        />
      ))}
    </div>
  );
}

function LineGrid({
  size,
  direction,
  count,
  gap,
  offset = 0,
}: {
  size: number;
  direction: "horizontal" | "vertical";
  count: number;
  gap: number;
  offset?: number;
}) {
  const lineThickness = Math.max(1.5, size * 0.025);
  const lineLength = size * 0.62;
  const lines = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "column" : "row",
        gap,
        alignItems: "center",
        paddingLeft: direction === "horizontal" ? offset : 0,
      }}
    >
      {lines.map((line) => (
        <div
          key={line}
          style={{
            width: direction === "horizontal" ? lineLength : lineThickness,
            height: direction === "horizontal" ? lineThickness : lineLength,
            background: "#000",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function OffsetLines({ size }: { size: number }) {
  const bar = Math.max(1.5, size * 0.025);
  const barHeight = size * 0.28;
  const row = (
    <div style={{ display: "flex", gap: size * 0.025 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{ width: bar, height: barHeight, background: "#000" }} />
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: size * 0.035 }}>
      {row}
      <div style={{ paddingLeft: size * 0.03 }}>{row}</div>
    </div>
  );
}

function DotsGrid({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: size * 0.05 }}>
      {Array.from({ length: 5 }, (_, row) => (
        <img
          key={row}
          src="/images/tiles/dots-row.svg"
          alt=""
          style={{ width: size * 0.55, height: size * 0.03, display: "block" }}
        />
      ))}
    </div>
  );
}

export default function PhysicsTileFace({ tile, size }: Props) {
  const radius = size * 0.171;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: tile.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      {tile.pattern === "asterisk" && <Asterisk size={size} bar={0.12} />}
      {tile.pattern === "sharp-asterisk" && <Asterisk size={size} bar={0.09} />}
      {tile.pattern === "sunburst" && <Sunburst size={size} />}
      {tile.pattern === "pie-chart" && (
        <img src="/images/tiles/pie-chart.svg" alt="" style={iconStyle(size)} />
      )}
      {tile.pattern === "chart-column" && (
        <img src="/images/tiles/chart-column-stacked.svg" alt="" style={iconStyle(size)} />
      )}
      {tile.pattern === "offset-lines" && <OffsetLines size={size} />}
      {tile.pattern === "horizontal-lines" && (
        <LineGrid size={size} direction="horizontal" count={8} gap={size * 0.035} />
      )}
      {tile.pattern === "vertical-lines" && (
        <LineGrid size={size} direction="vertical" count={8} gap={size * 0.035} />
      )}
      {tile.pattern === "waves" && (
        <img src="/images/tiles/waves.svg" alt="" style={{ ...iconStyle(size), width: size * 0.62, height: size * 0.5 }} />
      )}
      {tile.pattern === "dots-grid" && <DotsGrid size={size} />}
      {tile.pattern === "circle-x" && (
        <img src="/images/tiles/circle-x.svg" alt="" style={iconStyle(size)} />
      )}
      {tile.pattern === "heart" && (
        <img src="/images/tiles/heart.svg" alt="" style={{ ...iconStyle(size), width: size * 0.55, height: size * 0.55 }} />
      )}
      {tile.pattern === "donut" && (
        <img src="/images/tiles/donut.svg" alt="" style={iconStyle(size)} />
      )}
      {tile.pattern === "arrow-up-right" && (
        <img src="/images/tiles/arrow-up-right.svg" alt="" style={iconStyle(size)} />
      )}
      {tile.pattern === "hourglass" && (
        <img src="/images/tiles/hourglass.svg" alt="" style={{ ...iconStyle(size), width: size * 0.5, height: size * 0.58 }} />
      )}
    </div>
  );
}
