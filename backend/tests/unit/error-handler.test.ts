/**
 * errorHandler 미들웨어 단위 테스트.
 * R-N-02 검증: 모든 분기에서 `{ error }` schema + stack 응답 누락.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { errorHandler, notFoundHandler } from '../../src/middleware/error-handler.js';
import { ValidationError } from '../../src/errors/validation-error.js';
import { NotFoundError } from '../../src/errors/not-found-error.js';
import { RepositoryError } from '../../src/errors/repository-error.js';

function buildApp(handler: express.RequestHandler) {
  const app = express();
  app.get('/test', handler);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('ValidationError → 400 + 한국어 메시지 (R-N-02)', async () => {
    const app = buildApp((_req, _res, next) => {
      next(new ValidationError('VAL_TITLE_REQUIRED', '제목은 필수입니다'));
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: '제목은 필수입니다' });
    expect(res.body).not.toHaveProperty('stack');
    expect(res.body).not.toHaveProperty('code');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[VAL_TITLE_REQUIRED]'));
  });

  it('NotFoundError → 404 + 한국어 메시지', async () => {
    const app = buildApp((_req, _res, next) => {
      next(new NotFoundError('NOT_FOUND_ARTICLE', '글을 찾을 수 없습니다'));
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: '글을 찾을 수 없습니다' });
  });

  it('RepositoryError → 500 + 한국어 메시지', async () => {
    const app = buildApp((_req, _res, next) => {
      next(new RepositoryError('REPO_INSERT_FAILED', 'DB 저장에 실패했습니다'));
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'DB 저장에 실패했습니다' });
  });

  it('기본 Error → 500 + SRV_INTERNAL fallback + stack stderr만', async () => {
    const app = buildApp((_req, _res, next) => {
      next(new Error('unexpected internal failure'));
    });
    const res = await request(app).get('/test');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: '서버 오류가 발생했습니다' });
    expect(res.body).not.toHaveProperty('stack');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[SRV_INTERNAL]'));
  });

  it('미등록 경로 → notFoundHandler → 404 + 한국어 메시지', async () => {
    const app = buildApp((_req, res) => {
      res.json({ ok: true });
    });
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: '요청한 리소스를 찾을 수 없습니다' });
  });
});
