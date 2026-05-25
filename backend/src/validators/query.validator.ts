/**
 * 쿼리·path id 검증 (M9 BE-validators). 09 §3 GET list / path param 정합.
 */
import { ValidationError } from '../errors/validation-error.js';

export interface ParsedListQuery {
  page: number;
  limit: number;
  tag: string | null;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parseIntStrict(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const s = String(value);
  if (!/^-?\d+$/.test(s)) {
    return NaN;
  }
  return Number(s);
}

export function parseListQuery(query: Record<string, unknown>): ParsedListQuery {
  const page = parseIntStrict(query.page, DEFAULT_PAGE);
  const limit = parseIntStrict(query.limit, DEFAULT_LIMIT);

  if (!Number.isInteger(page) || page < 1) {
    throw new ValidationError('VAL_QUERY_PAGE_INVALID', '잘못된 페이지/리미트 값입니다');
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new ValidationError('VAL_QUERY_LIMIT_INVALID', '잘못된 페이지/리미트 값입니다');
  }

  const tagRaw = query.tag;
  const tag =
    typeof tagRaw === 'string' && tagRaw.trim().length > 0
      ? tagRaw.trim().toLowerCase()
      : null;

  return { page, limit, tag };
}

export function parsePathId(value: unknown): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new ValidationError('VAL_PATH_ID_INVALID', '잘못된 ID 형식입니다');
  }
  return Number(value);
}
