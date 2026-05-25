/**
 * 리소스 조회 실패 에러.
 * code: 11 §2 PREFIX NOT_FOUND_* (예: NOT_FOUND_ARTICLE).
 * errorHandler 미들웨어가 HTTP 404로 직렬화.
 */
export class NotFoundError extends Error {
  readonly code: string;
  readonly httpStatus = 404 as const;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.code = code;
  }
}
