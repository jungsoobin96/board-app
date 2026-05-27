/**
 * Editor RTL — 신구 분기.
 *   - /editor       → 신규 모드, useArticle 미동작 (id=-1 guard), 빈 form
 *   - /editor/:id   → 수정 모드, useArticle 사전 로드 → form 초기값 채움
 *   - /editor/abc   → invalid id, NotFound
 *   - /editor/99999 → 404, NotFound
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Editor } from '../../../src/pages/Editor';
import type { Article } from '@app/shared';
import * as useArticleModule from '../../../src/hooks/useArticle';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const sampleArticle: Article = {
  id: 66,
  title: '기존 제목',
  body: '기존 본문',
  author: 'hana',
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
  tags: ['javascript', 'intro'],
};

function renderEditor(path: string): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Editor — 신구 분기', () => {
  it('신규 모드 (/editor) — 빈 form + "발행" 라벨', () => {
    // useArticle은 id=-1로 호출되어 idle 유지
    vi.spyOn(useArticleModule, 'useArticle').mockReturnValue({
      status: 'idle',
      data: null,
      error: null,
    });

    renderEditor('/editor');

    expect(screen.getByRole('heading', { name: /새 글 작성/ })).toBeInTheDocument();
    expect((screen.getByLabelText(/제목/) as HTMLInputElement).value).toBe('');
    expect(screen.getByRole('button', { name: /발행/ })).toBeInTheDocument();
  });

  it('수정 모드 (/editor/66) — 사전 로드 후 form 초기값 채움 + "저장" 라벨', async () => {
    vi.spyOn(useArticleModule, 'useArticle').mockReturnValue({
      status: 'success',
      data: sampleArticle,
      error: null,
    });

    renderEditor('/editor/66');

    expect(screen.getByRole('heading', { name: /글 수정/ })).toBeInTheDocument();
    await waitFor(() => {
      expect((screen.getByLabelText(/제목/) as HTMLInputElement).value).toBe('기존 제목');
    });
    expect((screen.getByLabelText(/작성자/) as HTMLInputElement).value).toBe('hana');
    expect((screen.getByLabelText(/본문/) as HTMLTextAreaElement).value).toBe('기존 본문');
    expect((screen.getByLabelText(/태그/) as HTMLInputElement).value).toBe('javascript, intro');
    expect(screen.getByRole('button', { name: /저장/ })).toBeInTheDocument();
  });

  it('수정 모드 + 404 → NotFound 직 렌더', () => {
    const err = Object.assign(new Error('not found'), { name: 'NormalizedError', status: 404 });
    vi.spyOn(useArticleModule, 'useArticle').mockReturnValue({
      status: 'error',
      data: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: err as any,
    });

    renderEditor('/editor/99999');

    expect(screen.getByText(/요청하신 경로/)).toBeInTheDocument();
  });

  it('수정 모드 + invalid id (/editor/abc) → NotFound', () => {
    vi.spyOn(useArticleModule, 'useArticle').mockReturnValue({
      status: 'idle',
      data: null,
      error: null,
    });

    renderEditor('/editor/abc');

    expect(screen.getByText(/요청하신 경로/)).toBeInTheDocument();
  });

  it('수정 모드 + loading → aria-busy skeleton', () => {
    vi.spyOn(useArticleModule, 'useArticle').mockReturnValue({
      status: 'loading',
      data: null,
      error: null,
    });

    const { container } = renderEditor('/editor/66');

    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});
