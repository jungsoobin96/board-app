---
doc_type: feature-contract
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-05, R-F-06]
  F-ID: [F-05]
  supersedes: null
---

# feat-comments-api — Change Contract

> Issue #6 · mode=add · P3 산출. 09 API spec §3 댓글 3 엔드포인트의 Before/After 명세 + Call Sites + Rollback. articles 패턴(#4 PR #32) 답습 — Generator≠Evaluator 분리 가능한 단위.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P3 change-contract) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID | docs/planning/04-srs/04-srs.md | R-F-05·R-F-06 (R-F-07은 #4 PR #32에서 cascade 검증 완료, 본 PR은 회귀 fan-in만) |
| F-ID | docs/planning/05-prd/05-prd.md | F-05 |
| 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md §1 §3 §6 | M5(router 추가 마운트)·M6(controllers 신설)·M7(service 신설)·M8(repository 신설)·M9(validator 신설). M10 throw 측만 (errorHandler 로직 불변), M11 prisma singleton 재사용 |
| 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md §3 | GET /api/articles/:id/comments · POST /api/articles/:id/comments · DELETE /api/articles/:id/comments/:commentId |
| 규약 | docs/planning/11-coding-conventions/11-coding-conventions.md §2 PREFIX, docs/planning/12-scaffolding/typescript.md §5 빌드·실행 | 신규 에러 코드 `VAL_COMMENT_BODY_REQUIRED`·`VAL_COMMENT_AUTHOR_REQUIRED`·`VAL_COMMENT_AUTHOR_TOO_LONG`·`NOT_FOUND_COMMENT` (글의 `NOT_FOUND_ARTICLE`과 분리). 파일 명명 articles 패턴 답습 (comments 복수형 router, comment 단수형 service/repo/validator) |

## 1. 변경 의도

