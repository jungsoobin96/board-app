/**
 * M1 FE-router matchRoute 단위 테스트.
 * AC-04 매핑. BrowserRouter mount 없이 path → route name + params 매핑 검증.
 */
import { describe, it, expect } from 'vitest';
import { matchRoute } from '../../src/router/routes';

describe('matchRoute', () => {
  it('/ → home', () => {
    expect(matchRoute('/')).toEqual({ name: 'home', params: {} });
  });

  it('/article/123 → article + params.id=123', () => {
    expect(matchRoute('/article/123')).toEqual({
      name: 'article',
      params: { id: '123' },
    });
  });

  it('/editor → editor (params 없음)', () => {
    expect(matchRoute('/editor')).toEqual({ name: 'editor', params: {} });
  });

  it('/editor/42 → editor + params.id=42', () => {
    expect(matchRoute('/editor/42')).toEqual({
      name: 'editor',
      params: { id: '42' },
    });
  });

  it('/nonexistent → notfound', () => {
    expect(matchRoute('/nonexistent')).toEqual({ name: 'notfound', params: {} });
  });

  it('/article/abc-with-dashes → article + params.id 유지 (slug 형식 허용)', () => {
    expect(matchRoute('/article/abc-with-dashes')).toEqual({
      name: 'article',
      params: { id: 'abc-with-dashes' },
    });
  });
});
