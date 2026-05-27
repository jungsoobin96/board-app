/**
 * Response → NormalizedError 변환.
 * - 2xx: throw 없음 (호출처가 .json() 진행)
 * - 4xx/5xx with {error}: NormalizedError(status, body.error)
 * - 4xx/5xx body parse 실패: NormalizedError(status, '서버 응답을 처리할 수 없습니다')
 * - offline (fetch reject): NormalizedError(0, '네트워크 오류')
 */
import { NormalizedError, type ApiErrorBody } from '@app/shared';

const FALLBACK_MESSAGE = '서버 응답을 처리할 수 없습니다';
const NETWORK_MESSAGE = '네트워크 오류';

export async function normalizeResponse(res: Response): Promise<never> {
  let message: string = FALLBACK_MESSAGE;
  try {
    const body = (await res.json()) as ApiErrorBody;
    if (body && typeof body.error === 'string' && body.error.length > 0) {
      message = body.error;
    }
  } catch {
    // body parse 실패 — fallback message 유지
  }
  throw new NormalizedError(res.status, message);
}

export function normalizeNetworkError(_err: unknown): NormalizedError {
  return new NormalizedError(0, NETWORK_MESSAGE);
}
