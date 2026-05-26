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

export async function insertArticle(args: InsertArgs, client: Client): Promise<number> {
  const created = await client.article.create({ data: args, select: { id: true } });
  return created.id;
}

export interface UpdateArgs extends InsertArgs {
  id: number;
}

export async function updateArticle(args: UpdateArgs, client: Client): Promise<void> {
  await client.article.update({
    where: { id: args.id },
    data: { title: args.title, body: args.body, author: args.author },
  });
}

export async function deleteArticle(id: number, client: Client = prisma): Promise<void> {
  await client.article.delete({ where: { id } });
}

/** tag names → tag rows (upsert로 멱등). */
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

export async function unlinkArticleTags(articleId: number, client: Client): Promise<void> {
  await client.articleTag.deleteMany({ where: { articleId } });
}
