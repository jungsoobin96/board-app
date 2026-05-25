/**
 * 사용자 입력 검증 실패 에러.
 * code: 11 §2 PREFIX VAL_* (예: VAL_TITLE_REQUIRED, VAL_BODY_REQUIRED).
 * errorHandler 미들웨어가 HTTP 400으로 직렬화.
 */
export class ValidationError extends Error {
  readonly code: string;
  readonly httpStatus = 400 as const;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
  }
}
