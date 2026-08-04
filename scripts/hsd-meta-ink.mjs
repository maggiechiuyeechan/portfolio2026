/*
 * Compares the rendered ink of the live meta row against the baked run it
 * replaces, both measured the same way — coloured pixels in a screenshot,
 * converted back into the front page's design coordinates. Comparing ink to ink
 * avoids font-metric guesswork, since a range box is ascent/descent, not ink.
 *
 * Usage: node scripts/hsd-meta-ink.mjs [baseUrl]
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4321";
const OUT = "scripts/hsd-shots";
fs.mkdirSync(OUT, { recursive: true });
const password = (fs.readFileSync(".env", "utf8").match(/^SITE_PASSWORD=(.*)$/m)?.[1] ?? "").trim();

const browser = await chromium.launch();
// Render the phone at design scale so one screenshot pixel is one design pixel
// per device-pixel-ratio step, keeping the measurement free of resample error.
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 4 });
await page.goto(BASE, { waitUntil: "load" });
await page.evaluate(
  async ([base, pw]) => {
    await fetch(`${base}/api/auth`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
  },
  [BASE, password],
);
await page.goto(`${BASE}/work#headspace`, { waitUntil: "load" });

for (let y = 0; y < 80000; y += 600) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(70);
  if (await page.locator(".headspace-hero-demo").count()) break;
}
await page.locator(".headspace-hero-demo").scrollIntoViewIfNeeded();
// Left at its natural 0.6 pane scale: unscaling it overflows the viewport's clip
// and the band lands outside. deviceScaleFactor 4 still gives 2.4 device pixels
// per design pixel, which is ample for a bounding box.
await page.addStyleTag({
  content: `.hsd-front-wrap { opacity: 1 !important; transform: none !important; }`,
});
await page.waitForTimeout(900);

const geom = await page.evaluate(() => {
  const lower = document.querySelector(".hsd-viewport.is-right .hsd-fp-lower");
  const b = lower.getBoundingClientRect();
  return { x: b.x, y: b.y, width: b.width, scale: b.width / 411 };
});

// The meta row band, in design coordinates. It starts past the icons at 71 so the
// dark measurement sees "1 min" and not the clock beside it.
const BAND = { left: 75, top: 583, right: 215, bottom: 630 };
const clip = {
  x: geom.x + BAND.left * geom.scale,
  y: geom.y + (BAND.top - 501.5) * geom.scale,
  width: (BAND.right - BAND.left) * geom.scale,
  height: (BAND.bottom - BAND.top) * geom.scale,
};

async function inkBoxes(label) {
  const path = `${OUT}/hsd-meta-ink-${label}.png`;
  await page.screenshot({ path, clip });
  const dataUrl = `data:image/png;base64,${fs.readFileSync(path).toString("base64")}`;
  return page.evaluate(
    async ([src, band]) => {
      const bmp = await createImageBitmap(await (await fetch(src)).blob());
      const canvas = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bmp, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, bmp.width, bmp.height);
      const px = (x, y) => {
        const i = (width * y + x) << 2;
        return [data[i], data[i + 1], data[i + 2]];
      };
      const pxPerDesign = (bmp.width / (band.right - band.left));
      const box = (test) => {
        let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            if (!test(px(x, y))) continue;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
        if (maxX < 0) return null;
        const r = (n) => +n.toFixed(2);
        return {
          left: r(band.left + minX / pxPerDesign),
          top: r(band.top + minY / pxPerDesign),
          right: r(band.left + (maxX + 1) / pxPerDesign),
          bottom: r(band.top + (maxY + 1) / pxPerDesign),
        };
      };
      /*
       * A bounding box on the baked run is inflated by the resample's soft edges,
       * so position is compared by ink centroid instead — that is insensitive to
       * how far the antialiasing spreads.
       */
      const centroid = (test) => {
        let sx = 0, sy = 0, n = 0;
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            if (!test(px(x, y))) continue;
            sx += x;
            sy += y;
            n += 1;
          }
        }
        if (!n) return null;
        const r = (n2) => +n2.toFixed(2);
        return {
          x: r(band.left + sx / n / pxPerDesign),
          y: r(band.top + sy / n / pxPerDesign),
          inkPx: n,
        };
      };
      const isBlue = ([r, g, b]) => b > 140 && b - r > 45 && g > r;
      const isDark = ([r, g, b]) => r < 130 && g < 130 && b < 130;
      return {
        blue: box(isBlue),
        dark: box(isDark),
        blueMid: centroid(isBlue),
        darkMid: centroid(isDark),
      };
    },
    [dataUrl, BAND],
  );
}

// Baked: hide the overlay so the export shows through unmasked.
await page.addStyleTag({
  content: `.hsd-fp-meta-mask, .hsd-fp-meta-activity, .hsd-fp-meta-duration { display: none !important; }`,
});
await page.waitForTimeout(300);
const baked = await inkBoxes("baked");

await page.addStyleTag({
  content: `.hsd-fp-meta-mask { display: block !important; }
            .hsd-fp-meta-activity, .hsd-fp-meta-duration { display: block !important; }`,
});
await page.waitForTimeout(300);
const live = await inkBoxes("live");

const d = (a, b) => (a && b ? +(a - b).toFixed(2) : null);
for (const [key, mid, label] of [
  ["blue", "blueMid", "Mindful Activity"],
  ["dark", "darkMid", "1 min"],
]) {
  console.log(
    label,
    "\n  baked", JSON.stringify(baked[key]), JSON.stringify(baked[mid]),
    "\n  live ", JSON.stringify(live[key]), JSON.stringify(live[mid]),
    "\n  delta", JSON.stringify({
      centroidX: d(live[mid]?.x, baked[mid]?.x),
      centroidY: d(live[mid]?.y, baked[mid]?.y),
      width: d(live[key]?.right - live[key]?.left, baked[key]?.right - baked[key]?.left),
      height: d(live[key]?.bottom - live[key]?.top, baked[key]?.bottom - baked[key]?.top),
    }),
  );
}

await browser.close();
