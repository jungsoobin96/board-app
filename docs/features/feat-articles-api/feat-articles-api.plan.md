---
doc_type: feature-plan
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

# feat-articles-api — Implementation Plan

> Issue #4 · mode=add · P4 산출. 5 endpoint 신설 7 commit DAG + 테스트 매핑.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | woosung.ahn@bespinglobal.com | 초안 (P4 implementation-planner) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `feat(backend): validators 신설 (article + query) (#4)` | `backend/src/validators/article.validator.ts`·`backend/src/validators/query.validator.ts` | `tests/unit/validators/article.validator.test.ts` (7 케이스), `tests/unit/validators/query.validator.test.ts` (5 케이스) | 낮음 — 신규 파일. #2 ValidationError 클래스 재사용 |
| 2 | `feat(backend): article repository 신설 (Prisma + 도메인 에러 변환) (#4)` | `backend/src/repositories/article.repo.ts` | (단위 테스트 X — Prisma client는 통합 테스트로 충분, 08 §8 정합) | 낮음 — 신규 파일. PrismaClient #3 singleton import |
| 3 | `feat(backend): article service 신설 (withTransaction + normalizeTags + paginate) (#4)` | `backend/src/services/article.service.ts` | `tests/unit/services/article.service.test.ts` (5 케이스, vi.mock으로 repo 모킹) | 낮음 — 신규 파일 |
| 4 | `feat(backend): article controller 신설 (5 handler — list/get/create/update/delete) (#4)` | `backend/src/controllers/articles.controller.ts` | (단위 테스트 X — 통합 테스트로 통합 검증) | 낮음 — 신규 파일 |
| 5 | `feat(backend): articles 라우터 등록 + app 마운트 (#4)` | `backend/src/routes/articles.ts`·`backend/src/app.ts` | (라우터 자체는 마운트 1줄 — 통합 테스트가 검증) | 중간 — `app.ts` 수정 1줄, notFoundHandler 직전 등록 위치 중요 |
| 6 | `test(backend): articles 통합 테스트 9 케이스 (Supertest + 실 SQLite) (#4)` | `backend/tests/integration/articles.integration.test.ts` | 9 케이스 (GET list happy + page=0 400 + GET detail happy + 404 + POST happy + title 빈 값 400 + tag 정규화 + PUT 404 + DELETE 204 + DELETE cascade) | 중간 — 실 DB 접근, beforeEach 격리 필수 |
| 7 | `docs(plan): feat-articles-api 산출 6종 (brief·contract·plan·eng-review·acceptance·risk) (#4)` | `docs/features/feat-articles-api/*.md` 6 파일 | (문서 산출 — 코드 영향 없음) | 없음 |

> **squash 시**: 위 7 commit이 1 commit으로 압축되어 main에 기록. squash message body에 7 단계 단위 기록 자동 보존 (gh squash merge 기본 동작).

## 2. 의존성 그래프

**선수 (Blocked-by, 모두 머지 완료)**:
- #1 (`feat-monorepo-scaffold`) — backend 워크스페이스·tsconfig·eslint 골격
- #2 (`feat-backend-skeleton`) — server.ts·app.ts·env.ts·middleware·errors/{validation,not-found,repository}-error.ts
- #3 (`feat-prisma-schema-and-seed`) — prisma/schema.prisma·migrations·seed.ts·lib/prisma.ts (singleton)·dev.db

**후수 (Blocks)**:
- #6 (`feat-comments-api`) — 본 PR articleId path param 패턴 baseline
- #7 (`feat-tags-api`) — 본 PR Repository tag 부분 분리 가능 (선택)
- #11~#13 FE 페이지 (Sprint 3·4) — 본 PR 응답 schema 100% 의존

