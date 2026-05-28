/**
 * M7 BE-services — 태그 도메인 비즈니스 규칙.
 * - list: 상한 20 적용 + response shape 매핑.
 * 09 §3 GET /api/tags 정합 — `{ tags: [{name, count}, ...] }`.
 */
import * as repo from '../repositories/tag.repo.js';
import type { TagRow } from '../repositories/tag.repo.js';

const DEFAULT_LIMIT = 20;

export interface ListResult {
  tags: TagRow[];
}

/**
 * 인기 태그 목록 조회 — 사용 횟수 내림차순 상위 limit개 fetch (기본 20).
 * 응답 shape `{ tags: [{name, count}, ...] }`는 09 §3 GET /api/tags 정합.
 */
export async function list(limit: number = DEFAULT_LIMIT): Promise<ListResult> {
  const tags = await repo.findManyByFrequency(limit);
  return { tags };
}
