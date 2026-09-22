import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const companies = [
  ["clickup", "ClickUp"], ["nuffsaid", "Nuffsaid"], ["uber", "Uber"],
  ["headspace", "Headspace"], ["bloomberg", "Bloomberg"],
];
const slots = Array.from({ length: 15 }, (_, i) => i - 5);
const units = (value: number) => `${value / 1728 * 100}cqw`;
const logoOpacityByDistance = [1, .45, .16];

export default function CareerSequence() {
  const [step, setStep] = useState(0);
  const initialCycle = useRef(true);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return;
    // The sixth position is a duplicate of the first, allowing a seamless reset.
    const delay = step === 5 ? 850 : initialCycle.current ? 1100 : 2600;
    const timer = window.setTimeout(() => {
      initialCycle.current = false;
      setStep(step === 5 ? 0 : step + 1);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [step, reducedMotion]);
  const transition = { duration: step === 0 || reducedMotion ? 0 : .8, ease: [.22, 1, .36, 1] as const };

  return <div className="axm-career axm-career-sequence" aria-label="Career experience: ClickUp, Nuffsaid, Uber, Headspace, Bloomberg">
    <div className="axm-career-sequence-logos" aria-hidden="true">
      {slots.map(slot => {
        const [id] = companies[(slot + 5) % 5];
        const distance = Math.abs(slot - step);
        return <motion.div key={slot} className={`axm-career-logo axm-career-logo--${id}`}
          initial={false} transition={transition}
          animate={{ x: units((slot - step) * 160), scale: distance === 0 ? 1.3 : 1, opacity: logoOpacityByDistance[distance] ?? 0 }}>
          <img src={`/anthropicxmaggie/${id}.svg`} alt="" />
        </motion.div>;
      })}
    </div>
    <div className="axm-career-sequence-names" aria-hidden="true">
      {slots.map(slot => <motion.div key={slot} className="axm-career-sequence-name"
        initial={false} transition={transition}
        animate={{ y: units((slot - step) * 42), opacity: slot < step || slot > step + 4 ? 0 : slot === step ? 1 : .4,
          color: slot === step ? "var(--presentation-color-content-default)" : "var(--presentation-color-secondary)" }}>
        {companies[(slot + 5) % 5][1]}
      </motion.div>)}
    </div>
  </div>;
}
