/**
 * @app/shared — frontend·backend 공용 DTO + error contract type.
 * 09 API spec §3 응답 schema 정합.
 */
export type { Article, ArticleInput, ListResult } from './article.js';
export type { Comment, CommentInput, CommentListResult } from './comment.js';
export type { Tag, TagListResult } from './tag.js';
export type { ApiErrorBody } from './api-error.js';
export { NormalizedError } from './api-error.js';
