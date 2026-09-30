import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4323";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1728, height: 1117 } });

await page.goto(`${base}/presentationopenai`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => {
  const canvas = document.querySelector(".oai-stage-viewport");
  return canvas && getComputedStyle(canvas).visibility === "visible";
});

for (let index = 1; index < 11; index += 1) {
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(460);
}

await page.waitForFunction(() =>
  document.querySelector(".oai-page-number")?.textContent?.startsWith("11/"),
);
await page.waitForTimeout(500);
await page.locator(".oai-stage").screenshot({
  path: "public/presentationopenai/previews/slide-11.png",
  animations: "disabled",
});

console.log(JSON.stringify({
  pageNumber: await page.locator(".oai-page-number").textContent(),
  slide: await page.locator(".oai-slide").getAttribute("aria-label"),
  icon: await page.locator(".oai-why-openai-logo img").getAttribute("src"),
}));

await browser.close();
