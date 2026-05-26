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

export const listCommentsCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const articleId = parsePathId(req.params.articleId);
  const result = await service.list(articleId);
  res.status(200).json(result);
});

export const createCommentCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const articleId = parsePathId(req.params.articleId);
  const input = validateCommentInput(req.body);
  const comment = await service.create(articleId, input);
  res.status(201).json(comment);
});

export const deleteCommentCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const articleId = parsePathId(req.params.articleId);
  const commentId = parsePathId(req.params.commentId);
  await service.remove(articleId, commentId);
  res.status(204).end();
});
