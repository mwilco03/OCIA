const { chromium } = require('playwright');
const path = require('path');

const [,, source, outDir, version] = process.argv;
const CHART_SETTLE_MS = 2500;
const CSS_DPI = 96;
const PAGE_MARGIN_IN = 0.25;
const LETTER_IN = { w: 8.5, h: 11 };
const printableWidthPx = (widthIn) => Math.floor((widthIn - 2 * PAGE_MARGIN_IN) * CSS_DPI);
const FORMATS = [
  { name: 'letter', format: 'Letter', landscape: false, viewportWidth: printableWidthPx(LETTER_IN.w) },
];

(async () => {
  const browser = await chromium.launch();
  for (const f of FORMATS) {
    const page = await browser.newPage({ viewport: { width: f.viewportWidth, height: 1000 } });
    await page.emulateMedia({ media: 'print' });
    await page.goto('file://' + path.resolve(source), { waitUntil: 'networkidle' });
    await page.waitForTimeout(CHART_SETTLE_MS);
    const out = path.join(outDir, `church-eternal-family-${f.name}-${version}.pdf`);
    await page.pdf({ path: out, format: f.format, landscape: f.landscape, printBackground: true, preferCSSPageSize: false });
    console.log(out);
    await page.close();
  }
  await browser.close();
})();
