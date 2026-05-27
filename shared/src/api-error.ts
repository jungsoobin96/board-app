/**
 * NormalizedError — frontend api-client가 4xx/5xx/offline 모든 에러를 단일 class로 정규화.
 * R-N-02 정합: backend 응답 `{error:string}` schema → status + message.
 * - 2xx: throw 없음
 * - 4xx/5xx with `{error: string}` body: NormalizedError(status, body.error)
 * - 4xx/5xx body parse 실패: NormalizedError(status, '서버 응답을 처리할 수 없습니다')
 * - offline (fetch reject): NormalizedError(0, '네트워크 오류')
 */
export class NormalizedError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'NormalizedError';
    this.status = status;
  }
}

export interface ApiErrorBody {
  error: string;
}
