/**
 * app.ts buildApp() 통합 단위 테스트.
 * /healthz 응답 schema + 미들웨어 chain 통합 동작 검증.
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../src/app.js';

const mockEnv = {
  PORT: 3000,
  NODE_ENV: 'dev' as const,
  LOG_LEVEL: 'error' as const, // test 출력 최소화
  DATABASE_URL: 'file:./test.db',
};

describe('buildApp', () => {
  it('GET /healthz → 200 + {ok:true}', async () => {
    const app = buildApp(mockEnv);
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /nonexistent → 404 + 한국어 메시지 (notFoundHandler)', async () => {
    const app = buildApp(mockEnv);
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: '요청한 리소스를 찾을 수 없습니다' });
  });

  it('OPTIONS /healthz → 204 (cors dev)', async () => {
    const app = buildApp(mockEnv);
    const res = await request(app).options('/healthz');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('NODE_ENV=stg → CORS 헤더 미부착', async () => {
    const app = buildApp({ ...mockEnv, NODE_ENV: 'stg' });
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
