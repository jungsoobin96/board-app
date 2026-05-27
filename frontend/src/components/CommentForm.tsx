/**
 * CommentForm — controlled body·author + 인라인 검증 + submit 핸들러 prop.
 * M9 검증 룰 정합 (한국어 메시지):
 *   - body: trim 후 비어 있지 않음 (공백만 입력 차단)
 *   - author: trim 후 1~50자
 *
 * 성공 시 body만 reset (author는 유지 — 연속 작성 UX). 실패 시 NormalizedError 상단 alert + 입력값 보존.
 * submit 중 disabled로 race(중복 작성) 차단.
 */
import { useId, useState, type FormEvent } from 'react';
import type { CommentInput } from '@app/shared';
import { NormalizedError } from '@app/shared';

export interface CommentFormProps {
  onSubmit: (input: CommentInput) => Promise<void>;
}

interface FieldErrors {
  body?: string;
  author?: string;
}

function validate(body: string, author: string): FieldErrors {
  const errors: FieldErrors = {};
  if (body.trim().length === 0) errors.body = '본문은 필수입니다';
  const authorTrim = author.trim();
  if (authorTrim.length === 0) errors.author = '작성자는 필수입니다';
  else if (authorTrim.length > 50) errors.author = '작성자는 50자 이하여야 합니다';
  return errors;
}

export const CommentForm = ({ onSubmit }: CommentFormProps): JSX.Element => {
  const titleId = useId();
  const bodyId = useId();
  const authorId = useId();
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const fieldErrors = validate(body, author);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitError(null);
    setIsPending(true);
    try {
      await onSubmit({ body: body.trim(), author: author.trim() });
      setBody('');
      setErrors({});
    } catch (err) {
      const message =
        err instanceof NormalizedError ? err.message : '알 수 없는 오류가 발생했습니다';
      setSubmitError(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby={titleId}
      className="mt-8 border border-neutral-300 rounded p-4"
    >
      <h3 id={titleId} className="text-sm font-semibold text-neutral-900 mb-3">
        댓글 작성
      </h3>
      {submitError && (
        <div role="alert" className="border border-danger-500 rounded p-2 text-danger-500 text-sm mb-3">
          {submitError}
        </div>
      )}
      <div className="mb-3">
        <label htmlFor={bodyId} className="block text-xs font-semibold text-neutral-700 mb-1">
          본문 <span className="text-danger-500">*</span>
        </label>
        <textarea
          id={bodyId}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full border border-neutral-300 rounded p-2 text-sm focus:border-primary-500 focus:outline-none sm:min-h-[6rem]"
        />
        {errors.body && <p className="text-danger-500 text-xs mt-1">{errors.body}</p>}
      </div>
      <div className="mb-3">
        <label htmlFor={authorId} className="block text-xs font-semibold text-neutral-700 mb-1">
          작성자 <span className="text-danger-500">*</span>
        </label>
        <input
          id={authorId}
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full border border-neutral-300 rounded p-2 text-sm focus:border-primary-500 focus:outline-none"
        />
        {errors.author && <p className="text-danger-500 text-xs mt-1">{errors.author}</p>}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="px-4 py-2 rounded bg-primary-500 text-neutral-0 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '작성 중…' : '댓글 작성'}
        </button>
      </div>
    </form>
  );
};
