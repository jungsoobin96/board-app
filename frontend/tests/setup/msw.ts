/**
 * MSW Node server setup — 통합 테스트에서 fetch 흐름 mock.
 * 통합 test가 setupServer + beforeAll/afterAll/afterEach reset 호출.
 */
import { http, HttpResponse, type RequestHandler } from 'msw';
import { setupServer, type SetupServerApi } from 'msw/node';
import type { Article, ListResult, Tag } from '@app/shared';

const BASE = 'http://localhost:3000/api';

export function buildHandlers(args: {
  articles: Article[];
  tags: Tag[];
  total?: number;
}): RequestHandler[] {
  const { articles, tags, total = articles.length } = args;
  return [
    http.get(`${BASE}/articles`, () => {
      const body: ListResult<Article> = {
        articles,
        total,
        page: 1,
        limit: 10,
      };
      return HttpResponse.json(body);
    }),
    http.get(`${BASE}/tags`, () => {
      return HttpResponse.json({ tags });
    }),
  ];
}

export function buildServer(handlers: RequestHandler[]): SetupServerApi {
  return setupServer(...handlers);
}
