/**
 * Hero avatar in a rounded frame.
 */
import { motion } from "motion/react";

interface Props {
  src: string;
  alt: string;
  variants?: Record<string, unknown>;
}

const FRAME_RADIUS = "3.5rem";

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

const isVideoSrc = (src: string) => /\.(mp4|webm|mov)(\?|$)/i.test(src);

export default function HeroAvatar({ src, alt, variants }: Props) {
  const mediaSrc = encodeURI(src);

  return (
    <motion.div className="hero-avatar-entrance" variants={variants}>
      <div className="hero-avatar-frame" style={frameStyle}>
        {isVideoSrc(src) ? (
          <video
            className="hero-avatar"
            src={mediaSrc}
            aria-label={alt}
            width={720}
            height={1280}
            style={imageStyle}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            className="hero-avatar"
            src={mediaSrc}
            alt={alt}
            width={200}
            height={250}
            style={imageStyle}
            draggable={false}
          />
        )}
      </div>
    </motion.div>
  );
}
