import { test } from '@playwright/test';

test('observe desktop nav hover visuals', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });

  await page.screenshot({ path: testInfo.outputPath('nav-rest.png'), fullPage: false });

  const targets = ['Home', 'Products', 'Pricing'];
  for (const t of targets) {
    const link = page.locator('.desktop-nav a', { hasText: t }).first();
    await link.hover();
    await page.waitForTimeout(220);
    await page.screenshot({ path: testInfo.outputPath(`nav-hover-${t.toLowerCase()}.png`), fullPage: false });
  }

  const metrics = await page.$$eval('.desktop-nav li', (lis) =>
    lis.map((li) => {
      const a = li.querySelector('a');
      const after = getComputedStyle(li, '::after');
      const liRect = li.getBoundingClientRect();
      const aRect = a?.getBoundingClientRect();
      return {
        label: a?.textContent?.trim() || '',
        liRect: { x: liRect.x, y: liRect.y, w: liRect.width, h: liRect.height },
        aRect: aRect ? { x: aRect.x, y: aRect.y, w: aRect.width, h: aRect.height } : null,
        liAfter: {
          background: after.backgroundColor,
          border: after.border,
          boxShadow: after.boxShadow,
          transform: after.transform
        },
        aStyle: a
          ? {
              transform: getComputedStyle(a).transform,
              boxShadow: getComputedStyle(a).boxShadow
            }
          : null
      };
    })
  );

  console.log(JSON.stringify(metrics, null, 2));
});
