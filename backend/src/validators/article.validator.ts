/**
 * 글 입력 검증 (M9 BE-validators). 09 §3 POST/PUT body schema 정합.
 * 정규화는 service `normalizeTags()`에서. 본 validator는 *형식*과 *길이*만.
 */
import { ValidationError } from '../errors/validation-error.js';

export interface ParsedArticleInput {
  title: string;
  body: string;
  author: string;
  tagList: string[];
}

const TITLE_MAX = 200;
const AUTHOR_MAX = 50;

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function validateArticleInput(input: unknown): ParsedArticleInput {
  if (input === null || typeof input !== 'object') {
    throw new ValidationError('VAL_BODY_REQUIRED', '요청 본문이 비어 있습니다');
  }
  const raw = input as Record<string, unknown>;

  const title = asString(raw.title).trim();
  const body = asString(raw.body).trim();
  const author = asString(raw.author).trim();

  if (title.length === 0) {
    throw new ValidationError('VAL_TITLE_REQUIRED', '제목은 필수입니다');
  }
  if (title.length > TITLE_MAX) {
    throw new ValidationError('VAL_TITLE_TOO_LONG', '제목은 200자 이하여야 합니다');
  }
  if (body.length === 0) {
    throw new ValidationError('VAL_BODY_REQUIRED_FIELD', '본문은 필수입니다');
  }
  if (author.length === 0) {
    throw new ValidationError('VAL_AUTHOR_REQUIRED', '작성자는 필수입니다');
  }
  if (author.length > AUTHOR_MAX) {
    throw new ValidationError('VAL_AUTHOR_TOO_LONG', '작성자는 50자 이하여야 합니다');
  }

  const tagListRaw = raw.tagList;
  if (tagListRaw !== undefined && !Array.isArray(tagListRaw)) {
    throw new ValidationError('VAL_TAGLIST_INVALID', '태그 목록은 배열이어야 합니다');
  }
  const tagList: string[] = Array.isArray(tagListRaw)
    ? tagListRaw.map((t) => asString(t))
    : [];

  return { title, body, author, tagList };
}
