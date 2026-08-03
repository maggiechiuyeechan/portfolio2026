import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../lib/motion";
import HeadspaceReflectionDemo from "./HeadspaceReflectionDemo";
import "./HeadspaceHeroDemo.css";

import heroInitial from "../../assets/headspace-demo/hero-initial.png";
import heroOutdoors from "../../assets/headspace-demo/hero-outdoors.png";
import heroZoned from "../../assets/headspace-demo/hero-zoned.png";
import backButton from "../../assets/headspace-demo/back-button.svg";
import chevron from "../../assets/headspace-demo/chevron.svg";
import iconSpeaker from "../../assets/headspace-demo/icon-speaker.png";
import iconHeart from "../../assets/headspace-demo/icon-heart.png";
import fpTop from "../../assets/headspace-demo/fp-top.png";
import fpCardHero from "../../assets/headspace-demo/fp-card-hero.png";
import fpLowerBg from "../../assets/headspace-demo/fp-lower-bg.png";
import fpGroup7 from "../../assets/headspace-demo/fp-group7.png";
import fpDaily from "../../assets/headspace-demo/fp-daily.png";
import fpLeft from "../../assets/headspace-demo/fp-left.png";
import fpBottom from "../../assets/headspace-demo/fp-bottom.png";

type DemoStep =
  | "initial"
  | "location-open"
  | "location-selected"
  | "mood-open"
  | "mood-selected"
  | "note-typing"
  | "saving"
  | "front-page"
  | "post-revealed";

const NOTE_TEXT = "Finding my OM at Golden Gate Park";
const TYPE_INTERVAL_MS = 55;

/** Dwell time for each step before advancing (typing advances on completion). */
const STEP_DURATIONS: Record<DemoStep, number> = {
  initial: 1600,
  "location-open": 1400,
  "location-selected": 1500,
  "mood-open": 1400,
  "mood-selected": 1500,
  "note-typing": 0,
  saving: 900,
  "front-page": 250,
  "post-revealed": 3600,
};

const STEP_ORDER: DemoStep[] = [
  "initial",
  "location-open",
  "location-selected",
  "mood-open",
  "mood-selected",
  "note-typing",
  "saving",
  "front-page",
  "post-revealed",
];

function Chevron({ left, top }: { left: number; top: number }) {
  return (
    <img
      className="hsd-chevron"
      src={chevron.src}
      width="8"
      height="5"
      alt=""
      style={{ left, top }}
    />
  );
}

function FormScreen({ step, typedCount }: { step: DemoStep; typedCount: number }) {
  const locationOpen = step === "location-open";
  const locationSelected = STEP_ORDER.indexOf(step) >= STEP_ORDER.indexOf("location-selected");
  const moodOpen = step === "mood-open";
  const moodSelected = STEP_ORDER.indexOf(step) >= STEP_ORDER.indexOf("mood-selected");
  const typed = NOTE_TEXT.slice(0, typedCount);
  const typing = step === "note-typing" && typedCount < NOTE_TEXT.length;

  const hero = moodSelected ? heroZoned : locationSelected ? heroOutdoors : heroInitial;

  return (
    <div className="hsd-screen hsd-form" aria-hidden="true">
      {/* Hero illustration — exported from Figma per selection state */}
      <div className="hsd-hero">
        <img
          src={heroInitial.src}
          className={hero === heroInitial ? "is-active" : ""}
          alt=""
        />
        <img
          src={heroOutdoors.src}
          className={hero === heroOutdoors ? "is-active" : ""}
          alt=""
        />
        <img src={heroZoned.src} className={hero === heroZoned ? "is-active" : ""} alt="" />
      </div>
      <img className="hsd-back" src={backButton.src} width="56" height="58" alt="" />

      <p className="hsd-title">Weekend visualisation</p>
      <img className="hsd-heart" src={iconHeart.src} width="45" height="31" alt="" />
      <img className="hsd-speaker" src={iconSpeaker.src} width="24" height="24" alt="" />
      <p className="hsd-meta">
        Mindful activity <span className="hsd-meta-dot" /> 1 min
      </p>
      <p className="hsd-desc">Take a moment to reflect on what you want your weekend to look like</p>

      <div className="hsd-divider" />
      <p className="hsd-section-title">This weekend, I want to be</p>

      {/* Partner pill (never changes) */}
      <div className="hsd-pill hsd-pill-partner">
        <span>by myself</span>
      </div>
      <Chevron left={366} top={545} />

      {/* Mood pill / dropdown */}
      <div
        className={`hsd-dropdown hsd-dropdown-mood ${moodOpen ? "is-open" : ""}`}
        style={{ height: moodOpen ? 198 : 46 }}
      >
        <div className="hsd-dropdown-highlight" style={{ opacity: moodOpen ? 1 : 0 }} />
        <div className="hsd-dropdown-row hsd-mood-row-0">
          <span className="hsd-option-swap">
            <span className={moodSelected ? "is-hidden" : ""}>feeling happy</span>
            <span className={moodSelected ? "" : "is-hidden"}>zoned out</span>
          </span>
        </div>
        <div className="hsd-dropdown-row hsd-mood-row-1">being active</div>
        <div className={`hsd-dropdown-row hsd-mood-row-2 ${step === "mood-open" ? "hsd-tap-target" : ""}`}>
          zoned out
        </div>
        <div className="hsd-dropdown-row hsd-mood-row-3">socializing</div>
      </div>
      <Chevron left={366} top={605.5} />

      {/* Location pill / dropdown (rendered after mood so it stacks above) */}
      <div
        className={`hsd-dropdown hsd-dropdown-location ${locationOpen ? "is-open" : ""}`}
        style={{ height: locationOpen ? 140 : 46 }}
      >
        <div className="hsd-dropdown-highlight" style={{ opacity: locationOpen ? 1 : 0 }} />
        <div className="hsd-dropdown-row hsd-loc-row-0">
          <span className="hsd-option-swap">
            <span className={locationSelected ? "is-hidden" : ""}>at home</span>
            <span className={locationSelected ? "" : "is-hidden"}>outdoors</span>
          </span>
        </div>
        <div className="hsd-dropdown-row hsd-loc-row-1">in the city</div>
        <div className={`hsd-dropdown-row hsd-loc-row-2 ${step === "location-open" ? "hsd-tap-target" : ""}`}>
          outdoors
        </div>
      </div>
      <Chevron left={176.5} top={545} />

      {/* Note field */}
      <p className={`hsd-note ${typedCount > 0 ? "is-filled" : ""}`}>
        {typedCount > 0 ? typed : "Write a note to yourself for the weekend"}
        {typing && <span className="hsd-caret" />}
      </p>
      <div className="hsd-note-line" />

      {/* Save button */}
      <div className={`hsd-save ${step === "saving" ? "is-pressed" : ""}`}>
        <span>Save visualisation</span>
      </div>
    </div>
  );
}

