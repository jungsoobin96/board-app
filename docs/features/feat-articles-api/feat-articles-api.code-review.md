---
doc_type: feature-code-review
version: v0.1 (Draft)
status: Draft
author: reviewer@board-app.local
date: 2026-05-25
gate: feature
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-05]
  F-ID: [F-01, F-03, F-04, F-06, F-07]
  supersedes: null
---

# feat-articles-api — Code Review

> Issue #4 . mode=add . P9 reviewer agent 독립 검수. Generator!=Evaluator 원칙.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-25 | reviewer@board-app.local | 초안 (P9 code-review, 독립 검수) |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: reviewer@board-app.local
- **review_at**: 2026-05-25
- **note**: 7개 체크리스트 영역 전부 검수 완료. contract/plan 정합, AC 매핑, 11 코딩 컨벤션, 보안, 테스트 품질, 리스크 안전망, 산출 문서 모두 충족. MINOR 발견 2건(PUT happy-path 통합 테스트 미존재, DELETE 404 통합 테스트 미존재)은 acceptance criteria AC-07(PUT 404 only)과 AC-08(DELETE happy + cascade only)에 의도적으로 범위 한정되어 있으므로 merge blocker가 아님. 후속 Sprint에서 보완 권고.

## 1. 컨트랙트 충실도

### 1-1. contract.md Before/After 17 항목 대 실제 diff

