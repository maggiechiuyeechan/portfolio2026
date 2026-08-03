import { useEffect, useRef, useState } from "react";
import { animate, motion } from "motion/react";
import { usePrefersReducedMotion } from "../../lib/motion";
import flightArrow from "../../assets/bluedot-demo/flight-arrow.svg";
import flightPlane from "../../assets/bluedot-demo/flight-plane.svg";
import flightOriginPin from "../../assets/bluedot-demo/flight-origin-pin.svg";
import flightDivider from "../../assets/bluedot-demo/flight-divider.svg";
import flightDividerLower from "../../assets/bluedot-demo/flight-divider-lower.svg";

type Destination = {
  city: string;
  flights2017: string;
  seats2017: string;
  flights2018: string;
  seats2018: string;
};

const DESTINATIONS: Destination[] = [
  { city: "Toronto", flights2017: "302", seats2017: "27,773", flights2018: "308", seats2018: "33,287" },
  { city: "Paris", flights2017: "244", seats2017: "22,610", flights2018: "257", seats2018: "25,980" },
  { city: "London", flights2017: "218", seats2017: "20,340", flights2018: "231", seats2018: "23,760" },
];

const CITY_HOLD_MS = 3000;

const numberFormatter = new Intl.NumberFormat("en-US");

function AnimatedFlightNumber({
  active,
  delay,
  reducedMotion,
  value,
}: {
  active: boolean;
  delay: number;
  reducedMotion: boolean;
  value: string;
}) {
  const target = Number(value.replaceAll(",", ""));
  const [displayValue, setDisplayValue] = useState(() => (reducedMotion ? value : "0"));

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      setDisplayValue(numberFormatter.format(target));
      return;
    }

    setDisplayValue("0");
    const playback = animate(0, target, {
      delay,
      duration: 0.72,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(numberFormatter.format(Math.round(latest))),
    });
    return () => playback.stop();
  }, [active, delay, reducedMotion, target]);

  return (
    <motion.strong
      initial={reducedMotion ? false : { opacity: 0, y: 3 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }}
      transition={reducedMotion ? { duration: 0 } : { delay, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
    >
      {displayValue}
    </motion.strong>
  );
}

function FlightDetails({
  active,
  destination,
  reducedMotion,
}: {
  active: boolean;
  destination: Destination;
  reducedMotion: boolean;
}) {
  return (
    <div className="bluedot-flight-details">
      <div className="bluedot-flight-detail-year year-2017">2017</div>
      <div className="bluedot-flight-detail-year year-2018">2018 Estimate</div>
      <span className="bluedot-flight-detail-line first" aria-hidden="true" />
      <span className="bluedot-flight-detail-line second" aria-hidden="true" />
      <span className="bluedot-flight-detail-vertical" aria-hidden="true" />
      <div className="bluedot-flight-stat flights old">
        <span># flights</span>
        <AnimatedFlightNumber active={active} delay={0.08} reducedMotion={reducedMotion} value={destination.flights2017} />
      </div>
      <div className="bluedot-flight-stat seats old">
        <span># seats</span>
        <AnimatedFlightNumber active={active} delay={0.2} reducedMotion={reducedMotion} value={destination.seats2017} />
      </div>
      <div className="bluedot-flight-stat flights estimate">
        <span># flights</span>
        <AnimatedFlightNumber active={active} delay={0.14} reducedMotion={reducedMotion} value={destination.flights2018} />
      </div>
      <div className="bluedot-flight-stat seats estimate">
        <span># seats</span>
        <AnimatedFlightNumber active={active} delay={0.26} reducedMotion={reducedMotion} value={destination.seats2018} />
      </div>
    </div>
  );
}

export default function BlueDotFlightEstimateDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = panelRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "100px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setActiveIndex(0);
      return;
    }
    if (!visible) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % DESTINATIONS.length);
    }, CITY_HOLD_MS);
    return () => window.clearInterval(interval);
  }, [reducedMotion, visible]);

  return (
    <section
      ref={panelRef}
      className="bluedot-flight-panel"
      aria-label="Top flight exportation risk estimates from São Paulo"
    >
      <div className="bluedot-panel-noise" aria-hidden="true" />
      <div className="bluedot-flight-card" aria-hidden="true">
        <div className="bluedot-flight-header">
          <img className="plane" src={flightPlane.src} width="9.828" height="9.25" alt="" />
          <span>Top exportation risk</span>
          <img className="origin-pin" src={flightOriginPin.src} width="40.252" height="39.25" alt="" />
          <h3>São Paulo</h3>
        </div>
        <img className="bluedot-flight-header-divider" src={flightDivider.src} width="188.6" height="0.77" alt="" />

        <div className="bluedot-flight-destinations">
          {DESTINATIONS.map((destination, index) => {
            const active = index === activeIndex;
            return (
              <div className={`bluedot-flight-destination${active ? " is-active" : ""}`} key={destination.city}>
                <div className="bluedot-flight-row">
                  <img src={flightArrow.src} width="11.309" height="10.28" alt="" />
                  <span>{destination.city}</span>
                </div>
                <div className="bluedot-flight-detail-clip" aria-hidden={!active}>
                  <FlightDetails active={active} destination={destination} reducedMotion={reducedMotion} />
                </div>
              </div>
            );
          })}
        </div>
        <img className="bluedot-flight-bottom-divider" src={flightDividerLower.src} width="188.13" height="0.77" alt="" />
      </div>

      <p className="bluedot-sr-only">
        São Paulo exportation risk. Toronto: 302 flights and 27,773 seats in 2017; 308 flights and 33,287 seats estimated in 2018. Paris: 244 flights and 22,610 seats in 2017; 257 flights and 25,980 seats estimated in 2018. London: 218 flights and 20,340 seats in 2017; 231 flights and 23,760 seats estimated in 2018.
      </p>
    </section>
  );
}
