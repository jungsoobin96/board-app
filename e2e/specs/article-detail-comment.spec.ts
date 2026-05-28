import { test, expect } from '@playwright/test';

test('Article 상세 + 댓글 작성', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  const articleId = process.env.E2E_FIRST_ARTICLE_ID;
  expect(articleId, 'global-setup이 E2E_FIRST_ARTICLE_ID 설정해야 함').toBeTruthy();

  const ts = Date.now();
  const commentBody = `E2E comment ${ts}`;

  await page.goto(`/article/${articleId}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const form = page.getByRole('form').filter({ has: page.getByRole('heading', { name: '댓글 작성' }) });
  await form.locator('textarea').fill(commentBody);
  await form.locator('input[type="text"]').fill('e2e-commenter');
  await form.getByRole('button', { name: '댓글 작성' }).click();

  const commentSection = page.getByRole('region', { name: '댓글' });
  await expect(commentSection.getByText(commentBody)).toBeVisible();

  expect(errors).toEqual([]);
});
