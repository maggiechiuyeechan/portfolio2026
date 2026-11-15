import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://127.0.0.1:4321";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1728, height: 1117 } });

await page.goto(`${base}/notionxmaggie`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => document.querySelector(".axm-stage-viewport") && getComputedStyle(document.querySelector(".axm-stage-viewport")).visibility === "visible");

const total = Number((await page.locator(".axm-page-number").textContent())?.split("/")[1]);
assert.equal(await page.locator(".axm-page-tick").count(), total);
for (let index = 1; index <= total; index += 1) {
  await page.waitForFunction(expected => document.querySelector(".axm-page-number")?.textContent?.startsWith(String(expected).padStart(2, "0")), index);
  await page.waitForTimeout(1000);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.race([
      Promise.all([...document.querySelectorAll(".axm-stage img")].map(image => image.decode().catch(() => {}))),
      new Promise(resolve => setTimeout(resolve, 5000)),
    ]);
    await Promise.race([
      Promise.all([...document.querySelectorAll(".axm-stage video")].map(video => video.readyState >= 2 ? Promise.resolve() : new Promise(resolve => video.addEventListener("loadeddata", resolve, { once: true })))),
      new Promise(resolve => setTimeout(resolve, 5000)),
    ]);
  });
  await page.locator(".axm-stage").screenshot({
    path: `public/anthropicxmaggie/previews/slide-${String(index).padStart(2, "0")}.png`,
    animations: "disabled",
  });
  console.log(`Generated preview ${index}/${total}.`);
  if (index < total) await page.keyboard.press("ArrowRight");
}

await page.locator(".axm-page-tick").last().focus();
await page.waitForFunction(total => document.querySelector(".axm-page-preview img")?.getAttribute("src") === `/anthropicxmaggie/previews/slide-${String(total).padStart(2, "0")}.png`, total);
await page.locator(".axm-page-preview img").evaluate(image => image.decode());
await page.keyboard.press("ArrowRight");
await page.waitForFunction(() => document.querySelector(".axm-page-number")?.textContent?.startsWith("01/"));
await browser.close();
console.log(`Regenerated ${total} Anthropic slide previews.`);
