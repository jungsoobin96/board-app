/**
 * 통합 테스트 — 글 API 5 endpoint × happy/failure + DELETE cascade HTTP 경로.
 * AC-01 ~ AC-08 매핑. Supertest로 실 buildApp(env) 사용 (server.listen 우회).
 * 격리: beforeEach에 4 deleteMany. afterAll에 $disconnect.
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

async function seedFiveArticles(): Promise<void> {
  for (let i = 1; i <= 5; i++) {
    await prisma.article.create({
      data: { title: `글 ${i}`, body: `본문 ${i}`, author: `작성자${i}` },
    });
  }
}

describe('GET /api/articles', () => {
  it('AC-01: 시드 5건 + page=1&limit=10 → 200 + articles.length=5 + total=5', async () => {
    await seedFiveArticles();
    const res = await request(app).get('/api/articles?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.articles).toHaveLength(5);
    expect(res.body.total).toBe(5);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    for (const a of res.body.articles) {
      expect(a).toHaveProperty('id');
      expect(a).toHaveProperty('title');
      expect(a).toHaveProperty('body');
      expect(a).toHaveProperty('author');
      expect(a).toHaveProperty('createdAt');
      expect(a).toHaveProperty('updatedAt');
      expect(Array.isArray(a.tags)).toBe(true);
    }
  });

  it('AC-02: page=0 → 400 + 한국어 에러 메시지', async () => {
    const res = await request(app).get('/api/articles?page=0');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: '잘못된 페이지/리미트 값입니다' });
  });
});

describe('GET /api/articles/:id', () => {
  it('AC-03: 존재 id → 200 + 단일 article', async () => {
    const created = await prisma.article.create({
      data: { title: 'detail', body: 'body', author: 'a' },
    });
    const res = await request(app).get(`/api/articles/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.id);
    expect(res.body.title).toBe('detail');
    expect(Array.isArray(res.body.tags)).toBe(true);
  });

  it('AC-04: 999 → 404 + 한국어 에러', async () => {
    const res = await request(app).get('/api/articles/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: '글을 찾을 수 없습니다' });
  });
});

describe('POST /api/articles', () => {
  it('AC-05: happy + tag 정규화 → 201 + tags=["js","ts"]', async () => {
    const res = await request(app)
      .post('/api/articles')
      .send({
        title: 'hi',
        body: 'world',
        author: 'hana',
        tagList: ['JS', 'ts', 'js', ' ', 'TS'],
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('hi');
    expect(res.body.tags).toEqual(['js', 'ts']);
  });

  it('AC-06: title="" → 400 + 한국어 에러', async () => {
    const res = await request(app)
      .post('/api/articles')
      .send({ title: '', body: 'x', author: 'y', tagList: [] });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: '제목은 필수입니다' });
  });
});

describe('PUT /api/articles/:id', () => {
  it('AC-07: 999 미존재 → 404', async () => {
    const res = await request(app)
      .put('/api/articles/999')
      .send({ title: 't', body: 'b', author: 'a', tagList: [] });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: '글을 찾을 수 없습니다' });
  });
});

describe('DELETE /api/articles/:id', () => {
  it('AC-08a: DELETE happy → 204 + body 빈 응답', async () => {
    const created = await prisma.article.create({
      data: { title: 'd', body: 'd', author: 'd' },
    });
    const res = await request(app).delete(`/api/articles/${created.id}`);
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(await prisma.article.count({ where: { id: created.id } })).toBe(0);
  });

  it('AC-08b: 글 1 + 댓글 3 + ArticleTag 2 → DELETE 204 + cascade (Comment·ArticleTag 0, Tag 잔존)', async () => {
    const article = await prisma.article.create({
      data: { title: 'cascade', body: 'body', author: 'a' },
    });
    await prisma.comment.createMany({
      data: [
        { body: 'c1', author: 'x', articleId: article.id },
        { body: 'c2', author: 'y', articleId: article.id },
        { body: 'c3', author: 'z', articleId: article.id },
      ],
    });
    await prisma.tag.createMany({ data: [{ name: 'http-cascade-1' }, { name: 'http-cascade-2' }] });
    const tags = await prisma.tag.findMany({
      where: { name: { in: ['http-cascade-1', 'http-cascade-2'] } },
    });
    await prisma.articleTag.createMany({
      data: tags.map((t) => ({ articleId: article.id, tagId: t.id })),
    });

    const res = await request(app).delete(`/api/articles/${article.id}`);
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});

    expect(await prisma.comment.count({ where: { articleId: article.id } })).toBe(0);
    expect(await prisma.articleTag.count({ where: { articleId: article.id } })).toBe(0);
    expect(await prisma.tag.count()).toBe(2);
  });
});
