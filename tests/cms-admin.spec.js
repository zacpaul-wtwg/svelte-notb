import { expect, test } from '@playwright/test';

test.describe('CMS Admin', () => {
  test('sections list renders', async ({ page }) => {
    await page.goto('/cms-admin');
    await expect(page.locator('h1', { hasText: 'CMS Admin' })).toBeVisible();
    await expect(page.locator('.grid a', { hasText: 'News Post' })).toBeVisible();
    await expect(page.locator('.grid a', { hasText: 'FAQ' })).toBeVisible();
    await expect(page.locator('.grid a', { hasText: 'Pricing' })).toBeVisible();
  });

  test('news post editor renders quill + date field', async ({ page }) => {
    await page.goto('/cms-admin/newsPosts');
    await expect(page.locator('h1', { hasText: 'News Post' })).toBeVisible();
    await expect(page.locator('.ql-toolbar')).toBeVisible();
    await expect(page.locator('.ql-container')).toBeVisible();
    await expect(page.locator('label', { hasText: 'Date' })).toBeVisible();
  });

  test('hours editor toggle sets closed and disables field', async ({ page }) => {
    await page.goto('/cms-admin/hours');
    await expect(page.locator('h1', { hasText: 'Store Hours' })).toBeVisible();

    const closedToggle = page.locator('button.closedToggle').first();
    const hoursField = page.locator('.hoursEditable').first();

    await closedToggle.click();
    await expect(hoursField).toHaveAttribute('contenteditable', 'false');
    await expect(hoursField).toHaveText(/Closed/i);

    await closedToggle.click();
    await expect(hoursField).toHaveAttribute('contenteditable', 'true');
  });
});
