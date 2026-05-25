/**
 * 통합 에러 핸들러 미들웨어 (M10 BE-error).
 * R-N-02 정합: 모든 4xx/5xx 응답은 `{ "error": "<한국어 메시지>" }` 형식만.
 *              stack·내부 code는 응답에 노출 금지 (stderr에만 출력).
 *
 * 분기 정책 (11 §2 PREFIX):
 * - ValidationError → 400 (VAL_*)
 * - NotFoundError   → 404 (NOT_FOUND_*)
 * - RepositoryError → 500 (REPO_*, 사용자 친화 메시지)
 * - 기본 Error      → 500 (SRV_INTERNAL, 메시지는 "서버 오류가 발생했습니다")
 */
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ValidationError } from '../errors/validation-error.js';
import { NotFoundError } from '../errors/not-found-error.js';
import { RepositoryError } from '../errors/repository-error.js';

/**
 * 라우트가 처리하지 않은 모든 경로 → NotFoundError 변환.
 * routes 등록 후 errorHandler 직전에 등록.
 */
export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new NotFoundError('NOT_FOUND_ROUTE', '요청한 리소스를 찾을 수 없습니다'));
};

/**
 * Express ErrorRequestHandler — 인자 4개 시그니처 강제.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    console.error(`[${err.code}] ${err.message}`);
    res.status(err.httpStatus).json({ error: err.message });
    return;
  }
  if (err instanceof NotFoundError) {
    console.error(`[${err.code}] ${err.message}`);
    res.status(err.httpStatus).json({ error: err.message });
    return;
  }
  if (err instanceof RepositoryError) {
    console.error(`[${err.code}] ${err.message}`);
    res.status(err.httpStatus).json({ error: err.message });
    return;
  }
  // 기본 Error fallback — 사용자에게는 친화 메시지, 운영 디버깅은 stderr stack
  const stack = err instanceof Error ? err.stack : String(err);
  console.error(`[SRV_INTERNAL] ${stack}`);
  res.status(500).json({ error: '서버 오류가 발생했습니다' });
};
