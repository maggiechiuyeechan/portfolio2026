import BlueDotDiseaseReportDemo from "./BlueDotDiseaseReportDemo";
import BlueDotFlightEstimateDemo from "./BlueDotFlightEstimateDemo";
import "./BlueDotDemo.css";

/*
 * Each panel scales inside its own container so the pair can flow as grid items
 * and stack on narrow screens. Plain divs + container-query scale — not SVG
 * foreignObject — so iOS Safari doesn't lay out the stage at 1:1 px and clip.
 */
export default function BlueDotHeroDemo() {
  return (
    <div
      className="bluedot-hero-demo study-image"
      role="group"
      aria-label="BlueDot disease surveillance mobile alerts"
    >
      {/* --demo-scale on each stage arrives from initDemoScale before hydration;
          see src/lib/demoScale.ts */}
      <div className="bluedot-hero-pane is-report">
        <div className="bluedot-hero-stage" suppressHydrationWarning>
          <BlueDotDiseaseReportDemo />
        </div>
      </div>
      <div className="bluedot-hero-pane is-flight">
        <div className="bluedot-hero-stage" suppressHydrationWarning>
          <BlueDotFlightEstimateDemo />
        </div>
      </div>
    </div>
  );
}
