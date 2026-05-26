/**
 * 통합 회귀 — R-N-02 에러 schema 통일 (M10 errorHandler).
 * 9 endpoint × ~2 에러 케이스 + notFoundHandler + 의도 throw 500.
 * 모든 4xx/5xx 응답이 `{error:string}` schema + stack/code 미노출.
 * 단위 errorHandler.test.ts(#2)와는 *층위 분리* — 본 파일은 실 buildApp + 실 SQLite + 실 endpoint flow.
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { PrismaClient } from '@prisma/client';

// 의도 throw 케이스를 위한 module-level mock — 다른 케이스는 실 service 사용
// vi.mock은 hoisted라 import 전 위치 무관
vi.mock('../../src/services/tag.service.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/services/tag.service.js')>();
  return {
    ...actual,
    list: vi.fn(actual.list),
  };
});

import { buildApp } from '../../src/app.js';
import type { Env } from '../../src/env.js';
import * as tagService from '../../src/services/tag.service.js';

const prisma = new PrismaClient();
let app: Application;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  const env: Env = {
    PORT: 0,
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',
  };
  app = buildApp(env);
});

beforeEach(async () => {
  await prisma.$transaction([
    prisma.articleTag.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.article.deleteMany(),
    prisma.tag.deleteMany(),
  ]);
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
  vi.mocked(tagService.list).mockImplementation(
    (vi.mocked(tagService.list) as unknown as { getMockImplementation(): typeof tagService.list }).getMockImplementation() ??
      (async () => ({ tags: [] })),
  );
});

afterAll(async () => {
  await prisma.$disconnect();
  vi.restoreAllMocks();
});

/**
 * 공통 schema assertion — `{error:string}` 형식 + stack/code 노출 0.
 */
function expectErrorSchema(body: unknown, expectedMessage: string): void {
  expect(body).toEqual({ error: expectedMessage });
  expect(body).not.toHaveProperty('stack');
  expect(body).not.toHaveProperty('code');
}

describe('Articles errors (4xx)', () => {
  it('AC-01a: GET /api/articles?page=-1 → 400 + "잘못된 페이지/리미트 값입니다"', async () => {
    const res = await request(app).get('/api/articles?page=-1');
    expect(res.status).toBe(400);
    expectErrorSchema(res.body, '잘못된 페이지/리미트 값입니다');
  });

  it('AC-01b: GET /api/articles/abc → 400 + "잘못된 ID 형식입니다"', async () => {
    const res = await request(app).get('/api/articles/abc');
    expect(res.status).toBe(400);
    expectErrorSchema(res.body, '잘못된 ID 형식입니다');
  });

  it('AC-01c: GET /api/articles/999 → 404 + "글을 찾을 수 없습니다"', async () => {
    const res = await request(app).get('/api/articles/999');
    expect(res.status).toBe(404);
    expectErrorSchema(res.body, '글을 찾을 수 없습니다');
  });

  it('AC-01d: POST /api/articles {} → 400 + "제목은 필수입니다"', async () => {
    const res = await request(app).post('/api/articles').send({});
    expect(res.status).toBe(400);
    expectErrorSchema(res.body, '제목은 필수입니다');
  });

  it('AC-01e: PUT /api/articles/999 → 404 + "글을 찾을 수 없습니다"', async () => {
    const res = await request(app)
      .put('/api/articles/999')
      .send({ title: 't', body: 'b', author: 'a', tagList: [] });
    expect(res.status).toBe(404);
    expectErrorSchema(res.body, '글을 찾을 수 없습니다');
  });

  it('AC-01f: DELETE /api/articles/999 → 404 + "글을 찾을 수 없습니다"', async () => {
    const res = await request(app).delete('/api/articles/999');
    expect(res.status).toBe(404);
    expectErrorSchema(res.body, '글을 찾을 수 없습니다');
  });
});

describe('Comments errors (4xx)', () => {
  it('AC-01g: GET /api/articles/999/comments → 404 + "글을 찾을 수 없습니다"', async () => {
    const res = await request(app).get('/api/articles/999/comments');
    expect(res.status).toBe(404);
    expectErrorSchema(res.body, '글을 찾을 수 없습니다');
  });

  it('AC-01h: POST /api/articles/1/comments {} → 400 + "본문은 필수입니다"', async () => {
    const article = await prisma.article.create({
      data: { title: 't', body: 'b', author: 'a' },
    });
    const res = await request(app)
      .post(`/api/articles/${article.id}/comments`)
      .send({});
    expect(res.status).toBe(400);
    expectErrorSchema(res.body, '본문은 필수입니다');
  });

  it('AC-01i: POST /api/articles/999/comments → 404 + "글을 찾을 수 없습니다"', async () => {
    const res = await request(app)
      .post('/api/articles/999/comments')
      .send({ body: 'hi', author: 'a' });
    expect(res.status).toBe(404);
    expectErrorSchema(res.body, '글을 찾을 수 없습니다');
  });

  it('AC-01j: DELETE articleId mismatch → 404 + "댓글을 찾을 수 없습니다"', async () => {
    const articleA = await prisma.article.create({
      data: { title: 'A', body: 'A', author: 'A' },
    });
    const articleB = await prisma.article.create({
      data: { title: 'B', body: 'B', author: 'B' },
    });
    const commentInB = await prisma.comment.create({
      data: { body: 'B comment', author: 'x', articleId: articleB.id },
    });

    const res = await request(app).delete(
      `/api/articles/${articleA.id}/comments/${commentInB.id}`,
    );
    expect(res.status).toBe(404);
    expectErrorSchema(res.body, '댓글을 찾을 수 없습니다');
  });
});

describe('notFoundHandler (404)', () => {
  it('AC-03: 미등록 path → 404 + "요청한 리소스를 찾을 수 없습니다"', async () => {
    const res = await request(app).get('/nonexistent-path');
    expect(res.status).toBe(404);
    expectErrorSchema(res.body, '요청한 리소스를 찾을 수 없습니다');
  });
});

describe('의도 throw → 500 fallback (R-N-02 SRV_INTERNAL)', () => {
  it('AC-02: GET /api/tags에 throw 주입 → 500 + 일반 메시지 + body에 stack 없음 + stderr에 [SRV_INTERNAL] 출력', async () => {
    vi.mocked(tagService.list).mockImplementationOnce(async () => {
      throw new Error('unexpected internal failure for test');
    });

    const res = await request(app).get('/api/tags');

    expect(res.status).toBe(500);
    expectErrorSchema(res.body, '서버 오류가 발생했습니다');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[SRV_INTERNAL]'),
    );
  });
});
