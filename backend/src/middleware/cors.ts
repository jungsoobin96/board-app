/**
 * 개발용 CORS 미들웨어.
 * dev profile만 모든 origin 허용. stg/prod는 no-op (단일 환경 운영 가정 — ADR-0037).
 * frontend가 dev 부팅 시 localhost:5173 → backend 3000 호출 가능하게.
 */
import type { RequestHandler } from 'express';

export function corsMiddleware(nodeEnv: 'dev' | 'stg' | 'prod'): RequestHandler {
  return (req, res, next) => {
    if (nodeEnv === 'dev') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
      }
    }
    next();
  };
}
