import BlueDotDiseaseReportDemo from "./BlueDotDiseaseReportDemo";
import BlueDotFlightEstimateDemo from "./BlueDotFlightEstimateDemo";
import "./BlueDotDemo.css";

/*
 * Each panel scales inside its own viewBox so the pair can flow as grid items
 * and stack on narrow screens; a single shared viewBox would pin them to one
 * fixed aspect ratio.
 */
export default function BlueDotHeroDemo() {
  return (
    <div
      className="bluedot-hero-demo study-image"
      role="group"
      aria-label="BlueDot disease surveillance mobile alerts"
    >
      <div className="bluedot-hero-pane is-report">
        <svg className="bluedot-hero-viewport" viewBox="0 0 580.917 536">
          <foreignObject width="580.917" height="536">
            <div className="bluedot-hero-stage">
              <BlueDotDiseaseReportDemo />
            </div>
          </foreignObject>
        </svg>
      </div>
      <div className="bluedot-hero-pane is-flight">
        <svg className="bluedot-hero-viewport" viewBox="0 0 343.75 536">
          <foreignObject width="343.75" height="536">
            <div className="bluedot-hero-stage">
              <BlueDotFlightEstimateDemo />
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}