**내부 DAG**:
- commit 1 (validators) ← independent
- commit 2 (repository) ← independent (Prisma client만 의존, #3)
- commit 3 (service) ← depends on commit 1·2 (import)
- commit 4 (controller) ← depends on commit 1·3 (import)
- commit 5 (router·app) ← depends on commit 4 (import)
- commit 6 (integration test) ← depends on commit 5 (Supertest가 app 사용)
- commit 7 (docs) ← independent

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 1 | `tests/unit/validators/article.validator.test.ts` | (a) title·body·author 정상 입력 → parsed object 반환; (b) title="" → ValidationError("제목은 필수입니다"); (c) title 길이 201 → ValidationError("제목은 200자 이하여야 합니다"); (d) body="" → ValidationError("본문은 필수입니다"); (e) author="" → ValidationError("작성자는 필수입니다"); (f) author 길이 51 → ValidationError("작성자는 50자 이하여야 합니다"); (g) tagList=["JS","ts"," js "," "] → ["js","ts"] 정규화·중복 제거·빈 토큰 무시 |
| 1 | `tests/unit/validators/query.validator.test.ts` | (a) page=1·limit=10 default; (b) page=-1 → ValidationError("잘못된 페이지/리미트 값입니다"); (c) limit=51 → 동일 에러; (d) tag="JS " → "js"; (e) parsePathId("abc") → ValidationError("잘못된 ID 형식입니다") |
| 3 | `tests/unit/services/article.service.test.ts` | (a) normalizeTags(["JS","ts","js"," "]) → ["js","ts"]; (b) list 호출 → repo.findMany 호출 + paginate (page·limit·total 계산); (c) create — withTransaction 안에서 repo.insert + tag upsert + link 호출 (mock으로 호출 순서·횟수 verify); (d) get(999) → NotFoundError; (e) update(1, input) — repo.findById 후 repo.update + tag relink |
| 6 | `tests/integration/articles.integration.test.ts` | (1) GET /api/articles?page=1&limit=10 → 200 + articles.length=5 + total=5 (seed); (2) GET ?page=0 → 400; (3) GET /:id → 200 + tags 배열; (4) GET /999 → 404 + `{ error: "글을 찾을 수 없습니다" }`; (5) POST happy → 201 + 정규화 tag; (6) POST title="" → 400 + `{ error: "제목은 필수입니다" }`; (7) PUT /999 → 404; (8) DELETE /:id → 204 + body empty; (9) DELETE cascade — 글 1 + 댓글 3 + ArticleTag 2 → DELETE → 댓글/ArticleTag count 0 (R-F-07 HTTP 경로) |

**테스트 카운트 목표 (P10 AI 게이트 기준)**:
- 단위: 7 + 5 + 5 = 17 추가 → #3 baseline 13 합쳐 **30 passed**
- 통합: 9 추가 → #3 baseline 2 합쳐 **11 passed**

## 4. 빌드·실행 검증 단계

```bash
# 1) 의존성 확인 (supertest 이미 #2에서 포함, 추가 install 불필요)
pnpm install --frozen-lockfile

# 2) Prisma client 재생성 (postinstall로 자동 — 만약 환경 차단 시 manual)
pnpm --filter @app/backend prisma:generate

# 3) typecheck
pnpm typecheck

# 4) lint
pnpm lint

# 5) 단위 테스트 (validators + service)
pnpm --filter @app/backend test
# 기대: 30 passed

# 6) 통합 테스트 (실 dev.db 사용)
pnpm --filter @app/backend test:integration
# 기대: 11 passed (articles 9 + cascade 2)

# 7) 빌드
pnpm --filter @app/backend build

# 8) dev 부팅 + 5 endpoint smoke
pnpm --filter @app/backend dev   # background
sleep 2
curl -s http://localhost:3000/healthz                              # {"ok":true}
curl -s "http://localhost:3000/api/articles?page=1&limit=10" | jq  # articles.length=5
curl -s http://localhost:3000/api/articles/1 | jq                  # 200
curl -s -X POST http://localhost:3000/api/articles \
  -H 'Content-Type: application/json' \
  -d '{"title":"smoke","body":"body","author":"tester","tagList":["a","b","a"]}' | jq  # 201 + tags=["a","b"]
curl -s -X PUT http://localhost:3000/api/articles/1 \
  -H 'Content-Type: application/json' \
  -d '{"title":"u","body":"u","author":"u","tagList":[]}' | jq      # 200
curl -s -X DELETE http://localhost:3000/api/articles/1 -w "%{http_code}\n"  # 204

# 9) 3 profile 부팅 검증 (ADR-0037 v1.1, LOCAL.md §3) — 단일 환경 운영 N/A 사유 명시
#    본 PR은 dev profile 부팅 smoke만. stg/prod 부팅 자산은 #5에서 .env.{stg,prod}.example + scripts/smoke.ts 신설 예정.
#    AI 게이트 6번째 축: dev 부팅 PASS + stg/prod N/A 사유 = "Sprint 1 #5 (chore-3profile-smoke)에서 도입"
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 필요 여부**: no — 09 API spec (Gate C 산출) 정합 구현. 새로운 기술/아키텍처 결정 부재.
- **결정 1**: Repository는 *글 도메인 단일 파일*로 통합 (article·tag·articleTag 모두 `article.repo.ts`). 08 §M8 "Prisma client 호출 일원화" 정합. 후속 #7 tag API 시 분리 검토.
- **결정 2**: Validator는 *article*과 *query*를 2 파일 분리 — body schema vs path/query parser는 사용처가 다름. 08 §M9 `validateArticleInput()`·`parseListQuery()`·`parsePathId()` 정합.
- **결정 3**: Service `withTransaction(callback)`은 `prisma.$transaction(async (tx) => callback(tx))` wrapping. tx instance를 repo에 인자로 주입 (Prisma 권장 패턴). 단위 테스트는 vi.mock으로 `withTransaction`을 즉시 실행 함수로 대체.
- **결정 4**: tag 정규화 — service 레이어에서 `normalizeTags()` 함수 (controller나 validator 아님). 단위 테스트로 normalizeTags 함수 자체 verify. validator는 *형식*(배열·문자열)만 검증.
- **결정 5**: PUT은 *전체 교체* semantic — 09 spec §"PUT /api/articles/:id"가 "POST와 동일 schema (모든 필드 수정 가능)" 명시. 부분 PATCH 미제공.
- **결정 6**: DELETE 응답은 204 No Content (body 없음) — 09 spec 정합. cascade는 DB-level (#3 보장).
- **결정 7**: 통합 테스트 격리 — `tests/integration/articles.integration.test.ts`는 cascade.integration.test.ts와 동일 vitest.integration.config.ts 사용 (`pool: 'forks' + singleFork: true + fileParallelism: false`). beforeEach에서 4 deleteMany. afterAll에서 `$disconnect`.
- **결정 8**: 통합 테스트는 `buildApp(env)`로 app 인스턴스를 직접 만들어 Supertest에 주입 (server.ts의 `app.listen()` 우회). env는 mock `{ NODE_ENV: 'dev', PORT: 0, LOG_LEVEL: 'error', DATABASE_URL: process.env.DATABASE_URL }` 사용.
- **회귀 시나리오 1**: app.ts에 articlesRouter 등록 순서 오류 (notFoundHandler 뒤) → 모든 요청 404. → P5 plan-eng-review에서 commit 5 order 명시 확인.
- **회귀 시나리오 2**: tag 정규화 후 중복 제거 누락 → 통합 테스트 (5) 케이스 FAIL.
- **회귀 시나리오 3**: PUT에서 기존 ArticleTag 미삭제 → tag 누적 → 통합 테스트 또는 후속 #11 FE 회귀.
- **회귀 시나리오 4**: validator에서 trim 미수행 → 공백만 입력이 통과 → 통합 (6) FAIL 가능.
- **회귀 시나리오 5**: Prisma `findUnique`가 missing 시 throw가 아닌 null 반환 — service에서 null 체크 후 NotFoundError throw 명시 필요. → 통합 (4) (7) 검증.
- **회귀 시나리오 6**: 통합 테스트 fileParallelism 미적용 시 SQLite lock 회귀. → vitest.integration.config.ts 그대로 사용 (#3 검증 완료).

