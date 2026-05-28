import { test, expect } from '@playwright/test';

test('Editor 신규 글 작성 → Article 페이지 이동', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  const ts = Date.now();
  const title = `E2E Article ${ts}`;
  const body = `E2E test body for ${ts}.`;

  await page.goto('/editor');
  await expect(page.getByRole('heading', { name: '새 글 작성', level: 1 })).toBeVisible();

  await page.locator('#editor-title').fill(title);
  await page.locator('#editor-author').fill('e2e-create');
  await page.locator('#editor-body').fill(body);
  await page.locator('#editor-tags').fill('e2e,create');

  await page.getByRole('button', { name: '발행' }).click();

  await page.waitForURL(/\/article\/\d+$/);
  await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  await expect(page.getByText(body)).toBeVisible();

  expect(errors).toEqual([]);
});
