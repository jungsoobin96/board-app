/**
 * useArticle hook — 5상태 + AbortController signal.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useArticle } from '../../../src/hooks/useArticle';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useArticle', () => {
  it('happy → loading → success', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          title: 't',
          body: 'b',
          author: 'a',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
          tags: [],
        }),
        { status: 200 },
      ),
    );
    const { result } = renderHook(() => useArticle(1));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data?.id).toBe(1);
  });

  it('404 응답 → status="error" + err.status=404', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: '글을 찾을 수 없습니다' }), { status: 404 }),
    );
    const { result } = renderHook(() => useArticle(999));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.status).toBe(404);
  });

  it('AbortController — signal forwarded + unmount abort', () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useArticle(1));

    const initArg = vi.mocked(fetch).mock.calls[0][1] as RequestInit | undefined;
    expect(initArg?.signal).toBeInstanceOf(AbortSignal);

    unmount();
    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });
});
