import "./UberVehicleDashboardDemo.css";

const WIDTHS = [480, 768, 960, 1440, 1929];
// Below ~33rem the frame is a padded column, so the HUD spans it edge to edge.
const SIZES =
  "(max-width: 33rem) calc(100vw - 6rem), (max-width: 41.25rem) 68vw, (max-width: 80rem) 53vw, 40.8rem";

function sourceSet(format: "avif" | "webp") {
  return WIDTHS.map((width) => `/images/casestudies/HUD-${width}.${format} ${width}w`).join(", ");
}

export default function UberVehicleDashboardDemo() {
  return (
    // The wrapper carries the size container: the frame cannot query itself,
    // and the frame's own layout changes at narrow widths.
    <div className="uber-dashboard-container">
      <div
        className="uber-dashboard-demo study-image"
        role="img"
        aria-label="Uber self-driving vehicle interface"
      >
        <div className="uber-dashboard-artwork">
        <picture>
          <source type="image/avif" srcSet={sourceSet("avif")} sizes={SIZES} />
          <source type="image/webp" srcSet={sourceSet("webp")} sizes={SIZES} />
          <img
            src="/images/casestudies/HUD.png"
            width="1929"
            height="705"
            loading="lazy"
            decoding="async"
            alt=""
          />
        </picture>
        <svg viewBox="0 0 1929 705" className="uber-dashboard-readings" aria-hidden="true">
          {/* Keep actual, commanded, and delta readings distinct; delta is Cmd − Act. */}
          {[
            { x: 30, value: "1.23", actual: true },
            { x: 171, value: "1.50", actual: false },
            { x: 312, value: "0.27", actual: false },
            { x: 478, value: "13.87", actual: true },
            { x: 619, value: "14.25", actual: false },
            { x: 760, value: "0.38", actual: false },
          ].map(({ x, value, actual }) => (
            <g key={x}>
              <rect x={x - 2} y="584" width="124" height="48" fill="#22252b" />
              <text x={x} y="626" fill={actual ? "#60bdff" : "#e9ecf2"} fontSize="48" fontFamily="Lato, Arial, sans-serif">{value}</text>
            </g>
          ))}
        </svg>
        </div>
        <p className="text-caption uber-dashboard-caption">
          Dashboards for mission specialists and triage engineers
        </p>
      </div>
    </div>
  );
}
