/**
 * 댓글 입력 검증 (M9 BE-validators). 09 §3 POST 댓글 body schema 정합.
 * 본 validator는 형식과 길이만. article 존재 검사는 service 레이어.
 */
import { ValidationError } from '../errors/validation-error.js';

export interface ParsedCommentInput {
  body: string;
  author: string;
}

const AUTHOR_MAX = 50;

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function validateCommentInput(input: unknown): ParsedCommentInput {
  if (input === null || typeof input !== 'object') {
    throw new ValidationError('VAL_BODY_REQUIRED', '요청 본문이 비어 있습니다');
  }
  const raw = input as Record<string, unknown>;

  const body = asString(raw.body).trim();
  const author = asString(raw.author).trim();

  if (body.length === 0) {
    throw new ValidationError('VAL_COMMENT_BODY_REQUIRED', '본문은 필수입니다');
  }
  if (author.length === 0) {
    throw new ValidationError('VAL_COMMENT_AUTHOR_REQUIRED', '작성자는 필수입니다');
  }
  if (author.length > AUTHOR_MAX) {
    throw new ValidationError('VAL_COMMENT_AUTHOR_TOO_LONG', '작성자는 50자 이하여야 합니다');
  }

  return { body, author };
}
