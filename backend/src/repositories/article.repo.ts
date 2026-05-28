/**
 * M8 BE-repositories — 글 도메인 Prisma 호출 일원화.
 * tag·articleTag는 본 슬라이스에서 동일 파일에 통합 (#4 plan §5 결정 1).
 *
 * service 레이어는 Prisma transaction client(`tx`)를 인자로 주입.
 * 단일 호출(read)은 tx 미주입 시 module-level prisma singleton 사용.
 */
import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type Client = PrismaClient | Prisma.TransactionClient;

export interface ArticleRow {
  id: number;
  title: string;
  body: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

interface RawArticleWithTags {
  id: number;
  title: string;
  body: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  articleTags: { tag: { name: string } }[];
}

function mapRow(raw: RawArticleWithTags): ArticleRow {
  return {
    id: raw.id,
    title: raw.title,
    body: raw.body,
    author: raw.author,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    tags: raw.articleTags.map((at) => at.tag.name),
  };
}

export interface ListArgs {
  page: number;
  limit: number;
  tag: string | null;
}

export interface ListResult {
  rows: ArticleRow[];
  total: number;
}

/**
 * 글 목록 + 총 건수 동시 조회 — tag 필터·page·limit 적용, 최신순 정렬.
 * articleTags include로 태그 배열 동봉 (N+1 회피). count 병렬 실행으로 페이지 메타 한 번에 fetch.
 */
export async function findMany(args: ListArgs, client: Client = prisma): Promise<ListResult> {
  const { page, limit, tag } = args;
  const where: Prisma.ArticleWhereInput = tag
    ? { articleTags: { some: { tag: { name: tag } } } }
    : {};

  const [raws, total] = await Promise.all([
    client.article.findMany({
      where,
      include: { articleTags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    client.article.count({ where }),
  ]);

  return { rows: raws.map(mapRow), total };
}

/**
 * 단건 글 조회 — 미존재 시 null 반환 (throw는 service 레이어 책임).
 * articleTags include로 태그 배열 동봉.
 */
export async function findById(id: number, client: Client = prisma): Promise<ArticleRow | null> {
  const raw = await client.article.findUnique({
    where: { id },
    include: { articleTags: { include: { tag: true } } },
  });
  return raw ? mapRow(raw) : null;
}

export interface InsertArgs {
  title: string;
  body: string;
  author: string;
}

/**
 * 글 row 삽입 — 생성된 id만 반환. 태그 연결은 별도 호출(upsertTags + linkArticleTags)에 위임.
 */
export async function insertArticle(args: InsertArgs, client: Client): Promise<number> {
  const created = await client.article.create({ data: args, select: { id: true } });
  return created.id;
}

export interface UpdateArgs extends InsertArgs {
  id: number;
}

/**
 * 글 본문 수정 — title·body·author만 갱신, updatedAt은 Prisma가 자동 처리.
 * 태그 갱신은 별도 호출(unlinkArticleTags + linkArticleTags)에 위임.
 */
export async function updateArticle(args: UpdateArgs, client: Client): Promise<void> {
  await client.article.update({
    where: { id: args.id },
    data: { title: args.title, body: args.body, author: args.author },
  });
}

/**
 * 글 삭제 — Prisma cascade로 articleTags·comments 자동 연쇄 삭제 (08-lld §M8 정합).
 */
export async function deleteArticle(id: number, client: Client = prisma): Promise<void> {
  await client.article.delete({ where: { id } });
}

/**
 * 태그 이름 배열 → 태그 row 배열 (upsert로 멱등 보장).
 * 빈 배열 입력 시 빈 배열 반환. 같은 이름 동시 insert 충돌 회피용 upsert + 후속 findMany 패턴.
 */
export async function upsertTags(names: string[], client: Client): Promise<{ id: number; name: string }[]> {
  if (names.length === 0) return [];
  await Promise.all(
    names.map((name) =>
      client.tag.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      }),
    ),
  );
  return client.tag.findMany({ where: { name: { in: names } }, select: { id: true, name: true } });
}

/**
 * 글 ↔ 태그 다대다 연결 — articleTag 조인 row 일괄 insert.
 * 빈 배열 입력 시 no-op. 호출 전 unlinkArticleTags로 기존 연결 정리 필요(update 케이스).
 */
export async function linkArticleTags(
  articleId: number,
  tagIds: number[],
  client: Client,
): Promise<void> {
  if (tagIds.length === 0) return;
  await client.articleTag.createMany({
    data: tagIds.map((tagId) => ({ articleId, tagId })),
  });
}

/**
 * 글의 모든 태그 연결 해제 — articleTag 조인 row 일괄 삭제.
 * 글 수정 시 태그 교체 흐름의 1단계 (이어서 linkArticleTags 호출).
 */
export async function unlinkArticleTags(articleId: number, client: Client): Promise<void> {
  await client.articleTag.deleteMany({ where: { articleId } });
}
