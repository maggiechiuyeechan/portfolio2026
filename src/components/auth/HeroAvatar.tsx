/**
 * Hero avatar in a rounded frame.
 */
import { motion } from "motion/react";

interface Props {
  src: string;
  alt: string;
  variants?: Record<string, unknown>;
}

const FRAME_RADIUS = "4.5rem";

const frameStyle: React.CSSProperties = {
  position: "relative",
  flexShrink: 0,
  overflow: "hidden",
  borderRadius: FRAME_RADIUS,
  clipPath: `inset(0 round ${FRAME_RADIUS})`,
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  display: "block",
};

export default function HeroAvatar({ src, alt, variants }: Props) {
  return (
    <motion.div className="hero-avatar-entrance" variants={variants}>
      <div className="hero-avatar-frame" style={frameStyle}>
        <img
          className="hero-avatar"
          src={src}
          alt={alt}
          width={200}
          height={250}
          style={imageStyle}
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
