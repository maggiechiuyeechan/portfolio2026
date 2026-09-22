import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

type Page = { number: number; name: string; previewNumber?: number; previewSrc?: string };

export default function PageNavigator({ pages, index, onSelect }: {
  pages: Page[]; index: number; onSelect: (index: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [previewX, setPreviewX] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  function preview(pageIndex: number, button: HTMLButtonElement) {
    const nav = navRef.current;
    if (!nav) return;
    const bounds = button.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    const scale = parseFloat(getComputedStyle(nav).getPropertyValue("--presentation-scale")) || 1;
    const halfWidth = Math.min(260, window.innerWidth - 24) * scale / 2;
    const center = Math.max(halfWidth + 12, Math.min(window.innerWidth - halfWidth - 12, bounds.x + bounds.width / 2));
    setPreviewX((center - navBounds.x) / scale);
    setHovered(pageIndex);
  }

  return <nav ref={navRef} className="axm-controls" aria-label="Presentation navigation"
    onPointerLeave={() => setHovered(null)}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(null); }}
    onKeyDown={event => { if (event.key === "Escape") setHovered(null); }}>
    <AnimatePresence>
      {hovered !== null && <motion.div className="axm-page-preview" aria-hidden="true"
        style={{ left: previewX }}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 8, scale: reducedMotion ? 1 : .94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : .16 }}>
        <img key={pages[hovered].number} src={pages[hovered].previewSrc ?? `/anthropicxmaggie/previews/slide-${String(hovered + 1).padStart(2, "0")}.png`} alt="" />
        <span className="text-caption">{String(hovered + 1).padStart(2, "0")} · {pages[hovered].name}</span>
      </motion.div>}
    </AnimatePresence>
    <span className="axm-page-number">{String(index + 1).padStart(2, "0")}/{pages.length}</span>
    <div className="axm-page-ticks" onPointerLeave={() => setHovered(null)}>
      {pages.map((p, i) => {
        const influence = hovered === i ? 1 : 0;
        return <button key={p.number} type="button" className="axm-page-tick"
          aria-label={`Go to page ${i + 1}: ${p.name}`} aria-current={i === index ? "page" : undefined}
          onPointerEnter={event => { if (event.pointerType !== "touch") preview(i, event.currentTarget); }}
          onFocus={event => preview(i, event.currentTarget)}
          onClick={() => onSelect(i)}>
          <motion.span className="axm-page-tick-mark" aria-hidden="true"
            animate={{ scaleX: 1 + influence * 2, scaleY: 1 + influence * 2.5, y: -influence * 5 }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 28 }} />
        </button>;
      })}
    </div>
  </nav>;
}
