/*
 * Bakes the ClickUp 4.0 demo SVGs that WebKit renders badly into high-DPI WebP.
 *
 * WebKit rasterises an SVG <img> once at its pre-transform layout size and then
 * lets the compositor stretch that bitmap by any ancestor scale(), so these blur
 * when the 871px demo frame is scaled up to fill a wider column. A raster that
 * already carries several times the detail survives that stretch, and both
 * engines downsample it cleanly when the frame scales down instead.
 *
 * Rendering goes through Chromium rather than sharp's SVG loader: these exports
 * lean on filters, masks and clipPaths, which librsvg/resvg render differently
 * from a browser. This way the WebP is exactly what Chrome draws today.
 *
 * cssWidth/cssHeight are the CSS box the asset occupies, not the SVG's own
 * header — the raster has to line up with the layout size it replaces.
 *
 * Usage: node scripts/rasterize-demo-svgs.mjs
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIR = "src/assets/clickup-four-demo";

const TARGETS = [
  // Calendar day columns (.cu4cal-col) — baked pills and labels.
  ...["mon", "tue", "wed", "thu", "fri"].map((day) => ({
    name: `cal-col-${day}`,
    cssWidth: 140.476,
    cssHeight: 411.4,
    scale: 3,
  })),
  /*
   * Docs rail glyph (.cu4docs-rail-doc-view img). Only 17px on screen, so WebKit's
   * snapshot is coarse enough to read as plainly pixelated rather than merely soft
   * — it needs a far higher multiplier than the columns, which costs almost
   * nothing at this size. The box is the export's own 17 x 18.2092: the extra
   * height is drop-shadow bleed that the CSS hangs below the icon frame.
   */
  { name: "docs-doc", cssWidth: 17, cssHeight: 18.2092, scale: 12 },
];

const browser = await chromium.launch();

for (const target of TARGETS) {
  const { name, cssWidth, cssHeight, scale } = target;
  const svg = path.join(DIR, `${name}.svg`);
  const out = path.join(DIR, `${name}.webp`);
  const markup = fs.readFileSync(svg, "utf8");

  /*
   * Scale the SVG itself at deviceScaleFactor 1 rather than rendering it at CSS
   * size under a scaled device: a viewport has to be a whole number of pixels, so
   * a fractional box like 17 x 18.2092 would get rounded up and bake in a stretch.
   * Scaling an SVG element and scaling the device are equivalent for vectors,
   * filters included, since both just scale the viewBox mapping.
   */
  const pixelWidth = Math.round(cssWidth * scale);
  const pixelHeight = Math.round(cssHeight * scale);

  const page = await browser.newPage({
    viewport: { width: pixelWidth, height: pixelHeight },
    deviceScaleFactor: 1,
  });

  await page.setContent(
    `<!doctype html><html><head><style>
       html, body { margin: 0; background: transparent; }
       svg { display: block; width: ${pixelWidth}px; height: ${pixelHeight}px; }
     </style></head><body>${markup}</body></html>`,
    { waitUntil: "load" },
  );

  const png = await page.locator("svg").screenshot({ omitBackground: true });
  await page.close();

  // Lossless: these are flat fills and hairline strokes, where lossy WebP rings
  // visibly along the edges.
  const webp = await sharp(png).webp({ lossless: true, effort: 6 }).toBuffer();
  fs.writeFileSync(out, webp);

  const meta = await sharp(webp).metadata();
  const svgKb = (fs.statSync(svg).size / 1024).toFixed(1);
  const webpKb = (webp.length / 1024).toFixed(1);
  console.log(
    `${name}: ${meta.width}x${meta.height} @${scale}x alpha=${meta.hasAlpha} — svg ${svgKb}kB -> webp ${webpKb}kB`,
  );
}

await browser.close();
