import "./ProductScopeSlide.css";

const assets = "/anthropicxmaggie/slides/product-scope";

const frames: Record<number, { frame: string; heading: string }> = {
  4.2: { frame: "441:112489", heading: "441:112515" },
  4.3: { frame: "441:112491", heading: "441:112514" },
  4.4: { frame: "441:112494", heading: "441:112513" },
};

export default function ProductScopeSlide({ number, title }: { number: number; title: string }) {
  const { frame, heading } = frames[number];
  const isCoreProduct = number === 4.2;
  return (
    <div className="axm-product-scope" data-node-id={frame}>
      <h1 data-node-id={heading}>{title}</h1>
      {(isCoreProduct || number === 4.3) && (
        <video
          className={`axm-product-scope-video${isCoreProduct ? "" : " axm-product-scope-video--growth"}`}
          data-node-id={isCoreProduct ? "441:112511" : undefined}
          src={isCoreProduct ? `${assets}/core-product.mp4` : "/anthropicxmaggie/video/clickup-growth.mp4"}
          poster={isCoreProduct ? `${assets}/core-product-poster.png` : undefined}
          aria-label={isCoreProduct ? "ClickUp Core Product walkthrough" : "ClickUp growth demos"}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}
      {number === 4.4 && (
        <div className="axm-product-scope-innovation">
          <img src={`${assets}/innovation-brain.gif`} alt="ClickUp Brain desktop demo" data-node-id="441:112500" />
          <img src={`${assets}/innovation-app-icons.avif`} alt="ClickUp Brain icon in the macOS Dock" data-node-id="441:112502" />
        </div>
      )}
    </div>
  );
}
