/**
 * S-02 Article 상세 — 본문 + 메타 + 태그 + 댓글 목록 + 수정/삭제 버튼 mount.
 * 404 시 NotFound 컴포넌트 직 렌더 (URL 유지).
 * 수정/삭제 핸들러는 Sprint 4 별 PR에서 결합 — 본 PR은 mount만.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useArticle } from '../hooks/useArticle';
import { useComments } from '../hooks/useComments';
import { CommentList } from '../components/CommentList';
import { NotFound } from './NotFound';

export const Article = (): JSX.Element => {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idParsed = idParam ? Number(idParam) : NaN;
  const id = Number.isInteger(idParsed) && idParsed >= 1 ? idParsed : -1;

  const articleState = useArticle(id);
  const commentsState = useComments(id);

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

  // 수정 → /editor/:id (#14 결합 완료)
  // 삭제 → Sprint 4 #15 feat-article-delete-ux에서 결합
  const handleEdit = (): void => {
    navigate(`/editor/${article.id}`);
  };
  const handleDelete = (): void => {
    // Sprint 4 #15
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
