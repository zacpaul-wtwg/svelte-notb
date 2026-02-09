import { test } from '@playwright/test';

async function dump(page, label) {
  const data = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const vw = window.innerWidth;
    const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
    const overflow = [];
    const nodes = Array.from(document.querySelectorAll('*'));
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      if (!Number.isFinite(r.left) || !Number.isFinite(r.right)) continue;
      if (r.right > vw + 1 || r.left < -1) {
        overflow.push({
          tag: el.tagName.toLowerCase(),
          className: (el.className || '').toString().slice(0, 120),
          left: Math.round(r.left * 10) / 10,
          right: Math.round(r.right * 10) / 10,
          width: Math.round(r.width * 10) / 10,
          position: getComputedStyle(el).position,
          overflowX: getComputedStyle(el).overflowX
        });
      }
    }
    overflow.sort((a,b)=> (b.right-a.right) - (a.left-b.left));
    return { vw, scrollW, delta: scrollW - vw, overflow: overflow.slice(0, 40) };
  });
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
}

test('contact overflow debug', async ({ page }) => {
  await page.goto('/contact', { waitUntil: 'networkidle' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await dump(page, 'mobile');

  await page.setViewportSize({ width: 1366, height: 900 });
  await page.waitForTimeout(500);
  await dump(page, 'desktop');
});
