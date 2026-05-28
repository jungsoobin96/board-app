import { test, expect } from '@playwright/test';

test('Home 글 목록 + 인기 태그 렌더', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: '최신 글', level: 1 })).toBeVisible();

  const articles = page.locator('main article, section[aria-labelledby="home-heading"] article');
  await expect(articles.first()).toBeVisible();
  expect(await articles.count()).toBeGreaterThanOrEqual(5);

  const tagAside = page.getByRole('complementary', { name: '인기 태그' });
  await expect(tagAside).toBeVisible();
  await expect(tagAside.getByRole('heading', { name: '인기 태그' })).toBeVisible();

  expect(errors).toEqual([]);
});
