/**
 * WFB Token Whitepaper — High-resolution PDF builder
 * Uses Puppeteer (headless Chromium) to render index.html → WFB_Whitepaper.pdf
 * Output: print-ready A4 @ ~300 DPI effective (2x scale factor)
 */
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const HTML = path.join(ROOT, 'index.html');
const OUT = path.join(ROOT, 'WFB_Whitepaper.pdf');

(async () => {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.error('\n  [!] puppeteer not installed. Run:  npm install\n');
    process.exit(1);
  }

  console.log('\n  WFB Whitepaper — building PDF...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

  const fileUrl = 'file://' + HTML;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 90000 });

  // Ensure webfonts are fully loaded before capture
  await page.evaluate(() => document.fonts ? document.fonts.ready : null);
  await new Promise(r => setTimeout(r, 1200));

  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    scale: 1,
  });

  await browser.close();

  const sizeKB = Math.round(fs.statSync(OUT).size / 1024);
  console.log(`\n  ✓ PDF generated →  ${path.basename(OUT)}  (${sizeKB} KB)\n`);
  console.log(`     ${OUT}\n`);
})().catch(err => {
  console.error('\n  [x] Build failed:', err.message, '\n');
  process.exit(1);
});
