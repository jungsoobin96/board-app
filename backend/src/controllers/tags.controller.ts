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

export const listTagsCtrl: RequestHandler = asyncHandler(async (_req, res) => {
  const result = await service.list();
  res.status(200).json(result);
});
