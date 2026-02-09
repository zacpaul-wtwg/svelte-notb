import { test } from '@playwright/test';

test('contact labels visual check', async ({ page }, testInfo) => {
  await page.goto('/contact', { waitUntil: 'networkidle' });

  await page.setViewportSize({ width: 1366, height: 900 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: testInfo.outputPath('contact-desktop.png'), fullPage: true });

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: testInfo.outputPath('contact-tablet.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: testInfo.outputPath('contact-mobile.png'), fullPage: true });
});
