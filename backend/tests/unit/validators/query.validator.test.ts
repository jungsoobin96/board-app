/**
 * M9 query.validator 단위 테스트. plan §3 commit 1 매핑.
 */
import { describe, it, expect } from 'vitest';
import { parseListQuery, parsePathId } from '../../../src/validators/query.validator.js';

describe('parseListQuery', () => {
  it('page=1, limit=10 default 적용', () => {
    expect(parseListQuery({})).toEqual({ page: 1, limit: 10, tag: null });
  });

  it('page=-1 → 400 (잘못된 페이지/리미트 값입니다)', () => {
    expect(() => parseListQuery({ page: '-1' })).toThrow('잘못된 페이지/리미트 값입니다');
  });

  it('limit=51 → 400 (잘못된 페이지/리미트 값입니다)', () => {
    expect(() => parseListQuery({ limit: '51' })).toThrow('잘못된 페이지/리미트 값입니다');
  });

  it('limit=0 → 400', () => {
    expect(() => parseListQuery({ limit: '0' })).toThrow('잘못된 페이지/리미트 값입니다');
  });

  it('page="abc" 비정수 → 400', () => {
    expect(() => parseListQuery({ page: 'abc' })).toThrow('잘못된 페이지/리미트 값입니다');
  });

  it('tag="  JavaScript  " → "javascript" 정규화', () => {
    expect(parseListQuery({ tag: '  JavaScript  ' })).toEqual({
      page: 1,
      limit: 10,
      tag: 'javascript',
    });
  });

  it('tag 빈 문자열 → null', () => {
    expect(parseListQuery({ tag: '   ' })).toEqual({ page: 1, limit: 10, tag: null });
  });
});

describe('parsePathId', () => {
  it('"123" → 123 (정수 변환)', () => {
    expect(parsePathId('123')).toBe(123);
  });

  it('"abc" → ValidationError("잘못된 ID 형식입니다")', () => {
    expect(() => parsePathId('abc')).toThrow('잘못된 ID 형식입니다');
  });

  it('"1.5" → ValidationError (소수점 거부)', () => {
    expect(() => parsePathId('1.5')).toThrow('잘못된 ID 형식입니다');
  });

  it('undefined → ValidationError', () => {
    expect(() => parsePathId(undefined)).toThrow('잘못된 ID 형식입니다');
  });
});
