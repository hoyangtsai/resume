import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.RESUME_BASE_URL || "http://127.0.0.1:4000";

const targets = [
  { path: "/", output: process.env.PDF_OUTPUT || "assets/resume.pdf" },
  {
    path: "/README.zh-tw",
    output: process.env.PDF_OUTPUT_ZH || "assets/resume.zh-tw.pdf",
  },
];

const browser = await chromium.launch({ headless: true });

try {
  for (const { path, output } of targets) {
    await mkdir(dirname(output), { recursive: true });

    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });

    await page.emulateMedia({ media: "print" });
    await page.goto(new URL(path, baseUrl).toString(), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);

    await page.pdf({
      path: output,
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

    await page.close();
  }
} finally {
  await browser.close();
}
