import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4321";
const slideNumber = Number(process.argv[3]);
if (!Number.isInteger(slideNumber) || slideNumber < 1) {
  throw new Error("Provide a positive slide position, for example: 10");
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1728, height: 1117 } });
await page.goto(`${base}/introsamsara`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => getComputedStyle(document.querySelector(".intro-stage-viewport")).visibility === "visible");

for (let index = 1; index < slideNumber; index += 1) {
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(460);
}

const padded = String(slideNumber).padStart(2, "0");
await page.waitForFunction(expected => document.querySelector(".intro-page-number")?.textContent?.startsWith(`${expected}/`), padded);
await page.waitForTimeout(500);
await page.locator(".intro-stage").screenshot({
  path: `public/intropres/previews/slide-${padded}.png`,
  animations: "disabled",
});

console.log(JSON.stringify({
  pageNumber: await page.locator(".intro-page-number").textContent(),
  slide: await page.locator(".intro-slide").getAttribute("aria-label"),
}));
await browser.close();
