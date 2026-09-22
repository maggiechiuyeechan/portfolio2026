import { useState, type CSSProperties } from "react";
import slides from "./native-slides.json";
import PresentationGallery from "./PresentationGallery";
import "./AnthropicXMaggieTypography.css";

type Segment = { text: string; style: number; list: { type: string } };
type Bounds = { x: number; y: number; w: number; h: number; radius?: number };
type Layer = {
  id: string; name: string; kind: string; x: number; y: number; w: number; h: number;
  fill?: string | null; radius?: number; radiusTop?: number; src?: string; align?: string;
  fillToken?: string; clip?: boolean; textCase?: string; elevation?: number; borderElevation?: number;
  playbackRate?: number;
  poster?: string;
  preserveAspectRatio?: boolean;
  fit?: CSSProperties["objectFit"];
  cropTransform?: [[number, number, number], [number, number, number]];
  shadowClip?: Bounds;
  segments?: Segment[]; children?: Layer[]; items?: { src: string; label: string }[];
};
const paints = ["#000000","#838383","#c6d3ca","#dedbd5","#202020","#b0b0a6","#e2e2e2","#9b8484","#a7aebe","#ffffff","#dedbd7","#cdd4d5","#525252","#e7e7e7","#828783","#2b2b2b","#30a46c","#8d8d8d","#f2fcf5","#f76808","#655d41","#d3ccbf","#c5bfb9"];
const stage = { x: 0, y: 0, w: 1728, h: 1117 };
const box = (n: Layer, parent = stage): CSSProperties => ({
  position: "absolute", left: (n.x - parent.x) / parent.w * 100 + "%", top: (n.y - parent.y) / parent.h * 100 + "%",
  width: n.w / parent.w * 100 + "%", height: n.h / parent.h * 100 + "%",
});
const mediaShadow = (n: Layer) => n.borderElevation
  ? `var(--elevation-border-${n.borderElevation})`
  : n.elevation ? `var(--elevation-${n.elevation})` : undefined;

function InteractiveDemo({ layer, parent }: { layer: Layer; parent: typeof stage }) {
  const [loaded, setLoaded] = useState(false);
  const borderRadius = (layer.radius || 0) / 1728 * 100 + "cqw";

  return <div data-figma-node={layer.id}
    style={{
      ...box(layer, parent),
      overflow: "hidden",
      borderRadius,
      boxShadow: mediaShadow(layer),
      background: layer.poster ? `#262626 url(${layer.poster}) center / cover no-repeat` : "#262626",
    }}>
    <iframe
      src={layer.src}
      title={layer.name || "Interactive presentation demo"}
      allow="clipboard-write"
      onLoad={(event) => {
        const frameWindow = event.currentTarget.contentWindow;
        const schedule = frameWindow?.requestAnimationFrame.bind(frameWindow) ?? window.requestAnimationFrame.bind(window);
        schedule(() => schedule(() => setLoaded(true)));
      }}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background: "#262626",
        opacity: loaded ? 1 : 0,
        transition: "opacity 100ms linear",
      }}
    />
  </div>;
}

