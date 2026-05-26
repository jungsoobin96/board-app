/**
 * M5 BE-router — 댓글 라우터.
 * mergeParams=true로 부모 라우터(`/api/articles/:articleId/comments`)의 articleId 자동 인계.
 * 3 method 등록. app.ts에서 마운트.
 */
import { Router } from 'express';
import {
  listCommentsCtrl,
  createCommentCtrl,
  deleteCommentCtrl,
} from '../controllers/comments.controller.js';

export const commentsRouter: Router = Router({ mergeParams: true });

commentsRouter.get('/', listCommentsCtrl);
commentsRouter.post('/', createCommentCtrl);
commentsRouter.delete('/:commentId', deleteCommentCtrl);
