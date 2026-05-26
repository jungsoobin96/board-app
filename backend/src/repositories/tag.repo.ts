/**
 * M8 BE-repositories — 태그 도메인 Prisma 호출 일원화.
 * 09 §3 GET /api/tags 빈도 desc + 상한 20 정렬 (Prisma `_count.articleTags`).
 */
import { prisma } from '../lib/prisma.js';

export interface TagRow {
  name: string;
  count: number;
}

export async function findManyByFrequency(limit: number): Promise<TagRow[]> {
  const rows = await prisma.tag.findMany({
    select: {
      name: true,
      _count: { select: { articleTags: true } },
    },
    orderBy: { articleTags: { _count: 'desc' } },
    take: limit,
  });
  return rows.map((r) => ({ name: r.name, count: r._count.articleTags }));
}
