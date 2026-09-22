import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4321";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1728, height: 1117 } });

await page.goto(`${base}/anthropicxmaggie`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => document.querySelector(".axm-stage-viewport") && getComputedStyle(document.querySelector(".axm-stage-viewport")).visibility === "visible");

const total = Number((await page.locator(".axm-page-number").textContent())?.split("/")[1]);
for (let index = 1; index <= total; index += 1) {
  await page.waitForFunction(expected => document.querySelector(".axm-page-number")?.textContent?.startsWith(String(expected).padStart(2, "0")), index);
  await page.waitForTimeout(index === 1 ? 700 : 520);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter(image => !image.complete).map(image => new Promise(resolve => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    })));
  });
  await page.locator(".axm-stage").screenshot({
    path: `public/anthropicxmaggie/previews/slide-${String(index).padStart(2, "0")}.png`,
    animations: "disabled",
  });
  if (index < total) await page.keyboard.press("ArrowRight");
}

await browser.close();
console.log(`Regenerated ${total} Anthropic slide previews.`);
