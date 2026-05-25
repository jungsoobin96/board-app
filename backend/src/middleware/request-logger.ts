/**
 * 요청 로깅 미들웨어.
 * 1줄 형식: [METHOD] /path STATUS DURATIONms
 * dev profile: 모든 요청. stg/prod: LOG_LEVEL=info 이상에서 4xx/5xx만.
 */
import type { RequestHandler } from 'express';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function requestLogger(logLevel: LogLevel): RequestHandler {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const isError = res.statusCode >= 400;
      const shouldLog = logLevel === 'debug' || (logLevel === 'info' && isError) || isError;
      if (shouldLog) {
        // 운영에서 stdout 단일 라인 (구조화 로깅은 후속 이슈에서 pino 검토)
        console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
      }
    });
    next();
  };
}
