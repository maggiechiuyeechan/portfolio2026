import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4321";
const slideNumber = Number(process.argv[3]);
if (!Number.isInteger(slideNumber) || slideNumber < 1) {
  throw new Error("Provide a positive slide position, for example: 10");
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1728, height: 1117 } });
await page.goto(`${base}/presentationopenai`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => getComputedStyle(document.querySelector(".oai-stage-viewport")).visibility === "visible");

for (let index = 1; index < slideNumber; index += 1) {
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(460);
}

const padded = String(slideNumber).padStart(2, "0");
await page.waitForFunction(expected => document.querySelector(".oai-page-number")?.textContent?.startsWith(`${expected}/`), padded);
await page.waitForTimeout(500);
await page.locator(".oai-stage").screenshot({
  path: `public/presentationopenai/previews/slide-${padded}.png`,
  animations: "disabled",
});

console.log(JSON.stringify({
  pageNumber: await page.locator(".oai-page-number").textContent(),
  slide: await page.locator(".oai-slide").getAttribute("aria-label"),
}));
await browser.close();
