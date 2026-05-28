/**
 * M6 BE-controllers — 태그 도메인 HTTP 1 handler.
 * thin layer: service 호출 위임 + 200 응답.
 */
import type { Request, RequestHandler, Response, NextFunction } from 'express';
import * as service from '../services/tag.service.js';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

/**
 * 인기 태그 목록 조회 — service.list 호출, 사용 횟수 내림차순 상위 N개 반환(사이드바 노출용).
 */
export const listTagsCtrl: RequestHandler = asyncHandler(async (_req, res) => {
  const result = await service.list();
  res.status(200).json(result);
});
