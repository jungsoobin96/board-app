/**
 * useArticles — listArticles 호출 + 5상태 + AbortController.
 * AbortController cleanup으로 페이지 빠른 클릭 시 이전 요청 취소 (메모리 leak 회피, FE-HP-RISK-02).
 */
import { useEffect, useState } from 'react';
import type { Article, ListResult } from '@app/shared';
import { NormalizedError } from '@app/shared';
import { listArticles } from '../api/client';

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface UseArticlesArgs {
  page: number;
  limit: number;
  tag: string | null;
}

export interface UseArticlesState {
  status: FetchStatus;
  data: ListResult<Article> | null;
  error: NormalizedError | null;
}

const initialState: UseArticlesState = { status: 'idle', data: null, error: null };

export function useArticles(args: UseArticlesArgs): UseArticlesState {
  const [state, setState] = useState<UseArticlesState>(initialState);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', data: null, error: null });

    listArticles(
      { page: args.page, limit: args.limit, tag: args.tag ?? undefined },
      { signal: controller.signal },
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.articles.length === 0) {
          setState({ status: 'empty', data: result, error: null });
        } else {
          setState({ status: 'success', data: result, error: null });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof NormalizedError) {
          setState({ status: 'error', data: null, error: err });
        } else {
          setState({
            status: 'error',
            data: null,
            error: new NormalizedError(0, '알 수 없는 오류'),
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [args.page, args.limit, args.tag]);

  return state;
}
