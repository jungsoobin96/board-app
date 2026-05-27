/**
 * S-02 Article 상세 — 본문 + 메타 + 태그 + 댓글 목록 + 수정/삭제 흐름.
 * 404 시 NotFound 컴포넌트 직 렌더 (URL 유지).
 * 수정 → /editor/:id (#14 PR #42), 삭제 → ConfirmModal + deleteArticle + navigate (#15 본 PR).
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NormalizedError } from '@app/shared';
import { useArticle } from '../hooks/useArticle';
import { useComments } from '../hooks/useComments';
import { deleteArticle } from '../api/client';
import { CommentList } from '../components/CommentList';
import { ConfirmModal } from '../components/ConfirmModal';
import { NotFound } from './NotFound';

export const Article = (): JSX.Element => {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idParsed = idParam ? Number(idParam) : NaN;
  const id = Number.isInteger(idParsed) && idParsed >= 1 ? idParsed : -1;

  const articleState = useArticle(id);
  const commentsState = useComments(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<NormalizedError | null>(null);

  // id 자체가 invalid → NotFound
  if (id === -1) return <NotFound />;

  // article 404 → NotFound
  if (articleState.status === 'error' && articleState.error?.status === 404) {
    return <NotFound />;
  }

  // loading
  if (articleState.status === 'loading' || articleState.status === 'idle') {
    return (
      <article aria-busy="true" className="animate-pulse">
        <div className="h-10 bg-neutral-100 rounded mb-4" />
        <div className="h-4 bg-neutral-100 rounded mb-2" />
        <div className="h-4 bg-neutral-100 rounded w-2/3" />
      </article>
    );
  }

  // error (404 외) — 한국어 inline
  if (articleState.status === 'error' && articleState.error) {
    return (
      <div role="alert" className="border border-danger-500 rounded p-4 text-danger-500">
        <p className="font-semibold mb-1">글을 불러올 수 없습니다</p>
        <p className="text-sm">{articleState.error.message}</p>
      </div>
    );
  }

  // success — articleState.data 보장
  if (articleState.status !== 'success' || !articleState.data) {
    return <NotFound />;
  }

  const article = articleState.data;

  const handleEdit = (): void => {
    navigate(`/editor/${article.id}`);
  };
  const handleDelete = (): void => {
    setDeleteError(null);
    setConfirmOpen(true);
  };
  const handleConfirmDelete = async (): Promise<void> => {
    setDeletePending(true);
    setDeleteError(null);
    try {
      await deleteArticle(article.id);
      setConfirmOpen(false);
      navigate('/');
    } catch (err) {
      const normalized =
        err instanceof NormalizedError
          ? err
          : new NormalizedError(0, '알 수 없는 오류가 발생했습니다');
      setDeleteError(normalized);
    } finally {
      setDeletePending(false);
    }
  };
  const handleCancelDelete = (): void => {
    if (deletePending) return;
    setConfirmOpen(false);
    setDeleteError(null);
  };

  return (
    <article aria-labelledby="article-heading">
      <h1 id="article-heading" className="text-3xl font-bold text-neutral-900 mb-4">
        {article.title}
      </h1>
      <div className="flex items-center justify-between text-sm text-neutral-700 mb-6 pb-4 border-b border-neutral-300">
        <span>
          <span className="font-semibold">{article.author}</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <time dateTime={article.createdAt}>{formatDate(article.createdAt)}</time>
          {article.updatedAt !== article.createdAt && (
            <>
              <span className="mx-2" aria-hidden="true">·</span>
              <span className="text-neutral-700/70">
                수정됨 ({formatDate(article.updatedAt)})
              </span>
            </>
          )}
        </span>
        <span className="flex gap-2">
          <button
            type="button"
            onClick={handleEdit}
            className="px-3 py-1 rounded border border-neutral-300 text-sm font-semibold hover:border-primary-500"
          >
            수정
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1 rounded border border-danger-500 text-danger-500 text-sm font-semibold hover:bg-danger-500 hover:text-neutral-0"
          >
            삭제
          </button>
        </span>
      </div>
      <div className="whitespace-pre-wrap text-neutral-700 mb-6">{article.body}</div>
      {article.tags.length > 0 && (
        <ul className="flex gap-2 flex-wrap mb-6" aria-label="태그">
          {article.tags.map((tag) => (
            <li
              key={tag}
              className="bg-secondary-500/10 text-secondary-700 px-2 py-1 rounded text-xs"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
      {/* 댓글 영역 — useComments 5상태 별 처리 */}
      {commentsState.status === 'loading' && (
        <div aria-busy="true" className="animate-pulse h-20 bg-neutral-100 rounded mt-8" />
      )}
      {commentsState.status === 'error' && (
        <div role="alert" className="border border-danger-500 rounded p-4 text-danger-500 text-sm mt-8">
          댓글을 불러올 수 없습니다.
        </div>
      )}
      {(commentsState.status === 'success' || commentsState.status === 'empty') && commentsState.data && (
        <CommentList comments={commentsState.data} />
      )}
      <ConfirmModal
        open={confirmOpen}
        title="글 삭제 확인"
        message="이 글을 삭제하시겠습니까? 댓글도 함께 삭제됩니다."
        confirmLabel="삭제"
        pendingLabel="삭제 중…"
        isPending={deletePending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </article>
  );
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
