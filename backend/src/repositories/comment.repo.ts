/**
 * M8 BE-repositories — 댓글 도메인 Prisma 호출 일원화.
 * 단일 row 작업뿐이라 트랜잭션 wrapper 불필요 (article.repo의 withTransaction과 대조).
 *
 * service 레이어는 prisma singleton을 통한 단순 호출. tx 주입 없음.
 */
import { prisma } from '../lib/prisma.js';

export interface CommentRow {
  id: number;
  articleId: number;
  body: string;
  author: string;
  createdAt: Date;
}

export async function findManyByArticle(articleId: number): Promise<CommentRow[]> {
  return prisma.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findById(id: number): Promise<CommentRow | null> {
  return prisma.comment.findUnique({ where: { id } });
}

export interface InsertCommentArgs {
  articleId: number;
  body: string;
  author: string;
}

export async function insertComment(args: InsertCommentArgs): Promise<number> {
  const created = await prisma.comment.create({
    data: args,
    select: { id: true },
  });
  return created.id;
}

export async function deleteComment(id: number): Promise<void> {
  await prisma.comment.delete({ where: { id } });
}
