import type { ButtonHTMLAttributes } from "react";
import "./PresentationArrow.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  direction: "previous" | "next";
};

/** Figma Component 1 / Component 2: default, hover, pressed. */
export default function PresentationArrow({ direction, className = "", ...props }: Props) {
  return (
    <button {...props} type="button" className={`axm-arrow axm-arrow--${direction} ${className}`}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={direction === "previous" ? "M 10 12 L 6 8 L 10 4" : "M 6 12 L 10 8 L 6 4"}
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
