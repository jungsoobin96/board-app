---
doc_type: feature-contract
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

# feat-articles-api — Change Contract

> Issue #4 · mode=add · P3 산출. 09 API spec 글 5 엔드포인트의 Before/After 명세 + Call Sites + Rollback.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P3 change-contract) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID | docs/planning/04-srs/04-srs.md | R-F-01·R-F-02·R-F-03·R-F-05 |
| F-ID | docs/planning/05-prd/05-prd.md | F-01·F-03·F-04·F-06·F-07 |
| 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md §1 §3 §6 | M5·M6·M7·M8·M9 (+ M10 throw 측만) |
| 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md §3 | GET /api/articles · GET /:id · POST · PUT /:id · DELETE /:id |
| 규약 | docs/planning/11-coding-conventions/11-coding-conventions.md §2 PREFIX, docs/planning/12-scaffolding/typescript.md §5 빌드·실행 | VAL_*·NOT_FOUND_*·REPO_* 코드 컨벤션 |

## 1. 변경 의도

09 API spec §3의 글 도메인 5 엔드포인트(GET list·GET detail·POST·PUT·DELETE)를 backend HTTP layer에 신설한다. M5~M9 4 레이어(router→controller→service→repository, validator는 controller→validator 인접)를 신설하되 본 PR은 *글* 도메인만(댓글은 #6·태그는 #7로 분리). cascade 무결성(R-F-07)은 #3에서 schema-level로 보장됨. 본 PR은 *HTTP 경로*로도 DELETE cascade가 발현됨을 통합 테스트로 확인.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `backend/src/routes/articles.ts` | 미존재 | 신설 — express.Router() + 5 method 등록 |
| `backend/src/controllers/articles.controller.ts` | 미존재 | 신설 — 5 handler (listArticlesCtrl·getArticleCtrl·createArticleCtrl·updateArticleCtrl·deleteArticleCtrl), thin HTTP layer |
| `backend/src/services/article.service.ts` | 미존재 | 신설 — list·get·create·update·delete + normalizeTags + paginate + withTransaction wrapper |
| `backend/src/repositories/article.repo.ts` | 미존재 | 신설 — findMany·findById·insert·update·delete + tag upsertMany + articleTag link/unlink (단일 파일 통합 — tag.repo·articleTag.repo는 본 슬라이스에서 분리하지 않음, 08 §M8 정합) |
| `backend/src/validators/article.validator.ts` | 미존재 | 신설 — validateArticleInput(body) — title 1~200, body 1+, author 1~50, tagList 정규화 |
| `backend/src/validators/query.validator.ts` | 미존재 | 신설 — parseListQuery(query) — page≥1 default 1, 1≤limit≤50 default 10, tag trim+lower; parsePathId(param) — integer |
| `backend/src/app.ts` | `app.use('/healthz', ...)` + notFoundHandler + errorHandler | + `app.use('/api/articles', articlesRouter)` 1줄 추가 (routes 등록은 notFoundHandler 직전) |
| `backend/tests/unit/validators/article.validator.test.ts` | 미존재 | 신설 — title·body·author·tagList 7+ 케이스 (happy + 각 4xx) |
| `backend/tests/unit/validators/query.validator.test.ts` | 미존재 | 신설 — page·limit·tag·pathId 5+ 케이스 |
| `backend/tests/unit/services/article.service.test.ts` | 미존재 | 신설 — normalizeTags·paginate·repository mock 5+ 케이스 (vi.mock) |
| `backend/tests/integration/articles.integration.test.ts` | 미존재 | 신설 — Supertest. 9 케이스: GET list happy + page=0 400 + GET detail happy + 404 + POST happy + title 빈 값 400 + tag 정규화 + PUT 404 + DELETE 204 + DELETE cascade(comments·articleTags 0건) |
| 단위 테스트 실행 | 13 passed (#3 산출) | + 17+ 추가 (validators·service) — `pnpm --filter @app/backend test` 30+ passed |
| 통합 테스트 실행 | 2 passed (cascade.integration.test.ts) | + 9 articles.integration.test.ts → 11 passed total — `pnpm --filter @app/backend test:integration` |
| typecheck | `pnpm typecheck` PASS (#3) | PASS 유지 (Prisma generate된 client type 사용) |
| build | `pnpm --filter @app/backend build` PASS (#3) | PASS 유지 |
| 부팅 검증 | `pnpm --filter @app/backend dev` → `/healthz` 200 | + `curl /api/articles?page=1&limit=10` → 200 (5건 from seed) |
| 코드 라인 추가 | — | 약 +600 (src) + +500 (tests) = 1100 |
| 의존성 변경 | 없음 — supertest는 #2 PR devDeps 이미 포함 (확인 필요) | (만약 #2에서 미포함 시 본 PR에서 `pnpm --filter @app/backend add -D supertest @types/supertest` 추가) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `backend/src/app.ts` | `app.use('/api/articles', articlesRouter)` 1줄 추가 (현재 routes 미등록 상태에서 첫 라우트) | 본 PR 1 commit으로 처리 — `// routes는 후속 이슈 #4에서 추가` 주석 삭제 후 실 등록 |
| Sprint 2 #6 댓글 API (`feat-comments-api`) | 본 PR이 articleId path param 사용 패턴 baseline 제공 | 본 PR 머지 후 동일 패턴 채택 (별 PR) |
| Sprint 2 #7 태그 API (`feat-tags-api`) | 본 PR Repository의 tag 부분 분리 가능성 (선택) | 본 PR는 통합 형태 유지, #7에서 분리 ADR 검토 |
| Sprint 3·4 FE 페이지 (#11·#12·#13) | 본 PR 응답 schema에 100% 의존 | 본 PR 09 spec 정합 PASS = FE 차단 해소 |
| `backend/src/middleware/error-handler.ts` (M10) | ValidationError·NotFoundError·RepositoryError throw 측만 본 PR에서 신설 발생 | M10 로직 변경 없음 (#2 산출 그대로 사용) |
| `backend/src/lib/prisma.ts` (M11 singleton) | 본 PR repository에서 `import { prisma } from '../lib/prisma.js'`로 사용 | #3 산출 인터페이스 불변, 재사용 |
| `backend/prisma/schema.prisma` (M11) | 본 PR 영향 없음 — schema 그대로 사용 | 불변. ArticleTag M-N + cascade는 #3 산출 그대로 |

## 4. Backward Compatibility

- **Breaking**: no — 본 PR은 *신규 엔드포인트*만 추가. 기존 `/healthz`·notFoundHandler·errorHandler 인터페이스 불변. 기존 호출자 0.
- **마이그레이션**: no — schema 변경 없음 (#3 산출 schema 그대로). 신규 코드만.
- **API contract 변경**: 09 spec과 1:1 신설 — Before 0 endpoint → After 5 endpoint. 기존 endpoint 변경 없음.
- **버전 bump**: backend package.json `version: 0.1.0` 그대로. Sprint 1 종료 시점에 별도 결정.

## 5. Rollback 전략

- **Revert 가능**: yes — 본 PR을 git revert하면 5 endpoint 모두 사라지고 `/healthz`만 남는 #3 baseline 상태로 복귀.
- **데이터 손상 위험**: 없음 — 본 PR은 schema·migration 영향 0. dev.db는 #3 seed 그대로 잔존.
- **부분 롤백**: 5 endpoint 중 일부만 disable 시 `articles.ts`에서 해당 method 주석 처리 (학습용 fallback). 정식 롤백은 PR revert.
- **Rollback 절차**:
  1. `git revert <merge-commit>` → 새 PR 생성
  2. CI green 확인 (단위·통합 테스트 #3 baseline 회귀 확인)
  3. 머지 → 이슈 #4 재오픈 + 재작업 plan 작성
- **부팅 자산 회귀**: 본 PR이 `.env.{dev,stg,prod}.example` 또는 LOCAL.md §3 *수정* 없음 — 회귀 시 원복 자동.

## 6. 비목표

- 댓글 API (`/api/articles/:id/comments` 3종) — Sprint 2 #6
- 태그 API (`GET /api/tags`) — Sprint 2 #7
- 인증·인가 — MVP out-of-scope (RFP §2.3)
- Rate Limit — Phase 2 후보 (09 §5)
- E2E — Sprint 3·4 FE에서 간접 검증
- `/api/articles?author=...` 필터 — 09 spec 외
- pagination cursor — 09는 offset 기반(`page`/`limit`)
- 응답 caching·ETag — 학습 범위 외
- OpenAPI 자동 생성 — 09 spec 수동 정본 유지
- 쓰기 concurrency 제어 (last-write-wins) — 08 §7 정합, 인증 부재 MVP 가정

