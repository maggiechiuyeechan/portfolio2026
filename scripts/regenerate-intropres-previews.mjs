import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4321";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1728, height: 1117 } });

await page.goto(`${base}/introsamsara`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => {
  const canvas = document.querySelector(".intro-stage-viewport");
  return canvas && getComputedStyle(canvas).visibility === "visible";
});

const total = Number((await page.locator(".intro-page-number").textContent())?.split("/")[1]);

const controls = page.locator(".intro-page-tick");
if (await controls.count() !== total) throw new Error("Slide control count does not match page total");

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
  if (!slideLabel.startsWith(`Slide ${index + 1}:`)) throw new Error(`Incorrect slide label: ${slideLabel}`);
  const control = controls.nth(index);
  if (await control.getAttribute("aria-current") !== "page") throw new Error(`Incorrect active control at page ${index + 1}`);
  if (!(await control.getAttribute("aria-label"))?.startsWith(`Go to page ${index + 1}:`)) throw new Error("Incorrect control page number");
  if (slideLabel.includes("Appendix")) appendix = index + 1;
  if (slideLabel.includes("Agent ROI Calculator")) agentRoi = index + 1;
  if (slideLabel.includes("Project 1 Design Workflow")) movedDocsLabel = slideLabel;
  await page.locator(".intro-stage").screenshot({
    path: `public/intropres/previews/slide-${pageNumber}.png`,
    animations: "disabled",
  });
  if (index < total - 1) await controls.nth(index + 1).evaluate(button => button.click());
}

console.log(JSON.stringify({
  total,
  appendix,
  agentRoi,
  movedDocsLabel,
}));

await browser.close();
