import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright";

const resumeUrl = process.env.RESUME_URL || "http://127.0.0.1:4000/";
const outputPath = process.env.PDF_OUTPUT || "assets/resume.pdf";

await mkdir(dirname(outputPath), { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });

  await page.emulateMedia({ media: "print" });
  await page.goto(resumeUrl, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    },
  });
} finally {
  await browser.close();
}
