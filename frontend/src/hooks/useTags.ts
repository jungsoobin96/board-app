/**
 * useTags — listTags 호출 + 5상태.
 * AbortController는 useArticles와 동일 패턴.
 */
import { useEffect, useState } from 'react';
import type { Tag } from '@app/shared';
import { NormalizedError } from '@app/shared';
import { listTags } from '../api/client';
import type { FetchStatus } from './useArticles';

export interface UseTagsState {
  status: FetchStatus;
  data: Tag[] | null;
  error: NormalizedError | null;
}

const initialState: UseTagsState = { status: 'idle', data: null, error: null };

export function useTags(): UseTagsState {
  const [state, setState] = useState<UseTagsState>(initialState);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', data: null, error: null });

    listTags({ signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.tags.length === 0) {
          setState({ status: 'empty', data: result.tags, error: null });
        } else {
          setState({ status: 'success', data: result.tags, error: null });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const error =
          err instanceof NormalizedError
            ? err
            : new NormalizedError(0, '알 수 없는 오류');
        setState({ status: 'error', data: null, error });
      });

    return () => {
      controller.abort();
    };
  }, []);

  return state;
}
