import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const shots = [
  ['s-trainers', '/trainers', 1280, 1000],
  ['s-search', '/search?q=mwzz', 1280, 900],
  ['s-items', '/items', 1280, 1000],
  ['s-frontier', '/frontier', 1280, 1000],
  ['s-enc', '/encounters', 1280, 1000],
  ['s-machines', '/machines', 1280, 1000],
  ['s-abilities', '/abilities', 1280, 1000],
  ['s-guide-mega', '/guides/megaevolutions', 1280, 1000],
  ['s-guide-grotto', '/guides/hidden-grottos', 1280, 1000],
];
for (const [name, url, w, h] of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto('http://localhost:8124/soulgold-cn' + url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `/tmp/${name}.png` });
  await page.close();
}
await browser.close();
console.log('done');
