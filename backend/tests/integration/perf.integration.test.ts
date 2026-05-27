/**
 * 통합 성능 측정 — R-N-01 응답 시간 (p95 < 200ms, 로컬 SQLite 기준).
 * 4 시나리오 × 100회 측정 → p95 계산 → WARN if 초과 (BLOCK X).
 * performance.now() wrapper로 ms 측정 + 결과 JSON 콘솔 출력.
 *
 * Issue #20 acceptance:
 * - Given 100건 시드, When GET /api/articles 100회, Then p95 < 200ms
 * - Given 4 시나리오, When 각 100회, Then 모두 p95 < 200ms (WARN if 초과)
 *
 * 본 테스트는 BLOCK 없음 (CI gate 아님). 측정 + WARN만으로 R-N-01 충족 추적.
 * RISK-04 (성능 환경 변동): 로컬 환경 의존 — CI 환경에서는 별도 임계 권고.
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { performance } from 'node:perf_hooks';
import request from 'supertest';
import type { Application } from 'express';
import { PrismaClient } from '@prisma/client';
import { buildApp } from '../../src/app.js';
import type { Env } from '../../src/env.js';

const prisma = new PrismaClient();
let app: Application;

const ITERATIONS = 100;
const P95_THRESHOLD_MS = 200;

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

async function seed100Articles(): Promise<{ articleId: number; tagName: string }> {
  // 태그 8종 + 글 100건 + 각 글당 1~2 ArticleTag + 첫 글에 댓글 3건
  const tagNames = ['typescript', 'react', 'node', 'prisma', 'sqlite', 'vitest', 'express', 'pnpm'];
  await prisma.tag.createMany({ data: tagNames.map((name) => ({ name })) });
  const tags = await prisma.tag.findMany();

  for (let i = 1; i <= 100; i++) {
    const article = await prisma.article.create({
      data: { title: `글 ${i}`, body: `본문 ${i}`, author: `작성자${i % 10}` },
    });
    // 각 글에 태그 1~2개 라운드로빈
    await prisma.articleTag.create({
      data: { articleId: article.id, tagId: tags[i % tags.length].id },
    });
    if (i % 2 === 0) {
      await prisma.articleTag.create({
        data: { articleId: article.id, tagId: tags[(i + 3) % tags.length].id },
      });
    }
  }

  const firstArticle = await prisma.article.findFirst({ orderBy: { id: 'asc' } });
  for (let i = 1; i <= 3; i++) {
    await prisma.comment.create({
      data: { articleId: firstArticle!.id, body: `댓글 ${i}`, author: `commenter${i}` },
    });
  }

  return { articleId: firstArticle!.id, tagName: tagNames[0] };
}

function percentile(samples: number[], p: number): number {
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function measureScenario(
  label: string,
  fn: () => Promise<request.Response>,
): Promise<{ label: string; iterations: number; min: number; p50: number; p95: number; max: number; mean: number; statusAllOk: boolean }> {
  const samples: number[] = [];
  let allOk = true;
  for (let i = 0; i < ITERATIONS; i++) {
    const t0 = performance.now();
    const res = await fn();
    const t1 = performance.now();
    if (res.status !== 200) {
      allOk = false;
    }
    samples.push(t1 - t0);
  }
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return {
    label,
    iterations: ITERATIONS,
    min: Number(min.toFixed(2)),
    p50: Number(percentile(samples, 50).toFixed(2)),
    p95: Number(percentile(samples, 95).toFixed(2)),
    max: Number(max.toFixed(2)),
    mean: Number(mean.toFixed(2)),
    statusAllOk: allOk,
  };
}

describe('R-N-01 응답 시간 측정 통합 (p95 < 200ms, BLOCK X)', () => {
  it('4 시나리오 × 100회 — p95 측정 + WARN 출력 + 결과 JSON', async () => {
    const seedInfo = await seed100Articles();

    const scenarios = await Promise.all([
      measureScenario('GET /api/articles?page=1&limit=10', () =>
        request(app).get('/api/articles?page=1&limit=10'),
      ),
      measureScenario(`GET /api/articles/${seedInfo.articleId}`, () =>
        request(app).get(`/api/articles/${seedInfo.articleId}`),
      ),
      measureScenario('GET /api/tags', () => request(app).get('/api/tags')),
      measureScenario(`GET /api/articles/${seedInfo.articleId}/comments`, () =>
        request(app).get(`/api/articles/${seedInfo.articleId}/comments`),
      ),
    ]);

    const report = {
      issue: 20,
      r_id: 'R-N-01',
      threshold_ms: P95_THRESHOLD_MS,
      iterations: ITERATIONS,
      scenarios,
      summary: {
        all_p95_under_threshold: scenarios.every((s) => s.p95 < P95_THRESHOLD_MS),
        all_status_ok: scenarios.every((s) => s.statusAllOk),
      },
    };

    // 결과 JSON 출력 (DoD: 결과 JSON)
    console.log('[PERF] R-N-01 응답 시간 측정 결과:');
    console.log(JSON.stringify(report, null, 2));

    // WARN if 초과 (BLOCK X — expect로 차단하지 않음)
    for (const s of scenarios) {
      if (s.p95 >= P95_THRESHOLD_MS) {
        console.warn(
          `[PERF WARN] ${s.label} — p95=${s.p95}ms ≥ ${P95_THRESHOLD_MS}ms threshold (BLOCK X, 추적만)`,
        );
      }
    }

    // 최소 검증: 모든 시나리오 status=200 + 측정값 양수 (sanity)
    expect(scenarios.every((s) => s.statusAllOk)).toBe(true);
    for (const s of scenarios) {
      expect(s.iterations).toBe(ITERATIONS);
      expect(s.p95).toBeGreaterThan(0);
      expect(s.min).toBeLessThanOrEqual(s.p95);
      expect(s.p95).toBeLessThanOrEqual(s.max);
    }
  });
});
