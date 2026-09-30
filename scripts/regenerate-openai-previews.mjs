import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4323";
const total = 48;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1728, height: 1117 } });

await page.goto(`${base}/presentationopenai`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => {
  const canvas = document.querySelector(".oai-stage-viewport");
  return canvas && getComputedStyle(canvas).visibility === "visible";
});

let movedDocsLabel = "";

for (let index = 0; index < total; index += 1) {
  const pageNumber = String(index + 1).padStart(2, "0");
  await page.waitForFunction(
    expected => document.querySelector(".oai-page-number")?.textContent?.startsWith(`${expected}/`),
    pageNumber,
  );
  await page.waitForTimeout(index === 0 ? 600 : 460);
  if (index === 40) movedDocsLabel = await page.locator(".oai-slide").getAttribute("aria-label") ?? "";
  await page.locator(".oai-stage").screenshot({
    path: `public/presentationopenai/previews/slide-${pageNumber}.png`,
    animations: "disabled",
  });
  if (index < total - 1) await page.keyboard.press("ArrowRight");
}

console.log(JSON.stringify({
  total,
  appendix: 39,
  movedDocsSlide: 41,
  movedDocsLabel,
}));

await browser.close();
