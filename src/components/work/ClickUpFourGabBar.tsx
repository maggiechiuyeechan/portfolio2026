import "./ClickUpFourGabBar.css";
import wsLogo from "../../assets/clickup-four-demo/gab-ws-star.svg";
import wsChevron from "../../assets/clickup-four-demo/gab-chevron.svg";
import searchIcon from "../../assets/clickup-four-demo/gab-search.svg";
// Flat export of the whole AI mark, petals and sparkle together, so the three
// component-driven slides match the one the Whiteboards board bakes in.
import brainAi from "../../assets/clickup-four-demo/gab-ai-brain-colored.png";

/** Pixel-matched Gab top bar shared by Tasks, Docs, and Calendar slides. */
export default function ClickUpFourGabBar() {
  return (
    <div className="cu4-gab" aria-hidden="true">
      <div className="cu4-gab-ws">
        <span className="cu4-gab-ws-logo">
          <img alt="" src={wsLogo.src} />
        </span>
        <span className="cu4-gab-ws-label">
          Mango Inc.
          <img alt="" src={wsChevron.src} />
        </span>
      </div>

      <div className="cu4-gab-search">
        <div className="cu4-gab-search-inner">
          <span className="cu4-gab-search-icon">
            <img alt="" src={searchIcon.src} />
          </span>
          <span className="cu4-gab-search-text">
            {"Search "}
            <kbd>⌘K</kbd>
          </span>
          <span className="cu4-gab-search-brain">
            <span className="cu4-gab-search-brain-glyph">
              <img alt="" src={brainAi.src} />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