function FrontPage({ revealed }: { revealed: boolean }) {
  return (
    <div className="hsd-screen hsd-front" aria-hidden="true">
      <img className="hsd-fp-top" src={fpTop.src} alt="" />
      <p className="hsd-fp-greeting">Happy Friday, Maggie!</p>

      <img className="hsd-fp-lower" src={fpLowerBg.src} alt="" />
      <div className="hsd-fp-list-pill" />
      <p className="hsd-fp-list-title">Weekend visualisation</p>
      <img className="hsd-fp-group7" src={fpGroup7.src} alt="" />
      <img className="hsd-fp-daily" src={fpDaily.src} alt="" />
      <img className="hsd-fp-left" src={fpLeft.src} alt="" />

      <div className="hsd-fp-divider" />
      <p className="hsd-fp-section">Start your day</p>

      {/* Newly created visualization post */}
      <div className={`hsd-fp-card ${revealed ? "is-revealed" : ""}`}>
        <p className="hsd-fp-card-title">Your weekend visualisation</p>
        <img className="hsd-fp-card-hero" src={fpCardHero.src} alt="" />
        <div className="hsd-fp-note-chip">
          <p>Finding my OM at Golden Gate Park</p>
        </div>
      </div>

      <img className="hsd-fp-bottom" src={fpBottom.src} alt="" />
    </div>
  );
}

export default function HeadspaceHeroDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState<DemoStep>("initial");
  const [typedCount, setTypedCount] = useState(0);
  const [completedLoops, setCompletedLoops] = useState(0);
  const [looping, setLooping] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setStep("post-revealed");
      setTypedCount(NOTE_TEXT.length);
      return;
    }
    if (!running) return;

    if (step === "note-typing") {
      if (typedCount >= NOTE_TEXT.length) {
        const hold = window.setTimeout(() => setStep("saving"), 1000);
        return () => window.clearTimeout(hold);
      }
      const t = window.setTimeout(() => setTypedCount((count) => count + 1), TYPE_INTERVAL_MS);
      return () => window.clearTimeout(t);
    }

    const index = STEP_ORDER.indexOf(step);
    const next = STEP_ORDER[(index + 1) % STEP_ORDER.length];
    const t = window.setTimeout(() => {
      if (next === "initial") {
        setTypedCount(0);
        setCompletedLoops((count) => count + 1);
        setLooping(true);
      }
      setStep(next);
    }, STEP_DURATIONS[step]);
    return () => window.clearTimeout(t);
  }, [running, reducedMotion, step, typedCount]);

  useEffect(() => {
    if (!looping) return;
    const timer = window.setTimeout(() => setLooping(false), 850);
    return () => window.clearTimeout(timer);
  }, [looping]);

  const onFrontPage = step === "front-page" || step === "post-revealed" || looping;

  return (
    <div
      ref={rootRef}
      className="headspace-hero-demo study-image"
      role="img"
      aria-label="Headspace weekend visualisation flow: choosing to spend the weekend outdoors and zoned out, writing the note 'Finding my OM at Golden Gate Park', saving, and seeing the visualisation posted to the Headspace home feed"
    >
      {/* Each phone scales in its own viewBox so the pair can stack on narrow
          screens. The 16px of bleed on the facing edge carries the phones'
          drop shadows into the gap, keeping the desktop composition 860 wide. */}
      <div className="hsd-stage">
        <svg className="hsd-viewport is-left" viewBox="0 0 430 816">
          <foreignObject width="430" height="816">
            <div className="hsd-pane">
              <HeadspaceReflectionDemo live={running || reducedMotion} />
            </div>
          </foreignObject>
        </svg>
        <svg className="hsd-viewport is-right" viewBox="0 0 430 816">
          <foreignObject width="430" height="816">
            <div className="hsd-pane is-end">
              <div className="hsd-phone">
                <div
                  className={`hsd-form-wrap${
                    step === "initial" && completedLoops > 0 ? " is-loop-entering" : ""
                  }`}
                >
                  <FormScreen step={step} typedCount={typedCount} />
                </div>
                <div className={`hsd-front-wrap ${onFrontPage ? "is-visible" : ""}`}>
                  <FrontPage revealed={step === "post-revealed"} />
                </div>
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}
