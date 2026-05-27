/**
 * ArticleCard RTL snapshot — fixed sample props (FE-HP-RISK-04 timestamp 안정성).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ArticleCard } from '../../../src/components/ArticleCard';
import type { Article } from '@app/shared';

afterEach(() => cleanup());

const sampleArticle: Article = {
  id: 1,
  title: '샘플 제목',
  body: '샘플 본문입니다. 두 줄 이상이면 line-clamp-2로 잘립니다.',
  author: 'tester',
  createdAt: '2026-01-15T10:30:00.000Z',
  updatedAt: '2026-01-15T10:30:00.000Z',
  tags: ['javascript', 'tutorial'],
};

describe('ArticleCard', () => {
  it('snapshot — sample article + 2 tags', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <ArticleCard article={sampleArticle} />
      </MemoryRouter>,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('태그 0건이어도 정상 렌더', () => {
    const noTagArticle: Article = { ...sampleArticle, tags: [] };
    const { container } = render(
      <MemoryRouter>
        <ArticleCard article={noTagArticle} />
      </MemoryRouter>,
    );
    expect(container.querySelector('[aria-label="태그"]')).toBeNull();
  });
});
