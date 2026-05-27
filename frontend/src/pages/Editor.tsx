/**
 * S-03/S-04 Editor — useParams 신구 분기.
 *   - /editor       → 신규 모드, createArticle
 *   - /editor/:id   → 수정 모드, useArticle 사전 로드 + updateArticle
 * 수정 모드 404 → NotFound 직 렌더 (URL 유지).
 */
import { useParams, useNavigate } from 'react-router-dom';
import type { ArticleInput } from '@app/shared';
import { createArticle, updateArticle } from '../api/client';
import { useArticle } from '../hooks/useArticle';
import { EditorForm } from '../components/EditorForm';
import { NotFound } from './NotFound';

export const Editor = (): JSX.Element => {
  const { id: idParam } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(idParam);
  const idParsed = idParam ? Number(idParam) : NaN;
  const id = Number.isInteger(idParsed) && idParsed >= 1 ? idParsed : -1;

  // 수정 모드 invalid id (예: /editor/abc) → NotFound
  if (isEdit && id === -1) return <NotFound />;

  // 수정 모드면 useArticle 호출, 신규 모드면 호출 skip (id=-1로 hook 자체 guard 발동)
  const articleState = useArticle(isEdit ? id : -1);

  // 수정 모드 — 로딩 / 404 / error 분기
  if (isEdit) {
    if (articleState.status === 'error' && articleState.error?.status === 404) {
      return <NotFound />;
    }
    if (articleState.status === 'loading' || articleState.status === 'idle') {
      return (
        <section aria-busy="true" className="animate-pulse max-w-3xl mx-auto">
          <div className="h-8 bg-neutral-100 rounded mb-4" />
          <div className="h-32 bg-neutral-100 rounded" />
        </section>
      );
    }
    if (articleState.status === 'error' && articleState.error) {
      return (
        <div role="alert" className="border border-danger-500 rounded p-4 text-danger-500 max-w-3xl mx-auto">
          <p className="font-semibold mb-1">글을 불러올 수 없습니다</p>
          <p className="text-sm">{articleState.error.message}</p>
        </div>
      );
    }
  }

  const article = isEdit ? articleState.data : null;
  const initialValues = article
    ? {
        title: article.title,
        author: article.author,
        body: article.body,
        tagListInput: article.tags.join(', '),
      }
    : undefined;

  const handleSubmit = async (input: ArticleInput): Promise<void> => {
    const result = isEdit ? await updateArticle(id, input) : await createArticle(input);
    navigate(`/article/${result.id}`);
  };

  return (
    <section aria-labelledby="editor-heading">
      <h1 id="editor-heading" className="text-2xl font-bold text-neutral-900 mb-6 max-w-3xl mx-auto">
        {isEdit ? '글 수정' : '새 글 작성'}
      </h1>
      <EditorForm
        initialValues={initialValues}
        submitLabel={isEdit ? '저장' : '발행'}
        onSubmit={handleSubmit}
      />
    </section>
  );
};
