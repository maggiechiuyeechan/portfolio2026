import { useEffect, useRef } from "react";
import "./UberEPaletteDemo.css";

const WIDTHS = [480, 768, 960, 1440, 1920, 2325];
const SIZES = "(max-width: 41.25rem) 100vw, (max-width: 80rem) 78vw, 60rem";

function sourceSet(format: "avif" | "webp") {
  return WIDTHS.map((width) => `/images/casestudies/epalette-${width}.${format} ${width}w`).join(", ");
}

export default function UberEPaletteDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;

    const syncPlayback = () => {
      if (visible && !reducedMotion.matches) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
        if (reducedMotion.matches && video.readyState > 0) video.currentTime = 0;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { rootMargin: "100px" },
    );

    observer.observe(root);
    reducedMotion.addEventListener("change", syncPlayback);
    video.addEventListener("loadedmetadata", syncPlayback);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", syncPlayback);
      video.removeEventListener("loadedmetadata", syncPlayback);
      video.pause();
    };
  }, []);

  return (
    // The wrapper carries the size container: the frame cannot query itself,
    // and the frame's own layout changes at narrow widths.
    <div className="uber-epalette-container">
      {/* The label lives on the frame, not the img, because the car is hidden
          at narrow widths and would take its alt text out of the a11y tree. */}
      <div
        ref={rootRef}
        className="uber-epalette-demo study-image"
        role="img"
        aria-label="Uber self-driving e-Palette vehicle with the rider app seat selection screen"
      >
        <div className="uber-epalette-composition">
          <picture>
            <source type="image/avif" srcSet={sourceSet("avif")} sizes={SIZES} />
            <source type="image/webp" srcSet={sourceSet("webp")} sizes={SIZES} />
            <img
              src="/images/casestudies/epalette.png"
              width="2325"
              height="1374"
              loading="lazy"
              decoding="async"
              alt=""
            />
          </picture>
          <video
            ref={videoRef}
            className="uber-epalette-mobile-video"
            width="600"
            height="800"
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source src="/images/casestudies/uberMobile_alpha.webm" type="video/webm" />
            <source src="/images/casestudies/uberMobile_alpha.mov" type="video/quicktime" />
          </video>
        </div>
      </div>
    </div>
  );
}
