import { useEffect, useRef } from "react";
import "./UberEPaletteDemo.css";

const WIDTHS = [480, 768, 960, 1440, 1920, 2325];
const SIZES = "(max-width: 41.25rem) 100vw, (max-width: 80rem) 78vw, 60rem";

function sourceSet(format: "avif" | "webp") {
  return WIDTHS.map((width) => `/images/casestudies/epalette-${width}.${format} ${width}w`).join(", ");
}

/**
 * How far ahead of the viewport we start buffering the loop. Playback still
 * begins at PLAY_MARGIN — this only decides when bytes start moving, and it
 * needs enough runway that a cold fetch is done before the demo is on screen.
 */
const WARM_MARGIN = "800px";
const PLAY_MARGIN = "100px";

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

    /*
     * The markup ships `preload="none"`, so nothing is fetched during HTML
     * parse. Flipping the property and calling load() here is what actually
     * starts buffering — setting preload alone doesn't re-run resource
     * selection on an element that already decided to fetch nothing.
     *
     * Reduced-motion visitors never play the loop, so they never pay for it.
     */
    const warm = () => {
      if (reducedMotion.matches) return;
      video.preload = "auto";
      video.load();
    };

    const warmObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        warmObserver.disconnect();
        warm();
      },
      { rootMargin: WARM_MARGIN },
    );

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { rootMargin: PLAY_MARGIN },
    );

    warmObserver.observe(root);
    observer.observe(root);
    reducedMotion.addEventListener("change", syncPlayback);
    video.addEventListener("loadedmetadata", syncPlayback);
    return () => {
      warmObserver.disconnect();
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
          {/*
            `preload` must stay "none". Astro server-renders this island, so the
            tag is in the initial HTML and any other value starts the fetch
            during parse — before the observer above has hydrated to say the
            demo isn't on screen. Safari picks the QuickTime source (alpha-
            channel WebM is why both exist), and that file is 28 MB.

            TODO: re-encode uberMobile_alpha.mov at its render size (600x800).
            It is currently ~53x the WebM for the same loop.
          */}
          <video
            ref={videoRef}
            className="uber-epalette-mobile-video"
            width="600"
            height="800"
            muted
            loop
            playsInline
            preload="none"
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
