/**
 * Tag DTO — 09 §3 GET /api/tags 응답 schema 정합.
 * count는 articleTags 관계 _count (Prisma).
 */
export interface Tag {
  name: string;
  count: number;
}

export interface TagListResult {
  tags: Tag[];
}
