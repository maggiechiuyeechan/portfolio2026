import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../lib/motion";
import ErrorBoundary from "../ErrorBoundary";
import type { ClickUpFourDemoProps } from "./clickupFourDemoShared";
import { CYCLE_MS } from "./clickupFourDemoShared";
import ClickUpFourTasksDemo from "./ClickUpFourTasksDemo";
import ClickUpFourDocsDemo from "./ClickUpFourDocsDemo";
import ClickUpFourWhiteboardsDemo from "./ClickUpFourWhiteboardsDemo";
import ClickUpFourCalendarDemo from "./ClickUpFourCalendarDemo";
import "./ClickUpFourCarousel.css";

type Slide = {
  label: string;
  Demo: (props: ClickUpFourDemoProps) => React.ReactNode;
};

const SLIDES: Slide[] = [
  { label: "Tasks", Demo: ClickUpFourTasksDemo },
  { label: "Docs", Demo: ClickUpFourDocsDemo },
  { label: "Whiteboards", Demo: ClickUpFourWhiteboardsDemo },
  { label: "Calendar", Demo: ClickUpFourCalendarDemo },
];

interface Props {
  title: string;
  meta?: string;
  subtitle: string;
}

export default function ClickUpFourCarousel({ title, meta, subtitle }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const remainingMsRef = useRef(CYCLE_MS);
  const startedAtRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "120px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    remainingMsRef.current = CYCLE_MS;
    startedAtRef.current = null;
  }, [activeIndex, cycleKey]);

  useEffect(() => {
    if (reducedMotion || !visible) return;
    startedAtRef.current = performance.now();
    const timer = window.setTimeout(() => {
      remainingMsRef.current = CYCLE_MS;
      startedAtRef.current = null;
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, remainingMsRef.current);
    return () => {
      window.clearTimeout(timer);
      if (startedAtRef.current !== null) {
        remainingMsRef.current = Math.max(
          0,
          remainingMsRef.current - (performance.now() - startedAtRef.current),
        );
        startedAtRef.current = null;
      }
    };
  }, [activeIndex, cycleKey, reducedMotion, visible]);

  const selectSlide = (index: number) => {
    setActiveIndex(index);
    setCycleKey((key) => key + 1);
  };

  const moveTabFocus = (index: number) => {
    selectSlide(index);
    document.getElementById(`cu4-tab-${index}`)?.focus();
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = (activeIndex + 1) % SLIDES.length;
    if (event.key === "ArrowLeft") nextIndex = (activeIndex - 1 + SLIDES.length) % SLIDES.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = SLIDES.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    moveTabFocus(nextIndex);
  };

  return (
    <div
      ref={rootRef}
      className={`cu4-carousel${!visible ? " is-cycle-paused" : ""}`}
      style={{ "--cu4-cycle-ms": `${CYCLE_MS}ms` } as React.CSSProperties}
    >
      <div className="study-text cu4-carousel-text">
        <div className="study-text-inner">
          <h2 className="text-heading study-title">
            {title}
            {meta && <span className="study-meta">{meta}</span>}
          </h2>
          <p className="text-body">{subtitle}</p>
        </div>

        <div className="cu4-carousel-tabs" role="tablist" aria-label="ClickUp 4.0 interface">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              role="tab"
              id={`cu4-tab-${index}`}
              aria-controls={`cu4-panel-${index}`}
              aria-selected={activeIndex === index}
              tabIndex={activeIndex === index ? 0 : -1}
              data-cuelume-hover="tick"
              data-cuelume-press
              data-cuelume-release
              className="text-body"
              onClick={() => selectSlide(index)}
              onKeyDown={handleTabKeyDown}
            >
              <span className="cu4-tab-label">{slide.label}</span>
              {activeIndex === index && (
                <span key={cycleKey} className="cu4-tab-progress" aria-hidden="true">
                  {slide.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="cu4-carousel-images">
        {SLIDES.map((slide, index) => {
          const active = activeIndex === index;
          return (
            <div
              key={slide.label}
              id={`cu4-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`cu4-tab-${index}`}
              aria-hidden={!active}
              /*
               * `inert` alongside aria-hidden. The demos contain no focusable
               * nodes today, so this is belt-and-braces — but "an aria-hidden
               * subtree containing a focusable element" is a spec violation,
               * and these panels are one <button> away from being one.
               */
              inert={!active}
              className={`cu4-panel${active ? " is-active" : ""}`}
            >
              {/*
                One failed demo shouldn't take the other three and the case
                study copy with it. Keyed by label, so it resets on remount.
              */}
              <ErrorBoundary label={`clickup-4.0 slide: ${slide.label}`}>
                <slide.Demo
                  active={active}
                  paused={!visible}
                  reducedMotion={reducedMotion}
                />
              </ErrorBoundary>
            </div>
          );
        })}
      </div>
    </div>
  );
}
