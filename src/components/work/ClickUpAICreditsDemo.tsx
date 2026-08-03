import { useEffect, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "../../lib/motion";
import creditsGlow from "../../assets/clickup-ai-demo/credits-glow-figma.svg";
import creditsSidebarMask from "../../assets/clickup-ai-demo/credits-sidebar-mask.svg";
import "./ClickUpAIDemo.css";

const TARGET = { used: 79.3, percent: 79, hours: 50, savings: 20000 };
const LOOP_MS = 7000;
const COUNT_START_MS = 500;
const COUNT_END_MS = 2700;
const RESET_START_MS = 5900;
const RESET_END_MS = 6500;

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

function progressAt(elapsed: number) {
  if (elapsed < COUNT_START_MS) return 0;
  if (elapsed < COUNT_END_MS) {
    return easeOut((elapsed - COUNT_START_MS) / (COUNT_END_MS - COUNT_START_MS));
  }
  if (elapsed < RESET_END_MS) return 1;
  return 0;
}

function cardProgressAt(elapsed: number) {
  if (elapsed < COUNT_START_MS) return easeOut(elapsed / COUNT_START_MS);
  if (elapsed < RESET_START_MS) return 1;
  if (elapsed < RESET_END_MS) {
    return 1 - easeInOut((elapsed - RESET_START_MS) / (RESET_END_MS - RESET_START_MS));
  }
  return 0;
}

function SegmentedMeter({ active, progress }: { active: number; progress: number }) {
  return (
    <span className="cua-credits-meter" aria-hidden="true">
      {Array.from({ length: 19 }, (_, index) => (
        <i
          className={index < Math.round(active * progress) ? "is-on" : ""}
          key={index}
        />
      ))}
    </span>
  );
}

export default function ClickUpAICreditsDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const [elapsed, setElapsed] = useState(reducedMotion ? COUNT_END_MS : 0);

  useEffect(() => {
    if (reducedMotion) {
      setElapsed(COUNT_END_MS);
      return;
    }
    const started = performance.now();
    let animationFrame = 0;

    const tick = (now: number) => {
      setElapsed((now - started) % LOOP_MS);
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [reducedMotion]);

  const progress = progressAt(elapsed);
  const cardProgress = reducedMotion ? 1 : cardProgressAt(elapsed);
  const usedValue = TARGET.used * progress;
  const used = usedValue.toFixed(1);
  const remainingCredits = (100 - usedValue).toFixed(1);
  const percent = Math.round(TARGET.percent * progress);
  const hours = Math.round(TARGET.hours * progress);
  const savings = Math.round(TARGET.savings * progress).toLocaleString("en-US");
  const askMeterProgress = Math.min(1, progress * 1.25);
  const superCreditsMeterProgress = progress;
  const askPercent = Math.round(41 * askMeterProgress);
  const cardStyle = {
    opacity: cardProgress,
    transform: `translateY(${(1 - cardProgress) * 24}px)`,
  };
  const maskStyle = {
    "--cua-credits-sidebar-mask": `url("${creditsSidebarMask.src}")`,
  } as CSSProperties;

  return (
    <div className="cua-credits-demo study-image" role="img" aria-label="ClickUp AI credits usage animation">
      <svg className="cua-credits-viewport" viewBox="0 0 462.333 500" aria-hidden="true">
        <foreignObject width="462.333" height="500">
          <div className="cua-credits-stage" style={maskStyle}>
            <div className="cua-credits-noise" />
            <div className="cua-credits-screen" aria-hidden="true" />
            <div className="cua-credits-sidebar">
              <section className="cua-credits-card" style={cardStyle}>
                <div className="cua-credits-glow">
                  <div>
                    <img
                      src={creditsGlow.src}
                      width="362.664"
                      height="427.984"
                      alt=""
                    />
                  </div>
                </div>
                <div className="cua-credits-usage">
                  <p className="cua-credits-eyebrow">Monthly Usage</p>
                  <dl className="cua-credits-rows">
                    <div><dt>Used</dt><dd>{used}k credits</dd></div>
                    <div><dt>Total</dt><dd>100k credits</dd></div>
                    <div>
                      <dt>Progress</dt>
                      <dd className="cua-credits-progress">
                        <span><i style={{ width: `${TARGET.percent * progress}%` }} /></span>
                        <b>{percent}%</b>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="cua-credits-savings">
                  <p className="cua-credits-eyebrow">Your team has saved</p>
                  <dl className="cua-credits-rows">
                    <div><dt>Time</dt><dd>{hours} hours</dd></div>
                    <div><dt>Cost savings</dt><dd>{savings} USD</dd></div>
                  </dl>
                </div>
                <button type="button" tabIndex={-1}>Add credits</button>
              </section>

              <div className="cua-credits-widgets">
                <div className="cua-credits-widget">
                  <p className="cua-credits-widget-title">ASK AI</p>
                  <SegmentedMeter active={7} progress={askMeterProgress} />
                  <p className="cua-credits-widget-meta"><span>25 asks left</span><span>{askPercent}%</span></p>
                </div>
                <div className="cua-credits-widget">
                  <p className="cua-credits-widget-title">SUPER CREDITS</p>
                  <SegmentedMeter active={15} progress={superCreditsMeterProgress} />
                  <p className="cua-credits-widget-meta"><span>{remainingCredits}k left</span><span>{percent}%</span></p>
                </div>
              </div>
            </div>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
