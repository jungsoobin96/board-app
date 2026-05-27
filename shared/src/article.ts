/**
 * Article DTO — 09 §3 GET/POST/PUT /api/articles 응답 schema 정합.
 * BE Article 모델은 prisma generated type, FE는 본 type 사용.
 */
export interface Article {
  id: number;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ArticleInput {
  title: string;
  body: string;
  author: string;
  tagList: string[];
}

export interface ListResult<T> {
  articles: T[];
  total: number;
  page: number;
  limit: number;
}
