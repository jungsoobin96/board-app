import type { FullConfig } from '@playwright/test';

const API = 'http://localhost:3000/api';

const SEED_ARTICLES = [
  { title: 'E2E Seed 1', body: 'baseline seed body 1', author: 'e2e-seed', tagList: ['e2e', 'baseline'] },
  { title: 'E2E Seed 2', body: 'baseline seed body 2', author: 'e2e-seed', tagList: ['e2e', 'react'] },
  { title: 'E2E Seed 3', body: 'baseline seed body 3', author: 'e2e-seed', tagList: ['e2e', 'typescript'] },
  { title: 'E2E Seed 4', body: 'baseline seed body 4', author: 'e2e-seed', tagList: ['e2e', 'playwright'] },
  { title: 'E2E Seed 5', body: 'baseline seed body 5 — delete cascade target', author: 'e2e-seed', tagList: ['e2e', 'cascade'] },
];

async function waitForBackend(maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const res = await fetch(`${API}/articles?limit=1`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('backend not ready after 30s');
}

async function clearSeedArticles(): Promise<void> {
  const res = await fetch(`${API}/articles?limit=100`);
  if (!res.ok) return;
  const data = (await res.json()) as { articles: Array<{ id: number; author: string }> };
  for (const a of data.articles) {
    if (a.author === 'e2e-seed') {
      await fetch(`${API}/articles/${a.id}`, { method: 'DELETE' });
    }
  }
}

async function seedArticles(): Promise<number[]> {
  const ids: number[] = [];
  for (const a of SEED_ARTICLES) {
    const res = await fetch(`${API}/articles`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(a),
    });
    if (!res.ok) {
      throw new Error(`seed article failed: ${res.status} ${a.title}`);
    }
    const article = (await res.json()) as { id: number };
    ids.push(article.id);
  }
  return ids;
}

async function seedComments(articleId: number): Promise<void> {
  for (let i = 1; i <= 2; i += 1) {
    await fetch(`${API}/articles/${articleId}/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: `baseline comment ${i}`, author: 'e2e-seed' }),
    });
  }
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  await waitForBackend();
  await clearSeedArticles();
  const ids = await seedArticles();
  if (ids.length > 0) {
    await seedComments(ids[0]);
  }
  process.env.E2E_FIRST_ARTICLE_ID = String(ids[0]);
  process.env.E2E_LAST_ARTICLE_ID = String(ids[ids.length - 1]);
}