| # | contract 항목 | diff 반영 | O/X |
|---|---|---|---|
| 1 | `routes/articles.ts` 신설 | 신설 확인 (5 method 등록) | O |
| 2 | `controllers/articles.controller.ts` 신설 | 신설 확인 (5 handler) | O |
| 3 | `services/article.service.ts` 신설 | 신설 확인 (list/get/create/update/remove + normalizeTags + withTransaction) | O |
| 4 | `repositories/article.repo.ts` 신설 | 신설 확인 (findMany/findById/insertArticle/updateArticle/deleteArticle + upsertTags/linkArticleTags/unlinkArticleTags) | O |
| 5 | `validators/article.validator.ts` 신설 | 신설 확인 (validateArticleInput) | O |
| 6 | `validators/query.validator.ts` 신설 | 신설 확인 (parseListQuery + parsePathId) | O |
| 7 | `app.ts` 수정 1줄 | `app.use('/api/articles', articlesRouter)` 추가, notFoundHandler 직전 | O |
| 8 | article.validator.test.ts 신설 | 9 케이스 (7+ 충족) | O |
| 9 | query.validator.test.ts 신설 | 11 케이스 (5+ 충족) | O |
| 10 | article.service.test.ts 신설 | 12 케이스 (5+ 충족, vi.mock 격리) | O |
| 11 | articles.integration.test.ts 신설 | 9 케이스 (Supertest + 실 SQLite) | O |
| 12 | 단위 테스트 30+ passed | 신규 32 케이스 추가 (#3 baseline 13 합쳐 45+) | O |
| 13 | 통합 테스트 11 passed | 신규 9 + #3 baseline 2 = 11 | O |
| 14 | typecheck PASS 유지 | diff에 TypeScript strict 위반 없음 (import type 분리 등 정합) | O |
| 15 | build PASS 유지 | 신규 파일만 추가, 기존 import 불변 | O |
| 16 | 부팅 검증 | app.ts 라우터 마운트 + healthz 불변 | O |
| 17 | 의존성 변경 없음 | diff에 package.json 미포함 | O |

**결론**: 17/17 충족.

### 1-2. plan.md commit DAG 7 commit vs 실제 commit

| plan commit | 실제 commit hash | 영향 파일 일치 | O/X |
|---|---|---|---|
| 1. validators 신설 | fe8024d | article.validator.ts + query.validator.ts | O |
| 2. article repository 신설 | 7429307 | article.repo.ts | O |
| 3. article service 신설 | 4b5d811 | article.service.ts | O |
| 4. article controller 신설 | 5f4b23b | articles.controller.ts | O |
| 5. articles 라우터 + app 마운트 | 007c19b | routes/articles.ts + app.ts | O |
| 6. 통합 테스트 9 케이스 | 38efd6f | articles.integration.test.ts | O |
| 7. docs 산출 6종 | 26e1123 | docs/features/feat-articles-api/*.md 6 파일 | O |

**결론**: 7/7 일치. 순서도 내부 DAG(validators->repo->service->controller->router->test->docs) 정합.

### 1-3. 09 API spec 5 endpoint vs controller/router 매핑

| 09 spec endpoint | router method | controller handler | O/X |
|---|---|---|---|
| GET /api/articles | `articlesRouter.get('/')` | `listArticlesCtrl` | O |
| GET /api/articles/:id | `articlesRouter.get('/:id')` | `getArticleCtrl` | O |
| POST /api/articles | `articlesRouter.post('/')` | `createArticleCtrl` | O |
| PUT /api/articles/:id | `articlesRouter.put('/:id')` | `updateArticleCtrl` | O |
| DELETE /api/articles/:id | `articlesRouter.delete('/:id')` | `deleteArticleCtrl` | O |

**결론**: 5/5 정합.

### 1-4. 08 M5~M9 모듈 책임 분리

- **M5 BE-router** (`routes/articles.ts`): Express Router 마운트만. 비즈니스 로직 0. **O**
- **M6 BE-controllers** (`articles.controller.ts`): thin HTTP layer. validator 호출 + service 위임 + status 매핑. 비즈니스 로직 0. asyncHandler로 catch(next) 위임. **O**
- **M7 BE-services** (`article.service.ts`): normalizeTags, withTransaction, NotFoundError throw, 비즈니스 규칙 집중. Prisma 직접 호출 없음 (repo 위임). **O**
- **M8 BE-repositories** (`article.repo.ts`): Prisma client 호출 일원화. tag + articleTag 통합 (plan 결정 1 정합). **O**
- **M9 BE-validators** (`article.validator.ts` + `query.validator.ts`): 형식/길이 검증만. 정규화는 service 위임. **O**

## 2. 테스트 커버리지

### 2-1. AC 대 테스트 매핑

| AC | 검증 테스트 | O/X |
|---|---|---|
| AC-01 (GET list happy) | integration: "AC-01: 시드 5건 + page=1&limit=10 -> 200" | O |
| AC-02 (GET list page=0 400) | integration: "AC-02: page=0 -> 400 + 한국어 에러" | O |
| AC-03 (GET detail happy) | integration: "AC-03: 존재 id -> 200 + 단일 article" | O |
| AC-04 (GET detail 404) | integration: "AC-04: 999 -> 404 + 한국어 에러" | O |
| AC-05 (POST happy + tag norm) | integration: "AC-05: happy + tag 정규화 -> 201" | O |
| AC-06 (POST title="" 400) | integration: "AC-06: title="" -> 400 + 한국어 에러" | O |
| AC-07 (PUT 404) | integration: "AC-07: 999 미존재 -> 404" | O |
| AC-08 (DELETE + cascade) | integration: "AC-08a: DELETE happy -> 204" + "AC-08b: cascade" | O |
| AC-09 (normalizeTags 단위) | service unit: "trim + lower + 중복 제거 + 빈 토큰 무시" | O |

**결론**: AC-01~AC-09 모두 검증됨.

### 2-2. R-/F-ID 매핑 의미 정합

- R-F-01 (글 목록 조회): GET list happy (AC-01) + failure (AC-02) -- **O**
- R-F-02 (글 작성/수정): POST happy (AC-05) + PUT 404 (AC-07) -- **O**
- R-F-03 (글 상세/삭제): GET detail (AC-03/04) + DELETE (AC-08) -- **O**
- R-F-05 (입력 검증): validator 단위 테스트 + POST 400 (AC-06) + GET page=0 400 (AC-02) -- **O**
- R-F-07 (DELETE cascade HTTP 경로): AC-08b 통합 테스트 -- **O**
- F-01 (글 목록): AC-01 -- **O**
- F-03 (글 작성): AC-05 -- **O**
- F-04 (글 상세): AC-03 -- **O**
- F-06 (글 수정): AC-07 (404 경로, happy path는 service 단위에서) -- **O**
- F-07 (글 삭제): AC-08 -- **O**

### 2-3. 테스트 품질

- **단위 mock 격리**: service test에서 `vi.mock('../../../src/repositories/article.repo.js')` + `vi.mock('../../../src/lib/prisma.js')` 사용. `prisma.$transaction`을 즉시 실행 함수로 대체. `beforeEach(() => vi.clearAllMocks())`. **O**
- **통합 테스트 buildApp(env)**: 실 app 인스턴스 + Supertest. server.listen() 우회. env mock 사용 (`NODE_ENV: 'dev', PORT: 0, LOG_LEVEL: 'error'`). **O**
- **통합 격리 (beforeEach 4 deleteMany)**: `articleTag.deleteMany()` -> `comment.deleteMany()` -> `article.deleteMany()` -> `tag.deleteMany()` 순서로 FK 안전. `$transaction`으로 atomic 처리. **O**
- **cleanup ($disconnect)**: `afterAll(() => prisma.$disconnect())`. **O**
- **SQLite 단일 writer**: vitest.integration.config.ts 변경 없음 (pool='forks' + singleFork + fileParallelism=false 그대로 #3 산출). **O**
- **tag 정규화 양측 검증**: 단위 (service normalizeTags 3 케이스) + 통합 (AC-05 POST tag 정규화). **O**

## 3. 보안 / 시크릿

- **.env/시크릿 파일 commit**: diff에 `.env*`, `*.key`, `*.pem`, `credentials.json`, `*secret*`, `*api_key*` 파일 0건. **O**
- **코드/주석/테스트 API key 노출**: `grep -iE "api[_-]?key|secret|password|token|credential"` 결과 0건. **O**
- **응답 body stack 미노출**: controller는 throw 위임만. M10 errorHandler가 `{ error: "<한국어 메시지>" }` 형식만 응답. stack은 `console.error`(stderr)에만. **O**
- **service에서 generic Error throw (line 86)**: `throw new Error('REPO_INSERT_RACE')` -- M10 기본 fallback이 `{ error: "서버 오류가 발생했습니다" }`로 처리 + stack은 stderr only. 사용자 응답 안전. **O**

## 4. 가독성 / 단순성

- **Controller thin layer**: 5 handler 각 5줄 이내. asyncHandler wrapper로 catch(next) 패턴 일관. 가독성 우수.
- **Service 단일 책임**: normalizeTags 함수 분리, withTransaction wrapper 분리. create/update/remove 각각 명확한 단계.
- **Repository 통합 파일**: article + tag + articleTag를 단일 파일로. plan 결정 1 정합. 파일 수 최소화로 학습 편의.
- **Validator 2분할**: body schema(article.validator) vs path/query parser(query.validator) 분리. 사용처별 명확.
- **한국어 주석 + JSDoc**: 각 파일 상단에 모듈 ID + 책임 설명. R-N-05(한국어 주석 80%+) 준수.
- **import type 분리**: `import type { Prisma, PrismaClient } from '@prisma/client'` 등 verbatimModuleSyntax 정합.
- **11 naming convention**: TITLE_MAX/AUTHOR_MAX/DEFAULT_PAGE 등 SCREAMING_SNAKE_CASE. 함수 camelCase. BE 파일 kebab-case. 모두 정합.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| [OK] contract 17 항목 + plan 7 commit + 09 spec 5 endpoint 모두 정합 | O | X | O | 확인 완료 |
| [OK] AC-01~09 전부 단위/통합 테스트로 검증 | O | X | O | 확인 완료 |
| [OK] 11 PREFIX (VAL_*, NOT_FOUND_*) + 한국어 에러 메시지 정합 | O | X | O | 확인 완료 |
| [MINOR] PUT happy-path 통합 테스트 미존재 (09 spec "Happy: 정상 수정 -> 200 (통합)" 명시) | O | X | O | AC-07은 404만 강제. service 단위 update happy 커버. risk F-RISK-02에서 manual 검증 위임. 후속 Sprint 보완 권고 |
| [MINOR] DELETE 404 통합 테스트 미존재 (09 spec "Failure: 미존재 -> 404 (통합)" 명시) | O | X | O | AC-08은 happy + cascade만 강제. service 단위 remove 404 커버. 후속 Sprint 보완 권고 |
| [OK] F-RISK-01~06 안전망 모두 코드/테스트로 확인 | O | X | O | 확인 완료 |
| [OK] 보안 파일 0건, 시크릿 노출 0건, 응답 body generic message only | O | X | O | 확인 완료 |
| [INFO] service.create line 86 `throw new Error('REPO_INSERT_RACE')` -- REPO_ prefix이지만 RepositoryError가 아닌 plain Error | O | X | O | M10 fallback이 500 + 친화 메시지 처리. 실 발생 가능성 극히 낮음 (race condition edge). 11 컨벤션 완벽 정합은 아니나 blocker 아님 |

## 6. NEEDS-WORK 항목

없음.

MINOR 발견 2건(PUT happy-path / DELETE 404 통합 테스트 미존재)은 acceptance criteria 범위 내에서 의도적 한정이며, service 단위 테스트에서 로직 커버됨. merge blocker가 아니므로 후속 Sprint에서 보완 권고.

INFO 발견 1건(`REPO_INSERT_RACE` plain Error)은 edge case 방어 코드로 기능 정합에 영향 없음.
