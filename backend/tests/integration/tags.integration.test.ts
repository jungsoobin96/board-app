/**
 * 통합 테스트 — 태그 API GET 1 endpoint × happy / empty / 동률.
 * AC-01·02·03 매핑. Supertest로 실 buildApp(env) 사용.
 * 격리: beforeEach 4 deleteMany (articles 패턴 답습).
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

/**
 * 30종 태그 + 다양한 빈도 분포로 시드.
 * tag-N → N개의 글에 매핑 (N=1..30 단조 증가). 따라서 desc 정렬 시 tag-30이 최상위.
 */
async function seedThirtyTagsWithFrequency(): Promise<void> {
  // 30개 글 생성 (글 i 는 tag-i, tag-(i+1), ..., tag-30 모두 매핑 — 즉 tag-N은 N개 글에 사용)
  // 단순화: 글 N개 생성, tag-i는 글 1~i에 매핑
  const articles: number[] = [];
  for (let i = 1; i <= 30; i++) {
    const a = await prisma.article.create({
      data: { title: `t${i}`, body: `b${i}`, author: 'a' },
    });
    articles.push(a.id);
  }
  // tag-i 생성
  for (let i = 1; i <= 30; i++) {
    const tag = await prisma.tag.create({ data: { name: `tag-${i}` } });
    // tag-i → 글 1..i 매핑 (count=i)
    const links = articles.slice(0, i).map((articleId) => ({
      articleId,
      tagId: tag.id,
    }));
    if (links.length > 0) {
      await prisma.articleTag.createMany({ data: links });
    }
  }
}

describe('GET /api/tags', () => {
  it('AC-01: 30종 시드 + 다양한 빈도 → 200 + length=20 + count desc', async () => {
    await seedThirtyTagsWithFrequency();

    const res = await request(app).get('/api/tags');

    expect(res.status).toBe(200);
    expect(res.body.tags).toHaveLength(20);

    // count desc 검증 — 상위 20개는 tag-30, tag-29, ..., tag-11 순
    expect(res.body.tags[0].count).toBe(30);
    expect(res.body.tags[0].name).toBe('tag-30');
    expect(res.body.tags[19].count).toBe(11);

    // 정렬 monotonic decreasing 검증
    for (let i = 1; i < res.body.tags.length; i++) {
      expect(res.body.tags[i].count).toBeLessThanOrEqual(res.body.tags[i - 1].count);
    }
  });

  it('AC-02: 태그 0건 → 200 + tags=[]', async () => {
    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ tags: [] });
  });

  it('AC-03: 동률 빈도 5종 → 5종 모두 응답 포함 (secondary sort 비목표)', async () => {
    // 글 3개 생성
    const articles = await Promise.all(
      [1, 2, 3].map((i) =>
        prisma.article.create({ data: { title: `t${i}`, body: `b${i}`, author: 'a' } }),
      ),
    );
    // 5종 태그 생성 + 각각 모든 3 글에 매핑 (count=3 동률)
    for (const name of ['t-a', 't-b', 't-c', 't-d', 't-e']) {
      const tag = await prisma.tag.create({ data: { name } });
      await prisma.articleTag.createMany({
        data: articles.map((a) => ({ articleId: a.id, tagId: tag.id })),
      });
    }

    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(res.body.tags).toHaveLength(5);
    for (const t of res.body.tags) {
      expect(t.count).toBe(3);
    }
    const names = res.body.tags.map((t: { name: string }) => t.name).sort();
    expect(names).toEqual(['t-a', 't-b', 't-c', 't-d', 't-e']);
  });
});
