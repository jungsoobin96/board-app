/**
 * 통합 테스트 — 댓글 API 3 endpoint × happy/failure + cascade fan-in 회귀.
 * AC-01 ~ AC-06 매핑. Supertest로 실 buildApp(env) 사용.
 * 격리: beforeEach에 4 deleteMany (articles.integration 패턴 답습).
 * vitest.integration.config.ts: pool='forks' + singleFork + fileParallelism=false.
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { PrismaClient } from '@prisma/client';
import { buildApp } from '../../src/app.js';
import type { Env } from '../../src/env.js';

const prisma = new PrismaClient();
let app: Application;

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
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function seedArticle(): Promise<number> {
  const a = await prisma.article.create({
    data: { title: 't', body: 'b', author: 'a' },
  });
  return a.id;
}

describe('GET /api/articles/:id/comments', () => {
  it('AC-05: 댓글 2건 시드 → 200 + comments.length=2 (createdAt DESC)', async () => {
    const articleId = await seedArticle();
    await prisma.comment.create({
      data: { body: '첫 댓글', author: 'a', articleId },
    });
    // 시간 차이 보장 (createdAt DESC 검증)
    await new Promise((r) => setTimeout(r, 10));
    await prisma.comment.create({
      data: { body: '두 번째 댓글', author: 'b', articleId },
    });

    const res = await request(app).get(`/api/articles/${articleId}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.comments).toHaveLength(2);
    expect(res.body.comments[0].body).toBe('두 번째 댓글');
    expect(res.body.comments[1].body).toBe('첫 댓글');
    for (const c of res.body.comments) {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('articleId', articleId);
      expect(c).toHaveProperty('body');
      expect(c).toHaveProperty('author');
      expect(c).toHaveProperty('createdAt');
    }
  });

  it('AC-03a: article 미존재 → 404 + "글을 찾을 수 없습니다"', async () => {
    const res = await request(app).get('/api/articles/999/comments');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: '글을 찾을 수 없습니다' });
  });
});

describe('POST /api/articles/:id/comments', () => {
  it('AC-01: happy → 201 + id/articleId/body/author/createdAt 반환', async () => {
    const articleId = await seedArticle();
    const res = await request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send({ body: '재밌네요', author: 'min' });

    expect(res.status).toBe(201);
    expect(res.body.articleId).toBe(articleId);
    expect(res.body.body).toBe('재밌네요');
    expect(res.body.author).toBe('min');
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('createdAt');

    expect(await prisma.comment.count({ where: { articleId } })).toBe(1);
  });

  it('AC-04: 빈 body → 400 + "본문은 필수입니다"', async () => {
    const articleId = await seedArticle();
    const res = await request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send({ body: '', author: 'min' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: '본문은 필수입니다' });
  });

  it('AC-03b: article 미존재 → 404', async () => {
    const res = await request(app)
      .post('/api/articles/999/comments')
      .send({ body: '재밌네요', author: 'min' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: '글을 찾을 수 없습니다' });
  });
});

describe('DELETE /api/articles/:id/comments/:commentId', () => {
  it('AC-02: happy → 204 + DB count 0', async () => {
    const articleId = await seedArticle();
    const created = await prisma.comment.create({
      data: { body: 'gone', author: 'a', articleId },
    });

    const res = await request(app).delete(
      `/api/articles/${articleId}/comments/${created.id}`,
    );

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(await prisma.comment.count({ where: { id: created.id } })).toBe(0);
  });

  it('AC-03c: articleId mismatch → 404 + "댓글을 찾을 수 없습니다" + DB 미삭제', async () => {
    const articleA = await seedArticle();
    const articleB = await prisma.article.create({
      data: { title: 'B', body: 'B', author: 'B' },
    });
    const commentInB = await prisma.comment.create({
      data: { body: 'B comment', author: 'x', articleId: articleB.id },
    });

    const res = await request(app).delete(
      `/api/articles/${articleA}/comments/${commentInB.id}`,
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: '댓글을 찾을 수 없습니다' });
    expect(await prisma.comment.count({ where: { id: commentInB.id } })).toBe(1);
  });
});

describe('cascade fan-in 회귀 (comments 시점)', () => {
  it('AC-06: 글 + 댓글 3 → DELETE article → GET comments 404 + DB Comment count 0', async () => {
    const articleId = await seedArticle();
    await prisma.comment.createMany({
      data: [
        { body: 'c1', author: 'x', articleId },
        { body: 'c2', author: 'y', articleId },
        { body: 'c3', author: 'z', articleId },
      ],
    });
    expect(await prisma.comment.count({ where: { articleId } })).toBe(3);

    const deleteRes = await request(app).delete(`/api/articles/${articleId}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/api/articles/${articleId}/comments`);
    expect(getRes.status).toBe(404);
    expect(getRes.body).toEqual({ error: '글을 찾을 수 없습니다' });

    expect(await prisma.comment.count({ where: { articleId } })).toBe(0);
  });
});
