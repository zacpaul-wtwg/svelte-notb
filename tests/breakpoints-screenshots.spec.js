import { test } from '@playwright/test';

const viewports = [
	{ name: 'mobile-375', width: 375, height: 812 },
	{ name: 'tablet-768', width: 768, height: 1024 },
	{ name: 'desktop-1280', width: 1280, height: 800 },
	{ name: 'wide-1440', width: 1440, height: 900 }
];

test('home page screenshots at breakpoints', async ({ page }, testInfo) => {
	for (const viewport of viewports) {
		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		await page.goto('/', { waitUntil: 'networkidle' });
		await page.screenshot({
			path: testInfo.outputPath(`home-${viewport.name}.png`),
			fullPage: true
		});
	}
});
