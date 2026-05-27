/**
 * Article RTL — 삭제 흐름 결합 (#15).
 *   (e) "삭제" 클릭 → ConfirmModal 노출
 *   (f) 확정 → deleteArticle 1회 호출 + navigate('/')
 *   (g) 실패 → 모달 유지 + alert + 글 본문 그대로
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Article } from '../../../src/pages/Article';
import type { Article as ArticleType } from '@app/shared';
import { NormalizedError } from '@app/shared';
import * as useArticleModule from '../../../src/hooks/useArticle';
import * as useCommentsModule from '../../../src/hooks/useComments';
import * as clientModule from '../../../src/api/client';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const sampleArticle: ArticleType = {
  id: 77,
  title: '삭제 대상 글',
  body: '본문',
  author: 'hana',
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
  tags: [],
};

function setupHookMocks(): void {
  vi.spyOn(useArticleModule, 'useArticle').mockReturnValue({
    status: 'success',
    data: sampleArticle,
    error: null,
  });
  vi.spyOn(useCommentsModule, 'useComments').mockReturnValue({
    status: 'empty',
    data: [],
    error: null,
  });
}

function renderArticle(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/article/77']}>
      <Routes>
        <Route path="/article/:id" element={<Article />} />
        <Route path="/" element={<div>홈입니다</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Article — 삭제 흐름 (#15)', () => {
  it('"삭제" 클릭 → ConfirmModal 노출 (role="dialog")', () => {
    setupHookMocks();
    renderArticle();

    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /^삭제$/ }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/이 글을 삭제하시겠습니까/);
  });

  it('모달 확정 → deleteArticle 1회 호출 + navigate(/)', async () => {
    setupHookMocks();
    const deleteSpy = vi
      .spyOn(clientModule, 'deleteArticle')
      .mockResolvedValue(undefined);

    renderArticle();

    fireEvent.click(screen.getByRole('button', { name: /^삭제$/ }));
    const confirmBtn = screen.getAllByRole('button', { name: /^삭제$/ })[1];
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(77);
    });
    await waitFor(() => {
      expect(screen.getByText('홈입니다')).toBeInTheDocument();
    });
  });

  it('deleteArticle 실패 → 모달 유지 + alert + 글 본문 그대로', async () => {
    setupHookMocks();
    vi.spyOn(clientModule, 'deleteArticle').mockRejectedValue(
      new NormalizedError(500, '서버 오류가 발생했습니다'),
    );

    renderArticle();

    fireEvent.click(screen.getByRole('button', { name: /^삭제$/ }));
    const confirmBtn = screen.getAllByRole('button', { name: /^삭제$/ })[1];
    fireEvent.click(confirmBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '서버 오류가 발생했습니다',
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /삭제 대상 글/ })).toBeInTheDocument();
  });
});
