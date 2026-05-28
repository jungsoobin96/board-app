import { test, expect } from '@playwright/test';

test('Article 삭제 → Home 이동 + 댓글 cascade', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  const articleId = process.env.E2E_LAST_ARTICLE_ID;
  expect(articleId, 'global-setup이 E2E_LAST_ARTICLE_ID 설정해야 함').toBeTruthy();

  const titleText = 'E2E Seed 5';

  await page.goto(`/article/${articleId}`);
  await expect(page.getByRole('heading', { name: titleText, level: 1 })).toBeVisible();

  await page.getByRole('button', { name: '삭제' }).first().click();

  const modal = page.getByRole('heading', { name: '글 삭제 확인' });
  await expect(modal).toBeVisible();
  await page.getByRole('button', { name: '삭제', exact: true }).last().click();

  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: '최신 글', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: titleText, level: 2 })).toHaveCount(0);

  expect(errors).toEqual([]);
});
