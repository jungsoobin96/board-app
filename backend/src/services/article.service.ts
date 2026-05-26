/**
 * M7 BE-services — 글 도메인 비즈니스 규칙.
 * - normalizeTags: trim·lower·중복 제거·빈 토큰 무시
 * - paginate: page/limit/total 메타
 * - withTransaction: Prisma $transaction wrapper
 * - get/update/delete가 NotFoundError throw (R-N-02 정합)
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../errors/not-found-error.js';
import * as repo from '../repositories/article.repo.js';
import type { ArticleRow } from '../repositories/article.repo.js';

export interface ListResultDto {
  articles: ArticleRow[];
  total: number;
  page: number;
  limit: number;
}

export function normalizeTags(input: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of input) {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed.length === 0) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

/** Prisma $transaction wrapper. 단위 테스트에서 mock 가능. */
export function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(callback);
}

export async function list(args: {
  page: number;
  limit: number;
  tag: string | null;
}): Promise<ListResultDto> {
  const { rows, total } = await repo.findMany(args);
  return { articles: rows, total, page: args.page, limit: args.limit };
}

export async function get(id: number): Promise<ArticleRow> {
  const row = await repo.findById(id);
  if (!row) {
    throw new NotFoundError('NOT_FOUND_ARTICLE', '글을 찾을 수 없습니다');
  }
  return row;
}

export interface CreateInput {
  title: string;
  body: string;
  author: string;
  tagList: string[];
}

export async function create(input: CreateInput): Promise<ArticleRow> {
  const tags = normalizeTags(input.tagList);
  const newId = await withTransaction(async (tx) => {
    const id = await repo.insertArticle(
      { title: input.title, body: input.body, author: input.author },
      tx,
    );
    if (tags.length > 0) {
      const tagRows = await repo.upsertTags(tags, tx);
      await repo.linkArticleTags(
        id,
        tagRows.map((t) => t.id),
        tx,
      );
    }
    return id;
  });

  const row = await repo.findById(newId);
  if (!row) {
    throw new Error('REPO_INSERT_RACE');
  }
  return row;
}

export async function update(id: number, input: CreateInput): Promise<ArticleRow> {
  const existing = await repo.findById(id);
  if (!existing) {
    throw new NotFoundError('NOT_FOUND_ARTICLE', '글을 찾을 수 없습니다');
  }
  const tags = normalizeTags(input.tagList);
  await withTransaction(async (tx) => {
    await repo.updateArticle(
      { id, title: input.title, body: input.body, author: input.author },
      tx,
    );
    await repo.unlinkArticleTags(id, tx);
    if (tags.length > 0) {
      const tagRows = await repo.upsertTags(tags, tx);
      await repo.linkArticleTags(
        id,
        tagRows.map((t) => t.id),
        tx,
      );
    }
  });

  const row = await repo.findById(id);
  if (!row) {
    throw new NotFoundError('NOT_FOUND_ARTICLE', '글을 찾을 수 없습니다');
  }
  return row;
}

export async function remove(id: number): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) {
    throw new NotFoundError('NOT_FOUND_ARTICLE', '글을 찾을 수 없습니다');
  }
  await repo.deleteArticle(id);
}
