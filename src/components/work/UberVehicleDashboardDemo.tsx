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
        <p className="text-caption uber-dashboard-caption">
          Dashboards for mission specialists and triage engineers
        </p>
      </div>
    </div>
  );
}
