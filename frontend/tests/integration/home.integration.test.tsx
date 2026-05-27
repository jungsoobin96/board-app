/**
 * Home 통합 — MSW로 /api/articles + /api/tags happy mock.
 * AC-07 매핑. Home 컴포넌트 mount → 카드 N건 + 사이드바 N건 노출 검증.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Article, Tag } from '@app/shared';
import { Home } from '../../src/pages/Home';
import { buildHandlers, buildServer } from '../setup/msw';

const sampleArticles: Article[] = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  title: `샘플 글 ${i + 1}`,
  body: `샘플 본문 ${i + 1}`,
  author: 'tester',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  tags: ['js'],
}));

const sampleTags: Tag[] = [
  { name: 'javascript', count: 12 },
  { name: 'typescript', count: 7 },
];

const server = buildServer(
  buildHandlers({ articles: sampleArticles, tags: sampleTags, total: 25 }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Home 통합 (MSW)', () => {
  it('AC-07: mount → 카드 10건 + 사이드바 2 태그 + Pagination', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>,
    );

    // 글 카드 10건
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '샘플 글 1', level: 2 })).toBeInTheDocument();
    });
    expect(screen.getAllByRole('article')).toHaveLength(10);

    // 사이드바 태그 2건
    expect(screen.getByRole('button', { name: /javascript/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /typescript/ })).toBeInTheDocument();

    // Pagination — total=25, limit=10 → 3 pages
    expect(screen.getByRole('navigation', { name: '페이지네이션' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });
});
