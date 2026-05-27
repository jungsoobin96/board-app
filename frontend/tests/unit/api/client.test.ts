/**
 * api-client 단위 테스트.
 * AC-01·02·03·04 매핑. 9 method × happy + 일부 method 4xx/offline.
 * fetch global mock + afterEach unstub.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NormalizedError } from '@app/shared';
import {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  listComments,
  createComment,
  deleteComment,
  listTags,
} from '../../../src/api/client';

const BASE = 'http://localhost:3000/api';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('listArticles', () => {
  it('AC-01: happy + query → GET /articles?page=1', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ articles: [], total: 0, page: 1, limit: 10 }),
    );
    const result = await listArticles({ page: 1 });
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/articles?page=1`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(result).toEqual({ articles: [], total: 0, page: 1, limit: 10 });
  });

  it('AC-01b: no args → GET /articles (쿼리 없음)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ articles: [], total: 0, page: 1, limit: 10 }),
    );
    await listArticles();
    expect(fetch).toHaveBeenCalledWith(`${BASE}/articles`, expect.any(Object));
  });

  it('AC-02: 400 응답 → NormalizedError(400, "잘못된 페이지/리미트 값입니다")', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: '잘못된 페이지/리미트 값입니다' }, 400),
    );
    await expect(listArticles({ page: -1 })).rejects.toThrow(NormalizedError);
    await expect(listArticles({ page: -1 })).rejects.toMatchObject({
      status: 400,
      message: '잘못된 페이지/리미트 값입니다',
    });
  });

  it('AC-03: offline (fetch reject) → NormalizedError(0, "네트워크 오류")', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('NetworkError'));
    await expect(listArticles()).rejects.toMatchObject({
      status: 0,
      message: '네트워크 오류',
    });
  });
});

describe('getArticle', () => {
  it('happy → GET /articles/1', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ id: 1, title: 't' }));
    await getArticle(1);
    expect(fetch).toHaveBeenCalledWith(`${BASE}/articles/1`, expect.any(Object));
  });
});

describe('createArticle', () => {
  it('happy → POST /articles + body JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ id: 42 }, 201));
    await createArticle({ title: 't', body: 'b', author: 'a', tagList: ['js'] });
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/articles`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 't', body: 'b', author: 'a', tagList: ['js'] }),
      }),
    );
  });
});

describe('updateArticle', () => {
  it('happy → PUT /articles/1', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ id: 1 }));
    await updateArticle(1, { title: 't', body: 'b', author: 'a', tagList: [] });
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/articles/1`,
      expect.objectContaining({ method: 'PUT' }),
    );
  });
});

describe('deleteArticle', () => {
  it('happy → DELETE /articles/1 (204 body 없음)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());
    const result = await deleteArticle(1);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/articles/1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toBeUndefined();
  });
});

describe('listComments', () => {
  it('happy → GET /articles/1/comments', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ comments: [] }));
    await listComments(1);
    expect(fetch).toHaveBeenCalledWith(`${BASE}/articles/1/comments`, expect.any(Object));
  });
});

describe('createComment', () => {
  it('AC-04: happy → POST /articles/1/comments + body JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ id: 11, articleId: 1 }, 201));
    await createComment(1, { body: '재밌네요', author: 'min' });
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/articles/1/comments`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ body: '재밌네요', author: 'min' }),
      }),
    );
  });
});

describe('deleteComment', () => {
  it('happy → DELETE /articles/1/comments/5 (204)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(noContentResponse());
    await deleteComment(1, 5);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/articles/1/comments/5`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('listTags', () => {
  it('happy → GET /tags', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ tags: [] }));
    await listTags();
    expect(fetch).toHaveBeenCalledWith(`${BASE}/tags`, expect.any(Object));
  });
});
