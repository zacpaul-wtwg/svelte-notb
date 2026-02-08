import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
const result = await page.evaluate(() => {
  const vw = window.innerWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && String(el.className)) || '',
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width)
      });
    }
  }
  return {
    innerWidth: vw,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders: offenders.slice(0, 80)
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
