import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4321";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1728, height: 1117 } });

await page.goto(`${base}/intropres`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => {
  const canvas = document.querySelector(".intro-stage-viewport");
  return canvas && getComputedStyle(canvas).visibility === "visible";
});

const total = Number((await page.locator(".intro-page-number").textContent())?.split("/")[1]);

let movedDocsLabel = "";
let appendix = 0;
let agentRoi = 0;

for (let index = 0; index < total; index += 1) {
  const pageNumber = String(index + 1).padStart(2, "0");
  await page.waitForFunction(
    expected => document.querySelector(".intro-page-number")?.textContent?.startsWith(`${expected}/`),
    pageNumber,
  );
  await page.waitForTimeout(index === 0 ? 600 : 460);
  const slideLabel = await page.locator(".intro-slide").getAttribute("aria-label") ?? "";
  if (slideLabel.includes("Appendix")) appendix = index + 1;
  if (slideLabel.includes("Agent ROI Calculator")) agentRoi = index + 1;
  if (slideLabel.includes("Project 1 Design Workflow")) movedDocsLabel = slideLabel;
  await page.locator(".intro-stage").screenshot({
    path: `public/intropres/previews/slide-${pageNumber}.png`,
    animations: "disabled",
  });
  if (index < total - 1) await page.keyboard.press("ArrowRight");
}

console.log(JSON.stringify({
  total,
  appendix,
  agentRoi,
  movedDocsLabel,
}));

await browser.close();
