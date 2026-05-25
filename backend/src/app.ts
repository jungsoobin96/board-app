/**
 * Express app 조립 (M5 BE-router 진입점).
 * 미들웨어 등록 순서: cors → request-logger → routes → notFoundHandler → errorHandler.
 * routes는 후속 이슈 #4에서 articles/comments/tags 추가.
 */
import express from 'express';
import type { Env } from './env.js';
import { corsMiddleware } from './middleware/cors.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export function buildApp(env: Env): express.Application {
  const app = express();

  app.use(express.json());
  app.use(corsMiddleware(env.NODE_ENV));
  app.use(requestLogger(env.LOG_LEVEL));

  // 부팅 검증용 healthz — 09 LLD에 정식 등록은 후속 이슈
  app.get('/healthz', (_req, res) => {
    res.json({ ok: true });
  });

  // routes는 후속 이슈 #4에서 추가 (app.use('/api/articles', articlesRouter) 등)

  // 미등록 경로 + 에러 핸들링은 가장 마지막
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
