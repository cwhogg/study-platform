import { test, expect } from '@playwright/test';

const consoleErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
});

test.afterEach(async () => {
  const unexpected = consoleErrors.filter(
    (e) =>
      !e.includes('Download the React DevTools') &&
      !e.includes('Failed to load resource') &&
      !e.includes('ERR_CONNECTION') &&
      !e.includes('net::'),
  );
  expect(unexpected).toEqual([]);
});

test('landing page loads', async ({ page }) => {
  const response = await page.goto('/');
  expect(response!.status()).toBeLessThan(400);
  await expect(page.locator('h1')).toContainText('Study yourself');
});

test('blog index loads', async ({ page }) => {
  const response = await page.goto('/blog');
  expect(response!.status()).toBeLessThan(400);
  await expect(page.locator('h1')).toContainText('Blog');
});

test('blog post loads', async ({ page }) => {
  const response = await page.goto('/blog/what-is-an-n-of-1-study');
  expect(response!.status()).toBeLessThan(400);
  await expect(page.locator('article')).toBeVisible();
});

test('sponsor page loads', async ({ page }) => {
  const response = await page.goto('/sponsor');
  expect(response!.status()).toBeLessThan(400);
  await expect(page.locator('h1')).toContainText('Launch Sponsored Protocols');
});

test('protocols page loads', async ({ page }) => {
  const response = await page.goto('/protocols');
  expect(response!.status()).toBeLessThan(400);
  await expect(page.locator('h1')).toContainText('Find a Protocol');
});

test('create page loads', async ({ page }) => {
  const response = await page.goto('/create');
  expect(response!.status()).toBeLessThan(400);
  await expect(page.locator('h1')).toContainText('What do you want to study');
});
