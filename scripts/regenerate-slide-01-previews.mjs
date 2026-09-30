import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4323";
const browser = await chromium.launch();

for (const { route, prefix, output } of [
  { route: "anthropicxmaggie", prefix: "axm", output: "public/anthropicxmaggie/previews/slide-01.png" },
  { route: "presentationopenai", prefix: "oai", output: "public/presentationopenai/previews/slide-01.png" },
]) {
  const page = await browser.newPage({ viewport: { width: 1728, height: 1117 } });
  await page.goto(`${base}/${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(selector => {
    const canvas = document.querySelector(selector);
    return canvas && getComputedStyle(canvas).visibility === "visible";
  }, `.${prefix}-stage-viewport`);
  await page.waitForTimeout(600);
  await page.locator(`.${prefix}-stage`).screenshot({ path: output, animations: "disabled" });
  await page.close();
}

await browser.close();
console.log("Regenerated slide 1 previews for both presentations.");
