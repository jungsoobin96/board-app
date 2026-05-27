/**
 * normalizeError 단위 테스트.
 * AC-02·03·05 매핑.
 */
import { describe, it, expect } from 'vitest';
import { NormalizedError } from '@app/shared';
import { normalizeResponse, normalizeNetworkError } from '../../../src/api/normalizeError';

describe('normalizeResponse', () => {
  it('400 + {error} body → NormalizedError(400, body.error)', async () => {
    const res = new Response(JSON.stringify({ error: '잘못된 페이지/리미트 값입니다' }), {
      status: 400,
    });
    await expect(normalizeResponse(res)).rejects.toThrow(NormalizedError);
    await expect(normalizeResponse(res.clone())).rejects.toMatchObject({
      status: 400,
      message: '잘못된 페이지/리미트 값입니다',
    });
  });

  it('404 + {error} body → NormalizedError(404, body.error)', async () => {
    const res = new Response(JSON.stringify({ error: '글을 찾을 수 없습니다' }), { status: 404 });
    await expect(normalizeResponse(res)).rejects.toMatchObject({
      status: 404,
      message: '글을 찾을 수 없습니다',
    });
  });

  it('500 + {error} body → NormalizedError(500, body.error)', async () => {
    const res = new Response(JSON.stringify({ error: '서버 오류가 발생했습니다' }), {
      status: 500,
    });
    await expect(normalizeResponse(res)).rejects.toMatchObject({
      status: 500,
      message: '서버 오류가 발생했습니다',
    });
  });

  it('500 + body parse fail (HTML 등) → NormalizedError(500, "서버 응답을 처리할 수 없습니다")', async () => {
    const res = new Response('<html>not json</html>', { status: 500 });
    await expect(normalizeResponse(res)).rejects.toMatchObject({
      status: 500,
      message: '서버 응답을 처리할 수 없습니다',
    });
  });

  it('400 + 빈 body → fallback message', async () => {
    const res = new Response('', { status: 400 });
    await expect(normalizeResponse(res)).rejects.toMatchObject({
      status: 400,
      message: '서버 응답을 처리할 수 없습니다',
    });
  });
});

describe('normalizeNetworkError', () => {
  it('TypeError → NormalizedError(0, "네트워크 오류")', () => {
    const err = normalizeNetworkError(new TypeError('NetworkError'));
    expect(err).toBeInstanceOf(NormalizedError);
    expect(err.status).toBe(0);
    expect(err.message).toBe('네트워크 오류');
  });

  it('unknown error → NormalizedError(0, "네트워크 오류")', () => {
    const err = normalizeNetworkError('unknown string');
    expect(err.status).toBe(0);
    expect(err.message).toBe('네트워크 오류');
  });
});
