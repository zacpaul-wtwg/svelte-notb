import { test } from '@playwright/test';

test('pricing labels visual check', async ({ page }, testInfo) => {
  await page.goto('/pricing', { waitUntil: 'networkidle' });

  await page.setViewportSize({ width: 1366, height: 1200 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: testInfo.outputPath('pricing-desktop.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: testInfo.outputPath('pricing-mobile.png'), fullPage: true });
});
