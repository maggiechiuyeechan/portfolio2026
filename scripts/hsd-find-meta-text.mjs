/*
 * Locates the baked "Mindful Activity" and "1 min" runs inside fp-lower-bg.png so
 * the DOM overlay can be positioned against them, and reports the icon edges so
 * the mask can stop short of the icons.
 *
 * Coordinates come out in the front page's CSS space: the export is exactly 2x
 * its 411x315 box, which sits at left 0 / top 501.5.
 */
import sharp from "sharp";

const SRC = "src/assets/headspace-demo/fp-lower-bg.png";
const IMG_LEFT = 0;
const IMG_TOP = 501.5;
const EXPORT_SCALE = 2;

// The card occupies the top-left of the export; stay well clear of the artwork.
const REGION = { left: 100, top: 150, width: 340, height: 130 };

const { data, info } = await sharp(SRC)
  .extract(REGION)
  .raw()
  .toBuffer({ resolveWithObject: true });

const at = (x, y) => {
  const i = (info.width * y + x) * info.channels;
  return { r: data[i], g: data[i + 1], b: data[i + 2], a: info.channels > 3 ? data[i + 3] : 255 };
};

const isBlue = ({ r, g, b, a }) => a > 40 && b > 150 && b - r > 50 && g > r;
const isDark = ({ r, g, b, a }) => a > 40 && r < 120 && g < 120 && b < 120;

function bounds(test, yFrom, yTo) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -1;
  let maxY = -1;
  for (let y = yFrom; y < yTo; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (!test(at(x, y))) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

// Column histogram of ink, to find the gap between an icon and its label.
function inkColumns(test, yFrom, yTo) {
  const cols = [];
  for (let x = 0; x < info.width; x += 1) {
    let n = 0;
    for (let y = yFrom; y < yTo; y += 1) if (test(at(x, y))) n += 1;
    cols.push(n);
  }
  return cols;
}

const toCss = (v, axis) =>
  +((v + (axis === "x" ? REGION.left : REGION.top)) / EXPORT_SCALE + (axis === "x" ? IMG_LEFT : IMG_TOP)).toFixed(2);

const blue = bounds(isBlue, 0, info.height);
console.log("region", REGION, "size", info.width, info.height, "channels", info.channels);

if (blue) {
  console.log("Mindful Activity (blue ink)", {
    left: toCss(blue.minX, "x"),
    top: toCss(blue.minY, "y"),
    right: toCss(blue.maxX + 1, "x"),
    bottom: toCss(blue.maxY + 1, "y"),
    cssWidth: +((blue.maxX + 1 - blue.minX) / EXPORT_SCALE).toFixed(2),
    capHeightPx: +((blue.maxY + 1 - blue.minY) / EXPORT_SCALE).toFixed(2),
  });

  // The speaker icon sits left of the label on the same rows.
  const cols = inkColumns(isDark, blue.minY - 6, blue.maxY + 6);
  let iconRight = 0;
  for (let x = 0; x < blue.minX; x += 1) if (cols[x] > 0) iconRight = x + 1;
  console.log("speaker icon right edge", toCss(iconRight, "x"));

  // "1 min" is the dark run below the blue line.
  const min = bounds(isDark, blue.maxY + 6, info.height);
  if (min) {
    const minCols = inkColumns(isDark, min.minY, min.maxY + 1);
    let gapEnd = min.minX;
    let seenInk = false;
    for (let x = min.minX; x <= min.maxX; x += 1) {
      if (minCols[x] > 0) seenInk = true;
      else if (seenInk && minCols.slice(x, x + 6).every((n) => n === 0)) {
        gapEnd = x;
        break;
      }
    }
    console.log("1 min row (dark ink)", {
      left: toCss(min.minX, "x"),
      top: toCss(min.minY, "y"),
      right: toCss(min.maxX + 1, "x"),
      bottom: toCss(min.maxY + 1, "y"),
      clockIconRight: toCss(gapEnd, "x"),
      capHeightPx: +((min.maxY + 1 - min.minY) / EXPORT_SCALE).toFixed(2),
    });
  }
}
