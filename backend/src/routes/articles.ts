/**
 * M5 BE-router — `/api/articles` 라우터.
 * 5 method 등록. app.ts에서 `app.use('/api/articles', articlesRouter)`로 마운트.
 */
import { Router } from 'express';
import {
  listArticlesCtrl,
  getArticleCtrl,
  createArticleCtrl,
  updateArticleCtrl,
  deleteArticleCtrl,
} from '../controllers/articles.controller.js';

export const articlesRouter: Router = Router();

articlesRouter.get('/', listArticlesCtrl);
articlesRouter.get('/:id', getArticleCtrl);
articlesRouter.post('/', createArticleCtrl);
articlesRouter.put('/:id', updateArticleCtrl);
articlesRouter.delete('/:id', deleteArticleCtrl);
