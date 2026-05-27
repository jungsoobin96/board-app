/**
 * S-03/S-04 Editor placeholder — 신규/수정 분기.
 * 실 컨텐츠는 Sprint 4 feat-editor-page에서.
 */
import { useParams } from 'react-router-dom';

export const Editor = (): JSX.Element => {
  const { id } = useParams<{ id?: string }>();
  const mode = id ? '수정' : '신규';
  return (
    <section aria-labelledby="editor-heading">
      <h1 id="editor-heading" className="text-2xl font-bold text-neutral-900 mb-4">
        Editor ({mode}
        {id ? ` ${id}` : ''})
      </h1>
      <p className="text-neutral-700">
        실 작성·수정 폼은 Sprint 4 feat-editor-page에서.
      </p>
    </section>
  );
};
