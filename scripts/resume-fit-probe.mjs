/* Reports whether each /resume/print page still fits its Letter sheet.
   Measurement only — does not regenerate the downloadable PDF. */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4321";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 900 },
  deviceScaleFactor: 1,
});

await page.goto(`${BASE}/resume/print`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const pages = await page.locator(".resume-print-page").evaluateAll((sheets) =>
  sheets.map((sheet, index) => {
    const work = sheet.querySelector(".resume-print-work");
    const last = work?.lastElementChild;
    const sheetRect = sheet.getBoundingClientRect();
    const lastRect = last?.getBoundingClientRect();
    const style = getComputedStyle(sheet);
    const contentBottom = lastRect ? Math.round(lastRect.bottom - sheetRect.top) : null;
    const availableBottom = Math.round(
      sheetRect.height - parseFloat(style.paddingBottom),
    );
    return {
      page: index + 1,
      height: Math.round(sheetRect.height),
      scrollHeight: sheet.scrollHeight,
      contentBottom,
      availableBottom,
      slackPx: contentBottom === null ? null : availableBottom - contentBottom,
      overflows: contentBottom !== null && contentBottom > availableBottom,
    };
  }),
);

console.log(JSON.stringify({ pages }, null, 2));
await browser.close();
