---
doc_type: feature-brief
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-25
gate: feature
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-05]
  F-ID: [F-01, F-03, F-04, F-06, F-07]
  supersedes: null
---

# feat-articles-api — Feature Brief

> Issue #4 · mode=add · Sprint 1 · 글 API 5종 + 입력 검증 + 통합 테스트 (M5·M6·M7·M8·M9 신설).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P1 intention-brief) |

## 1. 한 줄 의도

09 API spec의 글 도메인 5 엔드포인트(GET list·GET detail·POST·PUT·DELETE)를 backend에 신설 — controller·service·repository·validator 4 레이어 분리 + Prisma 트랜잭션 + 입력 검증 + Supertest 통합 9 케이스 PASS.

## 2. 사용자 가치

- **학습자(MVP 1차 사용자)**: `curl /api/articles`로 글 CRUD를 즉시 학습 가능. 09 spec과 1:1 정합.
- **FE 도입 (#11·#12 etc.)**: Sprint 2~ FE 페이지가 본 API에 의존. baseline 안정성 확보 시 후속 FE 작업 속도 ↑.
- **데모**: Prisma cascade가 실 HTTP 경로(DELETE /api/articles/:id)로도 동작함을 확인.

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| HTTP 라우트 | `/healthz`만 (PR #29 산출) | `/healthz` + `/api/articles` (5 endpoint) |
| Controller | 미존재 | `articles.controller.ts` — listArticlesCtrl·getArticleCtrl·createArticleCtrl·updateArticleCtrl·deleteArticleCtrl |
| Service | 미존재 | `article.service.ts` — list·get·create·update·delete + normalizeTags + paginate + withTransaction wrapper |
| Repository | 미존재 (Prisma client만 #3 산출) | `article.repo.ts` (+ tag.repo·article-tag.repo 통합) — Prisma 쿼리 일원화 + Prisma 에러 → 도메인 에러 변환 |
| Validator | 미존재 | `validators/article.validator.ts` + `validators/query.validator.ts` — title·body·author·tagList·page·limit·tag·pathId |
| 도메인 에러 | ValidationError·NotFoundError·RepositoryError 클래스만 #2 산출 | 본 PR이 createArticle·updateArticle·deleteArticle 시 위 3종 throw 활용 |
| 단위 테스트 | M10 errorHandler + #3 validator-stub만 | validators 5+ 케이스 + service 5+ 케이스 (normalizeTags·paginate·withTransaction) |
| 통합 테스트 | R-F-07 cascade.integration.test.ts (#3) | + articles.integration.test.ts (9 케이스 — happy/failure + DELETE cascade) |

## 4. 모드 자동 감지 결과

- 라벨: `type:feature` + `area:backend` + `priority:P0` + `status:in-progress` (P-1에서 전이)
- 자연어 신호: "추가", "5종", "신설" → mode=add
- 부정 시그널: bug/design/modify 0건
- **자동 결정**: `mode=add` (질문 없이 진행, ADR-0032 기본값)

## 5. 영향 범위

**Backend (신설)**:
- `backend/src/routes/articles.ts` (신규)
- `backend/src/controllers/articles.controller.ts` (신규)
- `backend/src/services/article.service.ts` (신규)
- `backend/src/repositories/article.repo.ts` (신규)
- `backend/src/validators/article.validator.ts` (신규)
- `backend/src/validators/query.validator.ts` (신규)
- `backend/src/app.ts` (수정 — `app.use('/api/articles', articlesRouter)` 1줄 추가)
- `backend/tests/unit/validators/article.validator.test.ts` (신규)
- `backend/tests/unit/validators/query.validator.test.ts` (신규)
- `backend/tests/unit/services/article.service.test.ts` (신규 — repo mock)
- `backend/tests/integration/articles.integration.test.ts` (신규 — Supertest)

**Shared / 정책 산출**:
- `docs/features/feat-articles-api/` 6 산출 (brief·contract·plan·eng-review·acceptance·risk + reviewer code-review)

**불변 (Touched 아님)**:
- Frontend (Sprint 3~)
- `backend/src/lib/prisma.ts` (#3 산출 그대로)
- `backend/prisma/schema.prisma` (#3 산출 그대로)
- `backend/src/middleware/error-handler.ts` (#2 산출 그대로 — 본 PR은 throw 측만 추가, 분기 로직 변경 없음)
- `backend/src/server.ts`·`env.ts`·`middleware/{cors,request-logger}.ts` (#1·#2 산출 그대로)

## 6. 비목표

- 댓글 API (`/api/articles/:id/comments` 3종 — Sprint 2 #6)
- 태그 API (`GET /api/tags` — Sprint 2 #7)
- 인증·인가 (MVP out-of-scope, RFP §2.3)
- Rate Limit (Phase 2 후보, 09 §5)
- E2E (Sprint 3·4 FE 페이지에서 간접 검증)
- `/api/articles?author=...` 등 09 spec 외 필터
- pagination cursor 방식 (09는 offset 기반 — `page`/`limit`만)
- 응답 caching·ETag (학습 범위 외)
- OpenAPI 자동 생성 (수동 09 spec 정본 유지)

## 7. Open Questions

- (오픈 없음) — 09 API spec이 5 엔드포인트의 request·response·status·에러 메시지 한국어를 모두 확정. validator·service 로직은 09 spec 직 매핑. tag 정규화 규칙 (trim·lower·중복 제거)도 09 §3 POST/PUT에 명시.
