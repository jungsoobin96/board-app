/**
 * Comment DTO — 09 §3 GET/POST/DELETE /api/articles/:id/comments 응답 schema 정합.
 */
export interface Comment {
  id: number;
  articleId: number;
  body: string;
  author: string;
  createdAt: string;
}

export interface CommentInput {
  body: string;
  author: string;
}

export interface CommentListResult {
  comments: Comment[];
}
