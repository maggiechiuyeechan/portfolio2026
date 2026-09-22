import { motion } from "motion/react";
import PresentationArrow from "./PresentationArrow";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import UberEPaletteDemo from "../work/UberEPaletteDemo";
import UberVehicleDashboardDemo from "../work/UberVehicleDashboardDemo";

export type PresentationGalleryItem = {
  src: string;
  label: string;
  media?: "uber-dashboard" | "uber-epalette" | "video";
  elevation?: boolean;
  borderElevation?: boolean;
};

type PresentationGalleryProps = {
  items: PresentationGalleryItem[];
  alignment?: "start" | "center";
};

const galleryTransition = { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] as const };
const galleryIntervalMs = 3000;

export default function PresentationGallery({ items, alignment = "center" }: PresentationGalleryProps) {
  const [active, setActive] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [trackX, setTrackX] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const item = items[active];

  useEffect(() => {
    if (items.length < 2 || isTimerPaused) return;
    const timer = window.setTimeout(() => {
      setHasNavigated(true);
      setActive(value => (value + 1) % items.length);
    }, galleryIntervalMs);
    return () => window.clearTimeout(timer);
  }, [active, isTimerPaused, items.length]);

  const measureTrack = useCallback(() => {
    const viewport = viewportRef.current;
    const activeItem = itemRefs.current[active];
    if (!viewport || !activeItem) return;

    const leftInset = alignment === "center"
      ? (viewport.clientWidth - activeItem.offsetWidth) / 2
      : viewport.clientWidth * (64 / 1728);
    setTrackX(leftInset - activeItem.offsetLeft);
  }, [active, alignment]);

  useLayoutEffect(() => {
    measureTrack();
    const observer = new ResizeObserver(measureTrack);
    if (viewportRef.current) observer.observe(viewportRef.current);
    itemRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [items, measureTrack]);

  const move = (direction: number) => {
    setIsTimerPaused(true);
    setHasNavigated(true);
    setActive((value) => (value + direction + items.length) % items.length);
  };

  return (
    <div className="axm-gallery-component">
      <div className="axm-gallery-viewport" ref={viewportRef} aria-live="polite">
        <motion.div
          className="axm-gallery-track"
          initial={false}
          animate={{ x: trackX }}
          transition={hasNavigated ? galleryTransition : { duration: 0 }}
        >
          {items.map((galleryItem, index) => (
            <figure
              className={`axm-gallery-item${index === active ? " axm-gallery-item--active" : ""}${galleryItem.media === "uber-dashboard" ? " axm-gallery-item--uber-dashboard" : ""}${galleryItem.media === "uber-epalette" ? " axm-gallery-item--uber-epalette" : ""}${galleryItem.elevation === false ? " axm-gallery-item--flat" : ""}${galleryItem.borderElevation === false ? " axm-gallery-item--no-border-elevation" : ""}`}
              key={galleryItem.src}
              ref={(node) => { itemRefs.current[index] = node; }}
              aria-hidden={index !== active}
            >
              {galleryItem.media === "uber-dashboard" ? (
                <UberVehicleDashboardDemo />
              ) : galleryItem.media === "uber-epalette" ? (
                <UberEPaletteDemo autoPlay />
              ) : galleryItem.media === "video" ? (
                <video
                  src={galleryItem.src}
                  aria-label={galleryItem.label}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                />
              ) : (
                <img src={galleryItem.src} alt={galleryItem.label} loading={index === 0 ? "eager" : "lazy"} />
              )}
            </figure>
          ))}
        </motion.div>
      </div>
      <div className="axm-gallery-meta">
        <span key={active} className={`axm-gallery-timer-caption${isTimerPaused ? " axm-gallery-timer-caption--paused" : ""}`} aria-live="polite">
          {String(active + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}: {item.label}
        </span>
        <div className="axm-gallery-switcher-buttons">
          <PresentationArrow direction="previous" onClick={() => move(-1)} aria-label="Previous gallery image" />
          <PresentationArrow direction="next" onClick={() => move(1)} aria-label="Next gallery image" />
        </div>
      </div>
    </div>
  );
}
