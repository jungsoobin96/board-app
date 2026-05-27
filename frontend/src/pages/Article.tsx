/**
 * S-02 Article 상세 placeholder — 실 컨텐츠는 Sprint 3 #13에서.
 */
import { useParams } from 'react-router-dom';

export const Article = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  return (
    <section aria-labelledby="article-heading">
      <h1 id="article-heading" className="text-2xl font-bold text-neutral-900 mb-4">
        Article {id ?? '(id 없음)'}
      </h1>
      <p className="text-neutral-700">
        실 글 상세 + 댓글 목록은 Sprint 3 Issue #13 (feat-article-page-and-comments-list)에서.
      </p>
    </section>
  );
};
