/**
 * M9 comment.validator 단위 테스트.
 * AC-04 + plan §3 commit 1 매핑.
 */
import { describe, it, expect } from 'vitest';
import { validateCommentInput } from '../../../src/validators/comment.validator.js';
import { ValidationError } from '../../../src/errors/validation-error.js';

describe('validateCommentInput', () => {
  it('정상 입력 → parsed object 반환 (trim 적용)', () => {
    const parsed = validateCommentInput({
      body: '  재밌네요  ',
      author: '  min  ',
    });
    expect(parsed).toEqual({ body: '재밌네요', author: 'min' });
  });

  it('body 빈 값 → ValidationError("본문은 필수입니다")', () => {
    expect(() => validateCommentInput({ body: '', author: 'min' })).toThrowError(
      new ValidationError('VAL_COMMENT_BODY_REQUIRED', '본문은 필수입니다'),
    );
  });

  it('body 공백만 → ValidationError("본문은 필수입니다")', () => {
    expect(() => validateCommentInput({ body: '   ', author: 'min' })).toThrow(
      '본문은 필수입니다',
    );
  });

  it('author 빈 값 → ValidationError("작성자는 필수입니다")', () => {
    expect(() => validateCommentInput({ body: 'hi', author: '' })).toThrow(
      '작성자는 필수입니다',
    );
  });

  it('author 51자 → ValidationError("작성자는 50자 이하여야 합니다")', () => {
    const longAuthor = 'a'.repeat(51);
    expect(() => validateCommentInput({ body: 'hi', author: longAuthor })).toThrow(
      '작성자는 50자 이하여야 합니다',
    );
  });

  it('author 50자 → 통과', () => {
    const author50 = 'a'.repeat(50);
    const parsed = validateCommentInput({ body: 'hi', author: author50 });
    expect(parsed.author).toBe(author50);
  });

  it('input null → ValidationError("요청 본문이 비어 있습니다")', () => {
    expect(() => validateCommentInput(null)).toThrow('요청 본문이 비어 있습니다');
  });

  it('body·author 비문자열(숫자) → 빈 값으로 처리되어 ValidationError', () => {
    expect(() => validateCommentInput({ body: 123, author: 'a' })).toThrow(
      '본문은 필수입니다',
    );
  });
});
