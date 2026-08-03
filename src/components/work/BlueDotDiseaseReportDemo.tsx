import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../../lib/motion";
import chartCases from "../../assets/bluedot-demo/yellow-fever-cases.svg";
import chartDeaths from "../../assets/bluedot-demo/yellow-fever-deaths.svg";
import microbeVector from "../../assets/bluedot-demo/microbe-vector.svg";
import microbeGroupA from "../../assets/bluedot-demo/microbe-group-a.svg";
import microbeGroupB from "../../assets/bluedot-demo/microbe-group-b.svg";
import microbeGroupC from "../../assets/bluedot-demo/microbe-group-c.svg";
import microbeGroupD from "../../assets/bluedot-demo/microbe-group-d.svg";
import mosquito from "../../assets/bluedot-demo/mosquito.svg";
import vaccination from "../../assets/bluedot-demo/vaccination.svg";
import severity from "../../assets/bluedot-demo/severity-face.svg";
import reportDivider from "../../assets/bluedot-demo/report-divider.svg";

const FINAL_VALUES = {
  reported: 1285,
  suspected: 1301,
  confirmed: 1261,
  deaths: 408,
};

const ENTRANCE_MS = 3600;
const CHART_LINE_COUNT = 110;

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

function phase(progress: number, start: number, end: number) {
  return easeOut(Math.max(0, Math.min(1, (progress - start) / (end - start))));
}

function formatCount(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

function Detail({
  className,
  label,
  value,
  icon,
}: {
  className: string;
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className={`bluedot-report-detail ${className}`}>
      <div className="bluedot-report-detail-icon">{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function MicrobeIcon() {
  return (
    <div className="bluedot-microbe-icon">
      <img className="vector" src={microbeVector.src} width="9.617" height="9.617" alt="" />
      <img className="group-a" src={microbeGroupA.src} width="2.509" height="14.217" alt="" />
      <img className="group-b" src={microbeGroupB.src} width="14.217" height="2.509" alt="" />
      <img className="group-c" src={microbeGroupC.src} width="11.831" height="11.831" alt="" />
      <img className="group-d" src={microbeGroupD.src} width="11.831" height="11.831" alt="" />
    </div>
  );
}

export default function BlueDotDiseaseReportDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      playedRef.current = true;
      setProgress(1);
      return;
    }

    const element = panelRef.current;
    if (!element || playedRef.current) return;
    let animationFrame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || playedRef.current) return;
      playedRef.current = true;
      observer.disconnect();
      const started = performance.now();
      const tick = (now: number) => {
        const next = Math.min(1, (now - started) / ENTRANCE_MS);
        setProgress(next);
        if (next < 1) animationFrame = window.requestAnimationFrame(tick);
      };
      animationFrame = window.requestAnimationFrame(tick);
    }, { rootMargin: "80px" });
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [reducedMotion]);

  const cardIn = phase(progress, 0, 0.18);
  const headerIn = phase(progress, 0.1, 0.32);
  const metricsIn = phase(progress, 0.22, 0.52);
  const chartIn = phase(progress, 0.3, 0.96);
  const detailsIn = phase(progress, 0.62, 0.86);
  const briefIn = phase(progress, 0.76, 1);
  const metricProgress = phase(progress, 0.18, 0.4);
  const chartLineReveal = Math.floor(chartIn * CHART_LINE_COUNT) / CHART_LINE_COUNT;

  const cardStyle = {
    "--bluedot-card-opacity": cardIn,
    "--bluedot-card-shift": `${(1 - cardIn) * 8}px`,
  } as CSSProperties;

  return (
    <section
      ref={panelRef}
      className="bluedot-report-panel"
      aria-label="Yellow Fever case report for São Paulo, Brazil"
    >
      <div className="bluedot-panel-noise" aria-hidden="true" />
      <div className="bluedot-report-card" style={cardStyle} aria-hidden="true">
        <div className="bluedot-report-header" style={{ opacity: headerIn }}>
          <p className="bluedot-report-date">May 15, 2020 - Present</p>
          <h3>Yellow Fever in São Paulo, Brazil</h3>
        </div>

        <div className="bluedot-report-metrics" style={{ opacity: metricsIn }}>
          <div><span>Cases reported</span><strong className="reported">{formatCount(FINAL_VALUES.reported * metricProgress)}</strong></div>
          <div><span>Cases suspected</span><strong>{formatCount(FINAL_VALUES.suspected * metricProgress)}</strong></div>
          <div><span>Cases confirmed</span><strong>{formatCount(FINAL_VALUES.confirmed * metricProgress)}</strong></div>
          <div><span>Deaths</span><strong className="deaths">{formatCount(FINAL_VALUES.deaths * metricProgress)}</strong></div>
        </div>

        <div className="bluedot-report-chart" style={{ clipPath: `inset(0 ${(1 - chartLineReveal) * 100}% 0 0)` }}>
          <img className="cases" src={chartCases.src} width="303.975" height="92.827" alt="" />
          <img className="deaths" src={chartDeaths.src} width="303.975" height="29.945" alt="" />
        </div>

        <div className="bluedot-report-months" style={{ opacity: chartIn }}>
          <span>JUN 2020</span><span>JUL 2020</span><span>AUG 2020</span>
        </div>

        <div className="bluedot-report-details" style={{ opacity: detailsIn }}>
          <img className="divider top" src={reportDivider.src} width="306.078" height="0.84" alt="" />
          <Detail className="microbe" label="Microbe type" value="Virus" icon={<MicrobeIcon />} />
          <Detail className="transmitted" label="Transmitted" value="Mosquito" icon={<img src={mosquito.src} width="14.207" height="15.128" alt="" />} />
          <Detail className="vaccination" label="Vaccination" value="Live-attenuated" icon={<img src={vaccination.src} width="13.188" height="13.196" alt="" />} />
          <Detail className="severity" label="Severity" value="Mild for most" icon={<img src={severity.src} width="14.635" height="14.635" alt="" />} />
          <img className="divider bottom" src={reportDivider.src} width="306.078" height="0.84" alt="" />
        </div>

        <div className="bluedot-report-brief" style={{ opacity: briefIn }}>
          <span>Brief</span>
          <p>
            This outbreak is generating high-volume, broad geographic coverage via mass media. Consequently it is expected that travel volumes will decrease by about 60-70%. Travelers who fall ill during flights are not contagious and cannot spread the virus to flight crew or other passengers. Conditions in, and travel to, Miami from Sao Paulo make it a high-risk location for a secondary outbreak
          </p>
        </div>
      </div>

      <p className="bluedot-sr-only">
        Yellow Fever totals: 1,285 cases reported, 1,301 suspected, 1,261 confirmed, and 408 deaths.
      </p>
    </section>
  );
}