09 API spec §3의 댓글 도메인 3 엔드포인트(GET list·POST 201·DELETE 204)를 backend HTTP layer에 신설한다. articles 패턴(#4 PR #32) 답습 — 4 레이어(router→controller→service→repository) + validator. articleId path param 사용은 nested router(`mergeParams: true`) 또는 path 전체 명시 중 후자 선택(09 spec 정합 + Express 권장 패턴). Article 존재 검사는 service에서 수행하여 모든 댓글 API가 articleId 미존재 시 일관된 404를 반환. cascade 무결성(R-F-07)은 #3 schema-level + #4 HTTP 발현으로 baseline 확보됨 — 본 PR은 *댓글 자체* CRD만 신설하되, 통합 테스트에 fan-in 회귀 1건 추가(글 삭제 → 댓글 자동 삭제 재확인).

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `backend/src/routes/comments.ts` | 미존재 | 신설 — `express.Router({ mergeParams: true })` + 3 method 등록 (`GET /` · `POST /` · `DELETE /:commentId`) |
| `backend/src/controllers/comments.controller.ts` | 미존재 | 신설 — 3 handler (`listCommentsCtrl`·`createCommentCtrl`·`deleteCommentCtrl`), thin HTTP layer + asyncHandler 패턴 (articles 답습) |
| `backend/src/services/comment.service.ts` | 미존재 | 신설 — `list(articleId)`·`create(articleId, input)`·`remove(articleId, commentId)`. article 존재 검사(`articleRepo.findById`) 후 NotFoundError throw. cascade는 검사 불필요 (schema-level) |
| `backend/src/repositories/comment.repo.ts` | 미존재 | 신설 — `findManyByArticle(articleId)`·`findById(id)`·`insertComment(args)`·`deleteComment(id)`. Prisma singleton 직접 사용 (트랜잭션 불필요 — 단일 row 작업) |
| `backend/src/validators/comment.validator.ts` | 미존재 | 신설 — `validateCommentInput(body)` — body 1자 이상(trim 후), author 1~50자(trim 후). `VAL_COMMENT_BODY_REQUIRED`·`VAL_COMMENT_AUTHOR_REQUIRED`·`VAL_COMMENT_AUTHOR_TOO_LONG` 신규 코드 (article의 PREFIX 패턴 답습) |
| `backend/src/app.ts` | `app.use('/api/articles', articlesRouter)` 1줄 | + `app.use('/api/articles/:articleId/comments', commentsRouter)` 1줄 추가 (articles 라우터 직후, notFoundHandler 직전) |
| `backend/tests/unit/validators/comment.validator.test.ts` | 미존재 | 신설 — 6+ 케이스 (body happy / body 빈 / body 공백만 / author happy / author 빈 / author 51자 / 본문 null) |
| `backend/tests/unit/services/comment.service.test.ts` | 미존재 | 신설 — 5+ 케이스: article 존재 happy / article 미존재 → NotFoundError throw / DELETE articleId mismatch → NotFoundError. articleRepo·commentRepo는 vi.mock |
| `backend/tests/integration/comments.integration.test.ts` | 미존재 | 신설 — Supertest. AC 4건 + 추가 케이스 = 7+: GET 200 + GET article 미존재 404 + POST 201 + POST 빈 body 400 + POST article 미존재 404 + DELETE 204 + DELETE article mismatch 404 + cascade fan-in 회귀 1건 |
| 단위 테스트 실행 | 30+ passed (#4 산출) | + 11+ 추가 (validator + service) = 41+ passed |
| 통합 테스트 실행 | 11 passed (#4 산출: 9 articles + 2 cascade) | + 7+ comments = 18+ passed |
| typecheck | PASS 유지 | PASS (Prisma Comment type 사용) |
| build | `pnpm --filter @app/backend build` PASS | PASS 유지 |
| smoke | `pnpm smoke:3profiles` (Sprint 1 #5) — articles 200 polling으로 ready 신호 검출 | 동일 통과 (변경 없음 — comments endpoint도 같은 backend) |
| 부팅 자산 | `.env.{dev,stg,prod}.example`·prisma migrations·lockfile·LOCAL.md §3 | 변경 없음 — schema·env·dep 모두 불변 |
| 09 API spec 정합 | 글 5건 명시 (`/api/articles*`) | 글 5 + 댓글 3 = 8/9 (태그 1건만 남음 — #7) |
| 코드 라인 추가 | — | 약 +350 (src) + +300 (tests) = 650 |
| 의존성 변경 | 없음 — supertest는 #4 PR에서 이미 추가됨 | 변경 없음 (재사용) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `backend/src/app.ts` | `app.use('/api/articles/:articleId/comments', commentsRouter)` 1줄 추가. 등록 순서 = articles 직후, notFoundHandler 직전 (F-RISK-03 회귀 안전망 보전) | 본 PR 1 commit으로 처리 |
| `backend/src/services/article.service.ts` | `article.service.get(id)`을 comment.service에서 호출 가능 — but 신규 export 불필요 (repo 직접 사용 권장) | comment.service에서 `articleRepo.findById(articleId)` 직접 호출 (의존 최소화 — article.service.get은 NotFoundError를 글 메시지로 던지므로 comment 컨텍스트에 부적합) |
| `backend/src/repositories/article.repo.ts` | `findById` export 재사용 — 본 PR 변경 없음 | comment.repo가 article.repo의 `findById`를 import (기존 export 활용, 신규 export 불필요) |
| Sprint 2 #7 태그 API (`feat-tags-api`) | 본 PR이 nested path param 패턴(`:articleId/comments`) baseline 제공 — but tags는 nested 아님 (`/api/tags`) | 본 PR 머지 후 #7 진행, 패턴 공유 불필요 |
| Sprint 4 #N 댓글 UI (`feat-comment-create-delete-ui`) | 본 PR 응답 schema에 100% 의존 (GET list 형식·POST 201 응답·DELETE 204) | 본 PR 09 spec 정합 PASS = FE 차단 해소. Blocked-by 해제 |
| `backend/tests/integration/cascade.integration.test.ts` (#4 PR #32) | 본 PR 변경 없음 — schema-level CASCADE는 기존 테스트로 충분 | comments.integration.test.ts에 fan-in 회귀 1건만 추가 (글 삭제 후 댓글 GET → 404 + DB count=0) |
| `backend/src/middleware/error-handler.ts` (M10) | NotFoundError·ValidationError throw 측만 신규 발생. handler 로직 불변 | 변경 없음 |
| `backend/prisma/schema.prisma` (M11) | Comment 모델 + cascade 정의 그대로 사용 | 변경 없음 |

## 4. Backward Compatibility

- **Breaking**: no — 본 PR은 *신규 엔드포인트 3건만 추가*. 기존 `/api/articles*` 5건·`/healthz`·notFoundHandler·errorHandler 인터페이스 불변. 기존 호출자 0 (FE 미존재).
- **마이그레이션**: no — schema·migration 변경 0. #3 산출 schema 그대로.
- **API contract 변경**: 09 spec과 1:1 신설 — Before 0 comment endpoint → After 3 endpoint. 기존 endpoint 변경 없음.
- **버전 bump**: backend package.json `version: 0.1.0` 그대로 (Sprint 2 종료 시점에 일괄 결정).
- **에러 코드 신규**: `VAL_COMMENT_*` 3종 + `NOT_FOUND_COMMENT` 1종 — 11 §2 PREFIX 컨벤션 정합 (VAL_·NOT_FOUND_ 접두 답습), 기존 코드와 충돌 0.

## 5. Rollback 전략

- **Revert 가능**: yes — 본 PR을 git revert하면 3 endpoint 모두 사라지고 #4 PR #32 baseline(글 5건만) 상태로 복귀.
- **데이터 손상 위험**: 없음 — schema·migration 영향 0. 기존 dev.db의 댓글 데이터(시드)는 잔존하나 *조회 경로 차단*만 발생 (DB 직접 접근으로는 여전히 사용 가능). cascade는 schema-level이라 글 삭제로 자동 정리.
- **부분 롤백**: 3 endpoint 중 일부만 disable 시 `comments.ts`에서 해당 method 주석 처리. 정식 롤백은 PR revert.
- **Rollback 절차**:
  1. `git revert <merge-commit>` → 새 PR 생성
  2. CI green 확인 (#4 baseline 회귀: articles 9 + cascade 2 = 11 통합 PASS 유지)
  3. 머지 → 이슈 #6 재오픈 + 재작업 plan 작성
- **부팅 자산 회귀**: 본 PR은 `.env.{dev,stg,prod}.example`·LOCAL.md §3 *수정* 없음 — 회귀 시 원복 자동.

## 6. 비목표

- 댓글 **수정** (PATCH/PUT) — F-05 정의에 따라 본 슬라이스에서 제외
- 댓글 **페이지네이션** — 09 §3 "MVP는 페이지네이션 없음"
- 댓글 **작성자 인증** — R-N-07 MVP 인증 부재
- 댓글 **cascade 신규 구현** — schema-level CASCADE는 #3 산출, HTTP 발현 통합 검증은 #4 산출. 본 PR은 *fan-in 회귀 테스트 1건*만 추가
- **태그 API** (`GET /api/tags`) — Sprint 2 #7
- **E2E 시나리오** — Sprint 4에서 간접 (FE 결합 후)
- **rate limit / spam 방지** — Phase 2 후보 (09 §5)
- **댓글 검색·필터** — 09 spec 외
- **댓글 수정 이력·soft delete** — 학습 범위 외, MVP 정의 외
