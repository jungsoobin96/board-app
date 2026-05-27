/**
 * Article RTL —
 *   #15 글 삭제 흐름: (e) 모달 노출 / (f) 확정 deleteArticle+navigate / (g) 실패 alert+모달유지
 *   #16 댓글 작성/삭제 흐름: (h) 작성 성공 → 즉시 추가 / (i) 삭제 확정 → 즉시 제거 / (j) 빈 body 인라인 에러
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Article } from '../../../src/pages/Article';
import type { Article as ArticleType, Comment } from '@app/shared';
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

const sampleComment: Comment = {
  id: 100,
  articleId: 77,
  body: '기존 댓글',
  author: 'min',
  createdAt: '2026-05-02T00:00:00.000Z',
};

function setupHookMocks(comments: Comment[] = []): void {
  vi.spyOn(useArticleModule, 'useArticle').mockReturnValue({
    status: 'success',
    data: sampleArticle,
    error: null,
  });
  vi.spyOn(useCommentsModule, 'useComments').mockReturnValue({
    status: comments.length === 0 ? 'empty' : 'success',
    data: comments,
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

describe('Article — 글 삭제 흐름 (#15)', () => {
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
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /^삭제$/ }));

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
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /^삭제$/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '서버 오류가 발생했습니다',
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /삭제 대상 글/ })).toBeInTheDocument();
  });
});

describe('Article — 댓글 작성/삭제 흐름 (#16)', () => {
  it('CommentForm submit 성공 → createComment 호출 + 댓글 즉시 추가 (prepend)', async () => {
    setupHookMocks([]);
    const newComment: Comment = {
      id: 200,
      articleId: 77,
      body: '새 댓글',
      author: 'jiwoo',
      createdAt: '2026-05-27T00:00:00.000Z',
    };
    const createSpy = vi
      .spyOn(clientModule, 'createComment')
      .mockResolvedValue(newComment);

    renderArticle();

    fireEvent.change(screen.getByLabelText(/본문/), { target: { value: '새 댓글' } });
    fireEvent.change(screen.getByLabelText(/작성자/), { target: { value: 'jiwoo' } });
    fireEvent.click(screen.getByRole('button', { name: /댓글 작성/ }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith(77, { body: '새 댓글', author: 'jiwoo' });
    });
    await waitFor(() => {
      expect(screen.getByText('새 댓글')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /댓글 \(1\)/ })).toBeInTheDocument();
  });

  it('댓글 "삭제" 클릭 → 댓글 모달 노출 → 확정 → deleteComment + 즉시 제거', async () => {
    setupHookMocks([sampleComment]);
    const deleteSpy = vi
      .spyOn(clientModule, 'deleteComment')
      .mockResolvedValue(undefined);

    renderArticle();

    await waitFor(() => {
      expect(screen.getByText('기존 댓글')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /댓글 #100 삭제/ }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('이 댓글을 삭제하시겠습니까?');

    fireEvent.click(within(dialog).getByRole('button', { name: /^삭제$/ }));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(77, 100);
    });
    await waitFor(() => {
      expect(screen.queryByText('기존 댓글')).toBeNull();
    });
  });

  it('CommentForm 빈 body submit → 인라인 에러 + createComment 미호출 + 글 본문 그대로', async () => {
    setupHookMocks([]);
    const createSpy = vi.spyOn(clientModule, 'createComment');

    renderArticle();

    fireEvent.change(screen.getByLabelText(/작성자/), { target: { value: 'jiwoo' } });
    fireEvent.click(screen.getByRole('button', { name: /댓글 작성/ }));

    expect(await screen.findByText('본문은 필수입니다')).toBeInTheDocument();
    expect(createSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: /삭제 대상 글/ })).toBeInTheDocument();
  });
});
