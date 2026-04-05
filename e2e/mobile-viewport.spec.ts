import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } });

test('no horizontal overflow on landing page', async ({ page }) => {
  await page.goto('/');
  const body = page.locator('body');
  const bodyWidth = await body.evaluate((el) => el.scrollWidth);
  const viewportWidth = page.viewportSize()!.width;
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
});

test('protocols search input visible on mobile', async ({ page }) => {
  await page.goto('/protocols');
  await expect(page.locator('input#studyCode')).toBeVisible();
});

test('blog post readable on mobile', async ({ page }) => {
  await page.goto('/blog/what-is-an-n-of-1-study');
  const article = page.locator('article');
  await expect(article).toBeVisible();
  const box = await article.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(375);
});