function renderLayer(n: Layer, parent = stage): React.ReactNode {
  if (n.kind === "text") {
    const segments = n.segments!;
    return <div key={n.id} data-figma-node={n.id}
      className={`axm-native-text axm-native-type-${segments[0].style}`}
      style={{ ...box(n, parent), textAlign: n.align?.toLowerCase() as CSSProperties["textAlign"], textTransform: n.textCase === "UPPER" ? "uppercase" : undefined, height: "auto" }}>
      {segments.map((s, i) => s.list.type === "UNORDERED"
        ? <ul key={i}>{s.text.split("\n").filter(Boolean).map((line, lineIndex) =>
            <li key={lineIndex} className={`axm-native-type-${s.style}`}>{line}</li>)}</ul>
        : <span key={i} className={`axm-native-type-${s.style}`}>{s.text.replace(/\u2028/g, "\n")}</span>)}
    </div>;
  }
  if (n.kind === "gallery") return <div key={n.id} style={{position:"absolute",left:0,top:n.y/1117*100+"%",width:"100%"}}><PresentationGallery items={n.items!} /></div>;
  if (n.kind === "iframe") return <InteractiveDemo key={n.id} layer={n} parent={parent} />;
  if ((n.kind === "image" || n.kind === "video") && n.shadowClip) {
    const clip = n.shadowClip;
    const unclipped = { ...n, shadowClip: undefined };
    return <div key={`${n.id}-shadow-clip`} style={{...box({...n, ...clip}, parent), overflow:"hidden", borderRadius:(clip.radius ?? 16)/1728*100+"cqw"}}>
      {renderLayer(unclipped, clip)}
    </div>;
  }
  if (n.kind === "video") {
    const crop = n.cropTransform;
    if (crop) {
      const scaleX = crop[0][0];
      const translateX = crop[0][2];
      const scaleY = crop[1][1];
      const translateY = crop[1][2];
      const borderRadius = n.radiusTop !== undefined
        ? `${n.radiusTop/1728*100}cqw ${n.radiusTop/1728*100}cqw 0 0`
        : (n.radius||0)/1728*100+"cqw";
      return <div key={n.id} data-figma-node={n.id} style={{...box(n, parent), overflow:"hidden", borderRadius, boxShadow:mediaShadow(n)}} className="axm-native-video-crop">
        <video src={n.src} aria-label={n.name || "Presentation video"} autoPlay loop muted playsInline preload="metadata"
          onLoadedMetadata={(event) => { event.currentTarget.playbackRate = n.playbackRate ?? 1; }}
          style={n.preserveAspectRatio
            ? { position:"absolute", top:0, left:0, display:"block", width:"100%", height:"auto", maxWidth:"none", maxHeight:"none" }
            : { position:"absolute", display:"block", maxWidth:"none", width:100/scaleX+"%", height:100/scaleY+"%", left:-translateX/scaleX*100+"%", top:-translateY/scaleY*100+"%", objectFit:"fill" }} className="axm-native-video" />
      </div>;
    }
    return <video key={n.id} data-figma-node={n.id} src={n.src} aria-label={n.name || "Presentation video"}
      autoPlay loop muted playsInline preload="metadata"
      onLoadedMetadata={(event) => { event.currentTarget.playbackRate = n.playbackRate ?? 1; }}
      style={{...box(n, parent), display:"block", objectFit:n.fit || "cover", objectPosition:"center", borderRadius:(n.radius||0)/1728*100+"cqw", boxShadow:mediaShadow(n)}} className="axm-native-video" />;
  }
  if (n.kind === "image") {
    const crop = n.cropTransform;
    if (crop) {
      const scaleX = crop[0][0];
      const translateX = crop[0][2];
      const scaleY = crop[1][1];
      const translateY = crop[1][2];
      return <div key={n.id} data-figma-node={n.id} style={{...box(n, parent), overflow:"hidden", borderRadius:(n.radius||0)/1728*100+"cqw", boxShadow:mediaShadow(n)}}>
        <img src={n.src} alt={n.name} style={{position:"absolute", display:"block", maxWidth:"none", width:100/scaleX+"%", height:100/scaleY+"%", left:-translateX/scaleX*100+"%", top:-translateY/scaleY*100+"%", objectFit:"fill"}} className="axm-native-image" />
      </div>;
    }
    return <img key={n.id} data-figma-node={n.id} src={n.src} alt={n.name} style={{...box(n, parent), height:n.preserveAspectRatio ? "auto" : box(n, parent).height, borderRadius:n.src?.endsWith(".png") ? "var(--presentation-radius-image)" : (n.radius||0)/1728*100+"cqw", boxShadow:mediaShadow(n)}} className="axm-native-image" />;
  }
  if (n.clip) return <div key={n.id} data-figma-node={n.id} style={{...box(n,parent), overflow:"hidden", borderRadius:(n.radius||0)/1728*100+"cqw"}}>{n.children?.map(child => renderLayer(child,n))}</div>;
  const isColoredContainer = parent === stage && n.w >= 900 && n.h >= 500 && Boolean(n.fill || n.fillToken);
  return <div key={n.id} style={{display:"contents"}}>
    {(n.fill || n.fillToken) && <div data-figma-node={n.id} style={{...box(n,parent),background:n.fillToken ? `var(${n.fillToken})` : `var(--presentation-paint-${paints.indexOf(n.fill!)})`,borderRadius:(isColoredContainer ? 16 : n.radius||0)/1728*100+"cqw",boxShadow:(n.elevation || n.borderElevation || isColoredContainer) ? mediaShadow(n) : undefined}} />}
    {n.children?.map(child => renderLayer(child,parent))}
  </div>;
}

export default function NativeSlide({ number }: { number: number }) {
  const slide = slides.find(s => s.number === number);
  return <div className="axm-native-slide">{(slide?.layers as Layer[] | undefined)?.map(layer => renderLayer(layer))}</div>;
}
