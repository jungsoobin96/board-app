/**
 * 영속화 계층(M8 BE-repositories) 실패 에러.
 * code: 11 §2 PREFIX REPO_* (예: REPO_INSERT_FAILED).
 * errorHandler 미들웨어가 HTTP 500으로 직렬화 (사용자 친화 메시지만).
 */
export class RepositoryError extends Error {
  readonly code: string;
  readonly httpStatus = 500 as const;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
  }
}
