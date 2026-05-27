/**
 * frontend api-client — 09 §3 9 endpoint wrap.
 * 모든 method는 NormalizedError throw (R-N-02). 호출처는 try/catch + err.status 검사.
 *
 * base URL: import.meta.env.VITE_API_URL (Vite 표준, fallback http://localhost:3000/api).
 */
import type {
  Article,
  ArticleInput,
  ListResult,
  Comment,
  CommentInput,
  CommentListResult,
  TagListResult,
} from '@app/shared';
import { normalizeResponse, normalizeNetworkError } from './normalizeError';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api';

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${input}`, {
      headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });
  } catch (err) {
    throw normalizeNetworkError(err);
  }
  if (!res.ok) {
    return normalizeResponse(res);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export interface ListArticlesArgs {
  page?: number;
  limit?: number;
  tag?: string;
}

export async function listArticles(args: ListArticlesArgs = {}): Promise<ListResult<Article>> {
  const params = new URLSearchParams();
  if (args.page !== undefined) params.set('page', String(args.page));
  if (args.limit !== undefined) params.set('limit', String(args.limit));
  if (args.tag !== undefined) params.set('tag', args.tag);
  const qs = params.toString();
  return request<ListResult<Article>>(`/articles${qs ? `?${qs}` : ''}`);
}

export async function getArticle(id: number): Promise<Article> {
  return request<Article>(`/articles/${id}`);
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  return request<Article>('/articles', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateArticle(id: number, input: ArticleInput): Promise<Article> {
  return request<Article>(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteArticle(id: number): Promise<void> {
  await request<void>(`/articles/${id}`, { method: 'DELETE' });
}

export async function listComments(articleId: number): Promise<CommentListResult> {
  return request<CommentListResult>(`/articles/${articleId}/comments`);
}

export async function createComment(articleId: number, input: CommentInput): Promise<Comment> {
  return request<Comment>(`/articles/${articleId}/comments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteComment(articleId: number, commentId: number): Promise<void> {
  await request<void>(`/articles/${articleId}/comments/${commentId}`, { method: 'DELETE' });
}

export async function listTags(): Promise<TagListResult> {
  return request<TagListResult>('/tags');
}
