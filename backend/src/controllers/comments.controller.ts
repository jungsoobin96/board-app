/**
 * M6 BE-controllers — 댓글 도메인 HTTP 3 handler.
 * thin layer: 검증·service 호출 위임 + status 매핑 + 직렬화.
 * mergeParams=true 라우터에서 articleId·commentId를 path param으로 추출.
 */
import type { Request, RequestHandler, Response, NextFunction } from 'express';
import { validateCommentInput } from '../validators/comment.validator.js';
import { parsePathId } from '../validators/query.validator.js';
import * as service from '../services/comment.service.js';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

/**
 * 글 단위 댓글 목록 조회 — articleId 검증 후 service.list 호출, 작성 순으로 정렬된 배열 반환.
 */
export const listCommentsCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const articleId = parsePathId(req.params.articleId);
  const result = await service.list(articleId);
  res.status(200).json(result);
});

/**
 * 신규 댓글 작성 — articleId + body 검증(author·body) 후 service.create 호출, 201로 반환.
 * 부모 글 미존재 시 NOT_FOUND_ARTICLE throw.
 */
export const createCommentCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const articleId = parsePathId(req.params.articleId);
  const input = validateCommentInput(req.body);
  const comment = await service.create(articleId, input);
  res.status(201).json(comment);
});

/**
 * 댓글 삭제 — articleId + commentId 양쪽 검증 후 service.remove 호출, 204 No Content 반환.
 * 댓글이 해당 글에 속하지 않으면 NOT_FOUND_COMMENT throw.
 */
export const deleteCommentCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const articleId = parsePathId(req.params.articleId);
  const commentId = parsePathId(req.params.commentId);
  await service.remove(articleId, commentId);
  res.status(204).end();
});
