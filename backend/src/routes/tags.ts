/**
 * M5 BE-router — 태그 라우터.
 * 1 method 등록. app.ts에서 `app.use('/api/tags', tagsRouter)`로 마운트.
 */
import { Router } from 'express';
import { listTagsCtrl } from '../controllers/tags.controller.js';

export const tagsRouter: Router = Router();

tagsRouter.get('/', listTagsCtrl);
