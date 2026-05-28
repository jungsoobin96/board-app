import { test, expect } from '@playwright/test';

test('Tag 칩 클릭 → URL ?tag=... → 재클릭으로 해제', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: '최신 글', level: 1 })).toBeVisible();

  const tagAside = page.getByRole('complementary', { name: '인기 태그' });
  await expect(tagAside).toBeVisible();

  const e2eTagChip = tagAside.getByRole('button', { name: /^e2e/ });
  await expect(e2eTagChip.first()).toBeVisible();
  await e2eTagChip.first().click();

  await expect(page).toHaveURL(/\?.*tag=e2e/);
  await expect(e2eTagChip.first()).toHaveAttribute('aria-pressed', 'true');

  await e2eTagChip.first().click();
  await expect(page).not.toHaveURL(/tag=/);
  await expect(e2eTagChip.first()).toHaveAttribute('aria-pressed', 'false');

  expect(errors).toEqual([]);
});
