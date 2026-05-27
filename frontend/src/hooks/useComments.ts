/**
 * useComments — listComments(articleId) 호출 + 5상태 + AbortController signal forwarded.
 * comments.length===0 → status='empty'.
 */
import { useEffect, useState } from 'react';
import type { Comment } from '@app/shared';
import { NormalizedError } from '@app/shared';
import { listComments } from '../api/client';
import type { FetchStatus } from './useArticles';

export interface UseCommentsState {
  status: FetchStatus;
  data: Comment[] | null;
  error: NormalizedError | null;
}

const initialState: UseCommentsState = { status: 'idle', data: null, error: null };

export function useComments(articleId: number): UseCommentsState {
  const [state, setState] = useState<UseCommentsState>(initialState);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', data: null, error: null });

    listComments(articleId, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        const status: FetchStatus = result.comments.length === 0 ? 'empty' : 'success';
        setState({ status, data: result.comments, error: null });
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
  }, [articleId]);

  return state;
}
