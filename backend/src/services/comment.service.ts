/**
 * M7 BE-services — 댓글 도메인 비즈니스 규칙.
 * - list/create: article 존재 검사 후 위임 (article 미존재 → NotFoundError "글을 찾을 수 없습니다")
 * - remove: comment 존재 + articleId mismatch 검사 (둘 다 "댓글을 찾을 수 없습니다")
 *
 * article.repo.findById 재사용 (article.service.get 우회 — 후자는 글 메시지로 throw하지만
 * 본 서비스도 같은 메시지가 필요해 합리. 코드 명확성 우선).
 */
import { NotFoundError } from '../errors/not-found-error.js';
import * as articleRepo from '../repositories/article.repo.js';
import * as commentRepo from '../repositories/comment.repo.js';
import type { CommentRow } from '../repositories/comment.repo.js';

export interface ListResult {
  comments: CommentRow[];
}

export async function list(articleId: number): Promise<ListResult> {
  const article = await articleRepo.findById(articleId);
  if (!article) {
    throw new NotFoundError('NOT_FOUND_ARTICLE', '글을 찾을 수 없습니다');
  }
  const comments = await commentRepo.findManyByArticle(articleId);
  return { comments };
}

export interface CreateInput {
  body: string;
  author: string;
}

export async function create(articleId: number, input: CreateInput): Promise<CommentRow> {
  const article = await articleRepo.findById(articleId);
  if (!article) {
    throw new NotFoundError('NOT_FOUND_ARTICLE', '글을 찾을 수 없습니다');
  }
  const newId = await commentRepo.insertComment({
    articleId,
    body: input.body,
    author: input.author,
  });
  const row = await commentRepo.findById(newId);
  if (!row) {
    throw new Error('REPO_INSERT_RACE');
  }
  return row;
}

export async function remove(articleId: number, commentId: number): Promise<void> {
  const comment = await commentRepo.findById(commentId);
  if (!comment || comment.articleId !== articleId) {
    throw new NotFoundError('NOT_FOUND_COMMENT', '댓글을 찾을 수 없습니다');
  }
  await commentRepo.deleteComment(commentId);
}
