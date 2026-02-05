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
    await expect(page.locator('.label', { hasText: 'Date' })).toBeVisible();
  });

  test('hours editor toggle sets closed and disables field', async ({ page }) => {
    await page.goto('/cms-admin/hours');
    await expect(page.locator('h1', { hasText: 'Store Hours' })).toBeVisible();

    const closedToggle = page.locator('button.closedToggle').first();
    const hoursField = page.locator('.hoursRow input[type=\"time\"]').first();
    const timePickers = page.locator('.timePickers').first();

    // Ensure starting open state for deterministic test
    const initial = await closedToggle.getAttribute('aria-pressed');

    await closedToggle.click();
    await expect(closedToggle).not.toHaveAttribute('aria-pressed', initial);
    await expect(hoursField).toBeDisabled();
    await expect(timePickers).toHaveAttribute('data-collapsed', 'true');

    await closedToggle.click();
    await expect(hoursField).toBeEnabled();
  });

  test('special hours add day and remove', async ({ page }) => {
    await page.goto('/cms-admin/specialHours');
    await expect(page.locator('h1', { hasText: 'Special Hours' })).toBeVisible();

    const addEvent = page.locator('button', { hasText: 'Add Event' }).first();
    await addEvent.click();

    const firstItem = page.locator('.item').first();
    await expect(firstItem).toBeVisible();

    const addDay = firstItem.locator('button', { hasText: 'Add Day' });
    await addDay.click();
    await addDay.click();

    await expect(firstItem.locator('.dayCard')).toHaveCount(2);

    await firstItem.locator('.dayCard .dayRemove').first().click();
    await expect(firstItem.locator('.dayCard')).toHaveCount(1);
  });
});
