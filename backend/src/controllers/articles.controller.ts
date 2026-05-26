/**
 * M6 BE-controllers — 글 도메인 HTTP 5 handler.
 * thin layer: 검증·service 호출 위임 + status 매핑 + 직렬화.
 * 도메인 에러는 throw로 next(err) 위임 — M10 errorHandler가 처리.
 */
import type { Request, RequestHandler, Response, NextFunction } from 'express';
import { validateArticleInput } from '../validators/article.validator.js';
import { parseListQuery, parsePathId } from '../validators/query.validator.js';
import * as service from '../services/article.service.js';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export const listArticlesCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const args = parseListQuery(req.query as Record<string, unknown>);
  const result = await service.list(args);
  res.status(200).json(result);
});

export const getArticleCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const id = parsePathId(req.params.id);
  const article = await service.get(id);
  res.status(200).json(article);
});

export const createArticleCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const input = validateArticleInput(req.body);
  const article = await service.create(input);
  res.status(201).json(article);
});

export const updateArticleCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const id = parsePathId(req.params.id);
  const input = validateArticleInput(req.body);
  const article = await service.update(id, input);
  res.status(200).json(article);
});

export const deleteArticleCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const id = parsePathId(req.params.id);
  await service.remove(id);
  res.status(204).end();
});
