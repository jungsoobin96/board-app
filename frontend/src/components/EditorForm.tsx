/**
 * EditorForm — controlled 4 필드 + 인라인 검증 + submit 핸들러 props.
 * M9 검증 룰 정합 (09 §3 동일 한국어 메시지):
 *   - title: trim 후 1~200자
 *   - body: trim 후 비어 있지 않음
 *   - author: trim 후 1~50자
 *   - tagList: input 문자열 → split(',').map(trim).filter(Boolean) → lower + 중복 제거
 *
 * submit 결과(loading/error)는 form 내부 state. useEditor hook 분리 안 함 (premature abstraction 회피).
 * submit 실패 시 입력값 보존 (controlled state 자연).
 */
import { useState, type FormEvent } from 'react';
import type { ArticleInput } from '@app/shared';
import { NormalizedError } from '@app/shared';

export interface EditorFormValues {
  title: string;
  author: string;
  body: string;
  tagListInput: string;
}

export interface EditorFormProps {
  initialValues?: Partial<EditorFormValues>;
  submitLabel: string;
  onSubmit: (input: ArticleInput) => Promise<void>;
}

interface FieldErrors {
  title?: string;
  body?: string;
  author?: string;
}

const emptyDefaults: EditorFormValues = {
  title: '',
  author: '',
  body: '',
  tagListInput: '',
};

function validate(values: EditorFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const titleTrim = values.title.trim();
  const bodyTrim = values.body.trim();
  const authorTrim = values.author.trim();
  if (titleTrim.length === 0) errors.title = '제목은 필수입니다';
  else if (titleTrim.length > 200) errors.title = '제목은 200자 이하여야 합니다';
  if (bodyTrim.length === 0) errors.body = '본문은 필수입니다';
  if (authorTrim.length === 0) errors.author = '작성자는 필수입니다';
  else if (authorTrim.length > 50) errors.author = '작성자는 50자 이하여야 합니다';
  return errors;
}

function parseTagList(input: string): string[] {
  const tokens = input
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
  return Array.from(new Set(tokens));
}

/**
 * 글 작성·수정 폼 — controlled state(title·body·author·tagList) + inline 검증 + onSubmit 위임.
 * 생성·수정 두 모드를 initialValues + submitLabel prop으로 분기. 태그는 쉼표 구분 입력 → 정규화 배열.
 */
export const EditorForm = ({
  initialValues,
  submitLabel,
  onSubmit,
}: EditorFormProps): JSX.Element => {
  const [values, setValues] = useState<EditorFormValues>({
    ...emptyDefaults,
    ...initialValues,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (key: keyof EditorFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      setSubmitError(null);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const input: ArticleInput = {
        title: values.title.trim(),
        body: values.body.trim(),
        author: values.author.trim(),
        tagList: parseTagList(values.tagListInput),
      };
      await onSubmit(input);
    } catch (err) {
      const message =
        err instanceof NormalizedError ? err.message : '저장 중 오류가 발생했습니다';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isSubmitting}
      className="flex flex-col gap-4 max-w-3xl mx-auto"
      noValidate
    >
      {submitError && (
        <div role="alert" className="border border-danger-500 rounded p-3 text-danger-500 text-sm">
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="editor-title" className="text-sm font-semibold text-neutral-900">
          제목
        </label>
        <input
          id="editor-title"
          type="text"
          value={values.title}
          onChange={set('title')}
          placeholder="제목"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'editor-title-error' : undefined}
          className="border border-neutral-300 rounded px-3 py-2"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p id="editor-title-error" className="text-xs text-danger-500">
            {errors.title}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="editor-author" className="text-sm font-semibold text-neutral-900">
          작성자
        </label>
        <input
          id="editor-author"
          type="text"
          value={values.author}
          onChange={set('author')}
          placeholder="작성자"
          aria-invalid={Boolean(errors.author)}
          aria-describedby={errors.author ? 'editor-author-error' : undefined}
          className="border border-neutral-300 rounded px-3 py-2"
          disabled={isSubmitting}
        />
        {errors.author && (
          <p id="editor-author-error" className="text-xs text-danger-500">
            {errors.author}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="editor-body" className="text-sm font-semibold text-neutral-900">
          본문
        </label>
        <textarea
          id="editor-body"
          value={values.body}
          onChange={set('body')}
          placeholder="본문 (plain text)"
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? 'editor-body-error' : undefined}
          rows={12}
          className="border border-neutral-300 rounded px-3 py-2 resize-y"
          disabled={isSubmitting}
        />
        {errors.body && (
          <p id="editor-body-error" className="text-xs text-danger-500">
            {errors.body}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="editor-tags" className="text-sm font-semibold text-neutral-900">
          태그 <span className="font-normal text-neutral-700">(쉼표 구분, 선택)</span>
        </label>
        <input
          id="editor-tags"
          type="text"
          value={values.tagListInput}
          onChange={set('tagListInput')}
          placeholder="javascript, intro"
          className="border border-neutral-300 rounded px-3 py-2"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          className="px-4 py-2 rounded bg-primary-500 text-neutral-0 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700"
        >
          {isSubmitting ? '저장 중…' : submitLabel}
        </button>
      </div>
    </form>
  );
};
