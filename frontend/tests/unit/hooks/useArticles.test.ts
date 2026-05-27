/**
 * useArticles hook 단위 — 5상태 전이 + AbortController.
 * fetch global mock + waitFor로 비동기 상태 검증.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useArticles } from '../../../src/hooks/useArticles';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useArticles', () => {
  it('happy → loading → success (articles 2건)', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          articles: [
            { id: 1, title: 't1', body: 'b1', author: 'a', createdAt: '2026-01-01', updatedAt: '2026-01-01', tags: [] },
            { id: 2, title: 't2', body: 'b2', author: 'b', createdAt: '2026-01-02', updatedAt: '2026-01-02', tags: [] },
          ],
          total: 2,
          page: 1,
          limit: 10,
        }),
        { status: 200 },
      ),
    );

    const { result } = renderHook(() => useArticles({ page: 1, limit: 10, tag: null }));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data?.articles).toHaveLength(2);
  });

  it('empty → articles.length===0 시 status="empty"', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ articles: [], total: 0, page: 1, limit: 10 }), { status: 200 }),
    );
    const { result } = renderHook(() => useArticles({ page: 1, limit: 10, tag: 'ghost' }));
    await waitFor(() => expect(result.current.status).toBe('empty'));
  });

  it('error → 4xx 응답 시 NormalizedError state', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: '잘못된 페이지/리미트 값입니다' }), { status: 400 }),
    );
    const { result } = renderHook(() => useArticles({ page: -1, limit: 10, tag: null }));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.status).toBe(400);
    expect(result.current.error?.message).toBe('잘못된 페이지/리미트 값입니다');
  });

  it('AbortController — unmount 시 abort 호출 (메모리 leak 회피)', () => {
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise(() => {
          /* never resolve — abort 검증용 */
        }),
    );
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useArticles({ page: 1, limit: 10, tag: null }));
    unmount();
    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });
});
