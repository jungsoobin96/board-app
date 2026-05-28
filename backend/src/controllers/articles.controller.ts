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

/**
 * 글 목록 조회 — page·limit·tag 쿼리를 파싱해 service.list에 위임하고 200으로 직렬화한다.
 * 페이지·태그 검증 실패 시 throw → M10 errorHandler가 4xx 매핑.
 */
export const listArticlesCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const args = parseListQuery(req.query as Record<string, unknown>);
  const result = await service.list(args);
  res.status(200).json(result);
});

/**
 * 단건 글 조회 — path id 검증 후 service.get 호출, 미존재 시 NOT_FOUND_ARTICLE throw.
 */
export const getArticleCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const id = parsePathId(req.params.id);
  const article = await service.get(id);
  res.status(200).json(article);
});

/**
 * 신규 글 생성 — body 검증(title·body·author·tags) 후 service.create 호출, 생성된 글을 201로 반환.
 */
export const createArticleCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const input = validateArticleInput(req.body);
  const article = await service.create(input);
  res.status(201).json(article);
});

/**
 * 글 수정 — path id + body 검증 후 service.update 호출, 갱신된 글을 200으로 반환.
 * 존재하지 않으면 NOT_FOUND_ARTICLE throw.
 */
export const updateArticleCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const id = parsePathId(req.params.id);
  const input = validateArticleInput(req.body);
  const article = await service.update(id, input);
  res.status(200).json(article);
});

/**
 * 글 삭제 — path id 검증 후 service.remove 호출(연관 댓글·태그 cascade), 204 No Content 반환.
 */
export const deleteArticleCtrl: RequestHandler = asyncHandler(async (req, res) => {
  const id = parsePathId(req.params.id);
  await service.remove(id);
  res.status(204).end();
});
