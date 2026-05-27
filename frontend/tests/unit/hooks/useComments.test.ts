/**
 * useComments hook — 5상태 + AbortController signal.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useComments } from '../../../src/hooks/useComments';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useComments', () => {
  it('happy → success', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          comments: [
            { id: 1, articleId: 1, body: 'c1', author: 'a', createdAt: '2026-01-01' },
          ],
        }),
        { status: 200 },
      ),
    );
    const { result } = renderHook(() => useComments(1));
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toHaveLength(1);
  });

  it('empty — comments.length===0 → status="empty"', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ comments: [] }), { status: 200 }),
    );
    const { result } = renderHook(() => useComments(1));
    await waitFor(() => expect(result.current.status).toBe('empty'));
  });

  it('AbortController signal forwarded', () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
    renderHook(() => useComments(1));
    const initArg = vi.mocked(fetch).mock.calls[0][1] as RequestInit | undefined;
    expect(initArg?.signal).toBeInstanceOf(AbortSignal);
  });
});
