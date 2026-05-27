/**
 * useArticle — getArticle(id) 호출 + 5상태 + AbortController signal forwarded.
 * 404 → status='error' + err.status=404 (Article 페이지에서 NotFound 분기용).
 */
import { useEffect, useState } from 'react';
import type { Article } from '@app/shared';
import { NormalizedError } from '@app/shared';
import { getArticle } from '../api/client';
import type { FetchStatus } from './useArticles';

export interface UseArticleState {
  status: FetchStatus;
  data: Article | null;
  error: NormalizedError | null;
}

const initialState: UseArticleState = { status: 'idle', data: null, error: null };

export function useArticle(id: number): UseArticleState {
  const [state, setState] = useState<UseArticleState>(initialState);

  useEffect(() => {
    // id invalid (호출처에서 -1 등 guard) → fetch 자체 skip
    if (id < 1) return;

    const controller = new AbortController();
    setState({ status: 'loading', data: null, error: null });

    getArticle(id, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setState({ status: 'success', data: result, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const error =
          err instanceof NormalizedError ? err : new NormalizedError(0, '알 수 없는 오류');
        setState({ status: 'error', data: null, error });
      });

    return () => {
      controller.abort();
    };
  }, [id]);

  return state;
}
