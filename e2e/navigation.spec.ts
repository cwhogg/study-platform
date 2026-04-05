import { test, expect } from '@playwright/test';

// Force desktop viewport so nav links are visible (they're hidden sm:flex)
test.use({ viewport: { width: 1280, height: 720 } });

test('landing page → blog via nav', async ({ page }) => {
  await page.goto('/');
  await page.locator('header nav').getByRole('link', { name: 'Blog' }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.locator('h1')).toContainText('Blog');
});

test('landing page → protocols via nav', async ({ page }) => {
  await page.goto('/');
  await page.locator('header nav').getByRole('link', { name: 'Protocols' }).click();
  await expect(page).toHaveURL(/\/protocols$/);
  await expect(page.locator('h1')).toContainText('Find a Protocol');
});

test('blog index → blog post', async ({ page }) => {
  await page.goto('/blog');
  await page.getByRole('link', { name: /N-of-1 Study/i }).first().click();
  await expect(page.locator('article')).toBeVisible();
});

test('sponsor page → create protocol', async ({ page }) => {
  await page.goto('/sponsor');
  await page.getByRole('link', { name: 'Create a Protocol' }).click();
  await expect(page).toHaveURL(/\/sponsor\/create/);
});
