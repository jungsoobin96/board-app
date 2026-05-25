/**
 * M9 article.validator 단위 테스트.
 * AC-01·02·03·04·06·07·09 일부 + plan §3 commit 1 매핑.
 */
import { describe, it, expect } from 'vitest';
import { validateArticleInput } from '../../../src/validators/article.validator.js';
import { ValidationError } from '../../../src/errors/validation-error.js';

describe('validateArticleInput', () => {
  it('정상 입력 → parsed object 반환 (trim 적용)', () => {
    const parsed = validateArticleInput({
      title: '  Hello  ',
      body: '  world  ',
      author: '  hana  ',
      tagList: ['JS', 'ts'],
    });
    expect(parsed).toEqual({
      title: 'Hello',
      body: 'world',
      author: 'hana',
      tagList: ['JS', 'ts'],
    });
  });

  it('title 빈 값 → ValidationError("제목은 필수입니다")', () => {
    expect(() =>
      validateArticleInput({ title: '   ', body: 'x', author: 'a', tagList: [] }),
    ).toThrowError(new ValidationError('VAL_TITLE_REQUIRED', '제목은 필수입니다'));
  });

  it('title 길이 201자 → ValidationError("제목은 200자 이하여야 합니다")', () => {
    const longTitle = 'a'.repeat(201);
    expect(() =>
      validateArticleInput({ title: longTitle, body: 'x', author: 'a', tagList: [] }),
    ).toThrow('제목은 200자 이하여야 합니다');
  });

  it('body 빈 값 → ValidationError("본문은 필수입니다")', () => {
    expect(() =>
      validateArticleInput({ title: 't', body: '   ', author: 'a', tagList: [] }),
    ).toThrow('본문은 필수입니다');
  });

  it('author 빈 값 → ValidationError("작성자는 필수입니다")', () => {
    expect(() =>
      validateArticleInput({ title: 't', body: 'b', author: '', tagList: [] }),
    ).toThrow('작성자는 필수입니다');
  });

  it('author 51자 → ValidationError("작성자는 50자 이하여야 합니다")', () => {
    const longAuthor = 'a'.repeat(51);
    expect(() =>
      validateArticleInput({ title: 't', body: 'b', author: longAuthor, tagList: [] }),
    ).toThrow('작성자는 50자 이하여야 합니다');
  });

  it('tagList 미배열 → ValidationError', () => {
    expect(() =>
      validateArticleInput({ title: 't', body: 'b', author: 'a', tagList: 'not-array' }),
    ).toThrow('태그 목록은 배열이어야 합니다');
  });

  it('tagList 누락 → 빈 배열 default', () => {
    const parsed = validateArticleInput({ title: 't', body: 'b', author: 'a' });
    expect(parsed.tagList).toEqual([]);
  });

  it('input null → ValidationError("요청 본문이 비어 있습니다")', () => {
    expect(() => validateArticleInput(null)).toThrow('요청 본문이 비어 있습니다');
  });
});
