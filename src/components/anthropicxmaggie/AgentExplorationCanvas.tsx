import { useCallback, useEffect, useRef, useState } from "react";

const width = 2737, height = 2100;
const screens = [
  { id: "393-73661", x: 204.5835, y: 226, w: 690.348, h: 508.173, label: "Review details before creating" },
  { id: "393-73966", x: 1690, y: 226, w: 690.348, h: 508.173, label: "Full page edit" },
  { id: "393-74565", x: 205, y: 824, w: 690.348, h: 508.173, label: "Step-by-step wizard setup" },
  { id: "393-74991", x: 965, y: 1427, w: 531, h: 464, label: "Build and test sidebar" },
  { id: "393-78417", x: 965, y: 826, w: 686.802, h: 505.563, label: "Agent profile exploration" },
  { id: "393-78877", x: 965, y: 226, w: 654.847, h: 504.132, label: "Profile/agents in chats/channels" },
  { id: "393-79387", x: 205, y: 1422, w: 688.746, h: 506.994, label: "Agent metrics" },
  { id: "393-79763", x: 1568, y: 1416, w: 690.348, h: 508.173, label: "Setup as a sidebar/chat with agent as a sidebar" },
  { id: "393-80010", x: 1732, y: 826, w: 690.348, h: 508.173, label: "Agent workflow visualisation" },
];
type View = { x: number; y: number; scale: number };
export default function AgentExplorationCanvas() {
  const viewport = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: .5 });
  const viewRef = useRef(view);
  const drag = useRef<{ x: number; y: number; origin: View } | null>(null);
  const [dragging, setDragging] = useState(false);
  const update = useCallback((next: View) => { viewRef.current = next; setView(next); }, []);
  const fit = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const scale = Math.min(el.clientWidth / width, el.clientHeight / height);
    update({ x: (el.clientWidth - width * scale) / 2, y: (el.clientHeight - height * scale) / 2, scale });
  }, [update]);
  const zoom = useCallback((factor: number, px?: number, py?: number) => {
    const el = viewport.current;
    if (!el) return;
    const old = viewRef.current;
    const scale = Math.max(.15, Math.min(3, old.scale * factor));
    const x = px ?? el.clientWidth / 2, y = py ?? el.clientHeight / 2;
    update({ scale, x: x - (x - old.x) * scale / old.scale, y: y - (y - old.y) * scale / old.scale });
  }, [update]);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const centerDefault = () => update({ x: (el.clientWidth - width * .5) / 2, y: (el.clientHeight - height * .5) / 2, scale: .5 });
    centerDefault();
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const sensitivity = event.ctrlKey ? .01 : .002;
      zoom(Math.exp(-event.deltaY * sensitivity), (event.clientX - rect.left) * el.clientWidth / rect.width, (event.clientY - rect.top) * el.clientHeight / rect.height);
    };
    el.addEventListener("wheel", wheel, { passive: false });
    const resize = new ResizeObserver(centerDefault); resize.observe(el);
    return () => { el.removeEventListener("wheel", wheel); resize.disconnect(); };
  }, [update, zoom]);
  return <div className="axm-exploration">
    <h1>Design explorations</h1>
    <div ref={viewport} className={`axm-exploration-viewport${dragging ? " is-dragging" : ""}`} role="region" aria-label="Agent design exploration canvas" tabIndex={0}
      onKeyDown={event => {
        if (["+", "=", "-", "0", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
          event.preventDefault(); event.stopPropagation();
          if (event.key === "0") fit();
          else if (event.key === "+" || event.key === "=") zoom(1.2);
          else if (event.key === "-") zoom(1 / 1.2);
          else update({ ...viewRef.current, x: viewRef.current.x + (event.key === "ArrowLeft" ? 40 : event.key === "ArrowRight" ? -40 : 0), y: viewRef.current.y + (event.key === "ArrowUp" ? 40 : event.key === "ArrowDown" ? -40 : 0) });
        }
      }}
      onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY, origin: viewRef.current }; setDragging(true); }}
      onPointerMove={event => { if (!drag.current) return; const el = event.currentTarget, rect = el.getBoundingClientRect(); const start = drag.current; update({ ...start.origin, x: start.origin.x + (event.clientX - start.x) * el.clientWidth / rect.width, y: start.origin.y + (event.clientY - start.y) * el.clientHeight / rect.height }); }}
      onPointerUp={() => { drag.current = null; setDragging(false); }} onPointerCancel={() => { drag.current = null; setDragging(false); }} onLostPointerCapture={() => { drag.current = null; setDragging(false); }}>
      <div className="axm-exploration-world" style={{ width, height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
        {screens.map(screen => <figure key={screen.id} style={{ left: screen.x, top: screen.y, width: screen.w, height: screen.h }}>
          <figcaption>{screen.label}</figcaption>
          <img src={`/anthropicxmaggie/agent-canvas/${screen.id}.png`} alt={screen.label} draggable={false} width={screen.w} height={screen.h} />
        </figure>)}
      </div>
    </div>
  </div>;
}
