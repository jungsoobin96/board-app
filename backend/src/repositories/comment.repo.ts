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

/**
 * 글 단위 댓글 목록 조회 — 최신순 정렬.
 * 부모 글 존재 검사는 service 레이어 책임 (본 함수는 단순 fetch).
 */
export async function findManyByArticle(articleId: number): Promise<CommentRow[]> {
  return prisma.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * 단건 댓글 조회 — 미존재 시 null 반환 (throw는 service 레이어 책임).
 * delete 흐름에서 articleId mismatch 검사용으로 articleId 포함 row 반환.
 */
export async function findById(id: number): Promise<CommentRow | null> {
  return prisma.comment.findUnique({ where: { id } });
}

export interface InsertCommentArgs {
  articleId: number;
  body: string;
  author: string;
}

/**
 * 댓글 row 삽입 — 생성된 id만 반환. createdAt은 Prisma가 자동 처리.
 * 부모 글 외래키 제약은 DB가 강제 (orphan 방지).
 */
export async function insertComment(args: InsertCommentArgs): Promise<number> {
  const created = await prisma.comment.create({
    data: args,
    select: { id: true },
  });
  return created.id;
}

/**
 * 댓글 삭제 — articleId 일치 검사는 service 레이어가 선행한 뒤 호출.
 */
export async function deleteComment(id: number): Promise<void> {
  await prisma.comment.delete({ where: { id } });
}
