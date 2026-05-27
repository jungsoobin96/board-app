---
doc_type: test-design
version: v0.1 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-22
gate: C
related:
  R-ID: [R-F-01, R-F-02, R-F-03, R-F-04, R-F-05, R-F-06, R-F-07, R-F-08, R-N-01, R-N-02, R-N-03, R-N-04, R-N-05, R-N-06, R-N-07]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-12]
  supersedes: null
---

# 02-catalog Test Scenario Catalog (단위·통합·E2E 별 묶음) — test-design

> 13-test-design 5절 폴더 sub-file (ADR-0030 + ADR-0036). 04 SRS R-F-XX·R-N-XX + 05 PRD F-XX 시나리오를 *레벨 단위로* 묶어 카탈로그한다. §4 매트릭스는 ❌(미작성) 금지 — ✅(작성) 또는 N/A(부적합)만 허용.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-design Phase 2/4) |
| v0.2 | 2026-05-26 | woosung.ahn@bespinglobal.com | Issue #6 PR — F-05 (댓글 작성·삭제) §1 단위 + §2 통합 fan-in. ADR-0035 WARN 1건 해소 (잔여 F-08·F-12는 #7·Sprint 6 별 진행). |
| v0.3 | 2026-05-26 | woosung.ahn@bespinglobal.com | Issue #7 PR — F-02 (태그 필터) + F-08 (인기 태그 사이드바) §1·§2 fan-in. ADR-0035 WARN 2건 추가 해소 (잔여 F-12만 Sprint 6 별 진행). |
| v0.4 | 2026-05-26 | woosung.ahn@bespinglobal.com | Issue #9 PR — R-N-02 §2 통합 보강 fan-in (전 9 endpoint × ~2 에러 + notFoundHandler + 의도 throw 500). 단위 layer와 별 axis 명시. |
| v0.5 | 2026-05-26 | jungsoobin96@users.noreply.github.com | Issue #10 PR — R-F-08 §1 단위 보강(matchRoute 헬퍼) + F-11 §1 skeleton 발현 fan-in (frontend 골격 도입). 정밀 반응형은 Sprint 5 #21 별 진행. |
| v0.6 | 2026-05-27 | jungsoobin96@users.noreply.github.com | Issue #11 PR — R-N-02 §1 frontend layer 보강 fan-in (normalizeResponse + normalizeNetworkError + 9 method URL/method 정합). backend §1 errorHandler 단위(#2) + 통합(#9) 위에 FE client 단위 layer 추가. R-N-02 매트릭스 ✅·✅·✅ 그대로. |
| v0.7 | 2026-05-27 | jungsoobin96@users.noreply.github.com | Issue #12 PR — R-F-01·R-F-04·F-01·F-02·F-08·F-11 §1 단위 fan-in (Home 페이지 — useArticles 5상태·AbortController·ArticleCard·Pagination·TagList RTL snapshot). MSW 통합 1건은 vitest jsdom 통합 미작동으로 skip + follow-up. R-N-06 a11y 시맨틱 + focus ring 발현. |

## 1. 단위 테스트 카탈로그

본 §은 *단위 레벨* 테스트만 모은다. controller mock·repo mock·validator 함수 단독·React 컴포넌트(jsdom)는 모두 본 §에 위치.

### R-F-01: 글 목록 API — 단위

출처: 04#R-F-01, 05#F-01
테스트 레벨: 단위
대상 모듈: M6 BE-controllers (`listArticlesCtrl`), M7 BE-services (`paginate`)
- Happy: page=1·limit=10 입력 → controller가 service에 정규화된 인자 전달
- Failure: page=-1 → ValidationError throw 검증
- 보조: `paginate(skip, take)` 단위 계산 로직 (offset = (page-1)*limit)

### R-F-02: 글 작성·수정 — 단위

출처: 04#R-F-02, 05#F-03, 05#F-06
테스트 레벨: 단위
대상 모듈: M7 BE-services (`normalizeTags`), M9 BE-validators (`validateArticleInput`)
- Happy: tagList `["JS"," ts ","js"]` → 정규화 결과 `["js","ts"]` (trim·lower·중복 제거)
- Failure: title 빈 값 → ValidationError + code `VAL_TITLE_REQUIRED`
- Failure: title > 200자 → ValidationError + code `VAL_TITLE_TOO_LONG`

### R-F-03: 글 상세·삭제 — 단위

출처: 04#R-F-03, 05#F-04, 05#F-07
테스트 레벨: 단위
대상 모듈: M6 controllers, M10 error classes
- Happy: 존재 ID → service 결과 그대로 200 응답
- Failure: NotFoundError throw → controller가 next(err) 호출 검증

### R-F-04: 태그 API — 단위

출처: 04#R-F-04, 05#F-02, 05#F-08
테스트 레벨: 단위
대상 모듈: M7 services (`TagService.list` — 정렬·상한 로직)
- Happy: 빈도 desc 정렬 + 상한 20 적용
- Failure: DB throw 시 RepositoryError 전파

### R-F-05: 입력 검증 — 단위

출처: 04#R-F-05, 05#F-03, 05#F-05, 05#F-06
테스트 레벨: 단위
대상 모듈: M9 validators (validateArticleInput, validateCommentInput, parseListQuery, parsePathId)
- Happy: 정상 입력 통과
- Failure: title 빈 값 / body 빈 값 / page=-1 / id="abc" 등 4종 case별 ValidationError + code 검증

### R-F-06: 댓글 API — 단위

출처: 04#R-F-06, 05#F-05
테스트 레벨: 단위
대상 모듈: M6 commentsController, M9 validateCommentInput
- Happy: body·author 정상 → 응답 객체 형식
- Failure: 빈 body → ValidationError

### R-F-07: cascade — 단위

출처: 04#R-F-07
테스트 레벨: 단위
대상 모듈: M7 `withTransaction` (트랜잭션 wrapper 단독)
- Happy: 모든 단계 성공 → commit 호출 검증
- Failure: 중간 throw → rollback 호출 + 에러 재던지기

### R-F-08: 라우팅 — 단위

출처: 04#R-F-08, 05#F-01, 05#F-04
테스트 레벨: 단위
대상 모듈: M1 FE-router (경로 매칭 함수 — `matchRoute("/article/123")`)
- Happy: 5개 path 매칭 정상 결과 반환
- Failure: 미일치 경로 → NotFound 매핑

### R-N-02: 에러 응답 schema — 단위

출처: 04#R-N-02
테스트 레벨: 단위
대상 모듈: M10 errorHandler (미들웨어 단독)
- Happy: ValidationError → 400 + `{ error: string }`
- Failure: 일반 Error → 500 + 일반 메시지 (스택 미노출 검증 — body에 stack 없음)

### R-N-06: 반응형 — 단위

출처: 04#R-N-06, 05#F-11
테스트 레벨: 단위
대상 모듈: M3 components (snapshot)
- Happy: `<ArticleCard>` snapshot 1종 (PR diff 시 변화 감지)
- Failure: snapshot mismatch → CI fail

### R-F-08: 라우팅 — 단위 (보강)

출처: 04#R-F-08, 05#F-11, M1 FE-router
테스트 레벨: 단위
대상 모듈: M1 FE-router `matchRoute(pathname)` 헬퍼
- Happy: 5 path (`/`, `/article/:id`, `/editor`, `/editor/:id`) → route name + params
- Happy: slug 형식 (`/article/abc-with-dashes`) → params.id 유지
- Failure: `/nonexistent` → 'notfound'
- 발현: Sprint 3 / Issue #10 (PR feat/frontend-skeleton-issue-10)

### F-11: 반응형 UI — 단위 (skeleton 발현)

출처: 05#F-11, 04#R-N-06
테스트 레벨: 단위
대상 모듈: M1 router + M2 pages 4종 + M3 Layout·ErrorBoundary placeholder
- Happy: 5 path 모두 page placeholder 노출
- Happy: 10 §3 design token 4종 CSS Variables → Tailwind theme.extend 매핑 (`bg-primary-500` → `#3b82f6`)
- 사용자 브라우저 검증: 5 path 진입 + Home `bg-primary-500` 시각 확인 (스크린샷 첨부)
- 발현: Sprint 3 / Issue #10. 정밀 반응형 검증은 Sprint 5 #21

### R-N-02: 에러 응답 schema 일관성 — 단위 (frontend layer 보강)

출처: 04#R-N-02, M4 FE-api-client
테스트 레벨: 단위
대상 모듈: M4 FE-api-client `normalizeResponse` + `normalizeNetworkError` + 9 method (client.ts)
- Happy: 9 method × URL/method 정합 (`expect(fetch).toHaveBeenCalledWith(...)`)
- Failure: 4xx/5xx + `{error}` body → NormalizedError(status, message)
- Failure: body parse fail → NormalizedError(status, '서버 응답을 처리할 수 없습니다')
- Failure: offline (fetch reject) → NormalizedError(0, '네트워크 오류')
- 발현: Sprint 3 / Issue #11 (PR feat/frontend-api-client-issue-11). backend errorHandler 단위(#2) + 통합(#9) 양축 위에 frontend client 단위 layer 추가

### F-05: 댓글 작성·삭제 — 단위

출처: 05#F-05, 04#R-F-06, 04#R-F-05
테스트 레벨: 단위
대상 모듈: M9 `validateCommentInput`, M7 `comment.service.create/list/remove`
- Happy: body·author trim → ParsedCommentInput 반환 (정상 케이스)
- Failure: body 빈/공백만 → `VAL_COMMENT_BODY_REQUIRED` ValidationError
- Failure: author 빈/51자 → `VAL_COMMENT_AUTHOR_REQUIRED`/`VAL_COMMENT_AUTHOR_TOO_LONG`
- Failure (service): article 미존재 → NotFoundError "글을 찾을 수 없습니다"
- Failure (service): DELETE articleId mismatch → NotFoundError "댓글을 찾을 수 없습니다"
- 발현: Sprint 2 / Issue #6 (PR feat/comments-api-issue-6)

### F-02: 태그 필터 — 단위

출처: 05#F-02, 04#R-F-04
테스트 레벨: 단위
대상 모듈: M7 `tag.service.list` (정렬·상한·response shape 매핑)
- Happy: repo mock 결과 → `{ tags: [{name, count}] }` shape 매핑
- Happy: default limit 20 전달
- Happy: 빈 결과 → `{ tags: [] }`
- 발현: Sprint 2 / Issue #7 (PR feat/tags-api-issue-7)

### F-08: 인기 태그 사이드바 — 단위

출처: 05#F-08, 04#R-F-04
테스트 레벨: 단위
대상 모듈: M7 `tag.service.list` (위 F-02와 동일 service — 사이드바 데이터 소스)
- (F-02 단위 케이스로 fan-in 흡수)
- 발현: Sprint 2 / Issue #7

### F-10: 한국어 주석 ≥80% — 단위

출처: 05#F-10 (R-N-05)
테스트 레벨: 단위
대상: grep script (`scripts/check-comment-coverage.sh`)
- Happy: 핵심 4 디렉토리 함수 헤더 한국어 주석 ≥80% → exit 0
- Failure: < 80% → exit 1 + 누락 함수 목록

## 2. 통합 테스트 카탈로그

본 §은 *통합 레벨* — Supertest로 HTTP 입출력 + 실 SQLite (`prisma/test.db`)를 거치는 시나리오.

### R-F-01: 글 목록 통합

출처: 04#R-F-01, 05#F-01, 05#F-02
테스트 레벨: 통합
대상: GET /api/articles (M5→M6→M7→M8→M11)
- Happy: 25건 시드 → page=1·limit=10 → articles.length=10, total=25
- Happy: ?tag=javascript → 해당 태그 글만 반환
- Failure: ?page=-1 → 400 + 에러 schema
- Failure: ?tag=ghost → articles=[], total=0 (에러 아님)

### R-F-02: 글 작성·수정 통합

출처: 04#R-F-02, 05#F-03, 05#F-06
테스트 레벨: 통합
대상: POST /api/articles, PUT /api/articles/:id
- Happy POST: title/body/author/tagList → 201 + 글 ID + tag 정규화 적용 확인
- Happy PUT: 기존 id → 200 + updatedAt 갱신, 변경값 DB 반영
- Failure POST: title 빈 값 → 400
- Failure PUT: 미존재 id → 404

### R-F-03: 글 상세 통합

출처: 04#R-F-03, 05#F-04
테스트 레벨: 통합
대상: GET /api/articles/:id, DELETE /api/articles/:id
- Happy: 존재 ID → 200 + 본문/태그/작성자 정합
- Failure: 999 → 404 + 에러 schema
- Failure: /api/articles/abc → 400

### R-F-04: 태그 API 통합

출처: 04#R-F-04, 05#F-02, 05#F-08
테스트 레벨: 통합
대상: GET /api/tags (실 DB 빈도 집계)
- Happy: 30종 태그 사용 시드 → 빈도 desc 상위 20개 응답
- Failure: DB 오류 mock → 500

### R-F-05: 입력 검증 통합

출처: 04#R-F-05, 05#F-03, 05#F-05, 05#F-06
테스트 레벨: 통합
대상: POST·PUT 글, POST 댓글 (M6→M9 흐름)
- Happy: 정상 입력 모든 엔드포인트 통과
- Failure: 빈 값·과길이·잘못된 형식 → 400 + 정확한 한국어 에러 메시지

### R-F-06: 댓글 API 통합

출처: 04#R-F-06, 05#F-05
테스트 레벨: 통합
대상: GET·POST·DELETE /api/articles/:id/comments
- Happy: 작성 → 조회 → 삭제 시나리오 (3 API 연쇄)
- Failure: 미존재 articleId → 404
- Failure: 이미 삭제된 commentId → 404 (idempotent 안내)

### R-F-07: cascade 통합

출처: 04#R-F-07, 05#F-07
테스트 레벨: 통합
대상: DELETE /api/articles/:id (실 DB cascade 확인)
- Happy: 글+댓글 3건 → DELETE → Article·Comment 모두 articleId 행 0건
- Happy: ArticleTag 매핑도 cascade 삭제 확인 (Tag 자체는 남음)
- Failure: 트랜잭션 rollback 시나리오 (force throw 주입) — 모두 보존

### F-05: 댓글 작성·삭제 — 통합

출처: 05#F-05, 04#R-F-06, 04#R-F-05
테스트 레벨: 통합
대상: GET·POST·DELETE `/api/articles/:id/comments[/:commentId]` (M5→M6→M7→M8→M11)
- Happy POST: `{body,author}` → 201 + comment 반환 + DB count +1
- Happy DELETE: 204 + DB count -1
- Happy GET: createdAt DESC 정렬 + comments 배열
- Failure POST/GET/DELETE: 미존재 articleId → 404 + "글을 찾을 수 없습니다"
- Failure POST: 빈 body → 400 + "본문은 필수입니다"
- Failure DELETE: articleId mismatch (다른 article의 commentId) → 404 + "댓글을 찾을 수 없습니다" + DB 미삭제 확인
- 회귀: cascade fan-in — 글+댓글 3건 → DELETE article → GET comments 404 + Comment row 0건 (schema-level CASCADE 검증, comments 시점)
- 발현: Sprint 2 / Issue #6 (PR feat/comments-api-issue-6)

### F-02: 태그 필터 — 통합

출처: 05#F-02, 04#R-F-04
테스트 레벨: 통합
대상: GET `/api/tags` (M5→M6→M7→M8→M11) + 글 작성 시 tag upsert (article repo)
- Happy: 30종 시드 + 글 매핑 다양 → 200 + `{tags:[{name,count}]}` count desc 상위 20
- Happy: 빈 DB → 200 + `{tags:[]}`
- Happy: 동률 5종 (동일 count=3) → 모두 포함 (secondary sort 비목표)
- 발현: Sprint 2 / Issue #7

### F-08: 인기 태그 사이드바 — 통합

출처: 05#F-08, 04#R-F-04
테스트 레벨: 통합
대상: GET `/api/tags` (F-02 단위와 동일 endpoint — 사이드바 BE 데이터 소스)
- (F-02 통합 케이스로 fan-in 흡수)
- 발현: Sprint 2 / Issue #7

### R-N-01: 응답 시간 측정

출처: 04#R-N-01
테스트 레벨: 통합
대상: GET /api/articles (100건 시드, p95 측정)
- Happy: p95 < 200ms 통과
- Failure (옵션): 1000건 시드 시 200ms 초과 → WARN 로그 (BLOCK 아님, MVP 범위 외)

### R-N-02: 에러 schema 일관성

출처: 04#R-N-02
테스트 레벨: 통합
대상: 전 엔드포인트의 4xx/5xx (의도 throw 주입)
- Happy: 모든 에러 응답이 `{ error: string }` 형식
- Failure: 스택이 body에 포함된 응답 → fail

### R-N-02: 에러 schema 일관성 — 통합 (보강)

출처: 04#R-N-02, 11 §2 PREFIX, M10 errorHandler
테스트 레벨: 통합
대상: 전 endpoint(9건) 4xx/5xx 응답 + notFoundHandler + 의도 throw 500
- Happy 4xx: 9 endpoint × ~2 에러 케이스 모두 `{error:string}` schema + stack/code 미노출 (expectErrorSchema 헬퍼)
- Failure 500: vi.mock(tag.service.list) throw 주입 → 500 + "서버 오류가 발생했습니다" + stderr stack
- Failure 404: notFoundHandler `/nonexistent-path` → 404 + "요청한 리소스를 찾을 수 없습니다"
- 발현: Sprint 2 / Issue #9 (PR feat/error-schema-integration-issue-9). 단위 errorHandler.test.ts(#2)와 별 layer

### R-N-04: 3 profile 부팅 smoke

출처: 04#R-N-04, 05#F-09
테스트 레벨: 통합
대상: 부팅 후 GET /api/articles 200 응답
- Happy: dev/stg/prod 3 profile 모두 5초 이내 ready + 200 응답
- Failure: 어느 profile 부팅 실패 → PR 머지 BLOCK (CLAUDE.md 필수 규칙 #10)

## 3. E2E 테스트 카탈로그

본 §은 *E2E 레벨* — Playwright(또는 gstack `/qa` 수동)로 브라우저 자동화. 사용자 골든 패스가 본 §의 대상.

### F-01: 글 목록 + 페이지네이션 E2E

출처: 05#F-01, 04#R-F-01
테스트 레벨: E2E
시나리오 (UC-01):
- Happy: `/` 진입 → 글 카드 10개 노출 → "다음" 클릭 → ?page=2 + 11~20번째 글 노출
- Failure: /?page=-1 직접 진입 → page=1로 fallback + 안내

### F-02: 태그 필터 E2E

출처: 05#F-02, 04#R-F-04
테스트 레벨: E2E
시나리오 (UC-02):
- Happy: 사이드바 "javascript" 태그 클릭 → /?tag=javascript 이동 + 필터링 결과
- Failure: 존재 X 태그 직접 URL → 빈 목록 안내

### F-03: 글 작성 E2E

출처: 05#F-03, 04#R-F-02
테스트 레벨: E2E
시나리오 (UC-03):
- Happy: "새 글" → /editor → 4 필드 입력 → "발행" → /article/:id 이동 + 노출
- Failure: title 빈 값 "발행" → 인라인 에러 + 입력값 보존

### F-04: 글 상세 + 댓글 E2E

출처: 05#F-04, 05#F-05, 04#R-F-03, 04#R-F-06
테스트 레벨: E2E
시나리오 (UC-04):
- Happy: 카드 클릭 → 상세 → 댓글 작성 → 즉시 노출 → 본인 댓글 삭제 → 영역 갱신
- Failure: 미존재 /article/999 → S-05 NotFound

### F-06: 글 수정 E2E

출처: 05#F-06, 04#R-F-02
테스트 레벨: E2E
시나리오 (UC-05 수정):
- Happy: 상세 → "수정" → /editor/:id → 사전 로드 → 변경 → "저장" → 상세 갱신값
- Failure: 미존재 /editor/999 → S-05 NotFound

### F-07: 글 삭제 cascade E2E

출처: 05#F-07, 04#R-F-07
테스트 레벨: E2E
시나리오 (UC-05 삭제):
- Happy: 댓글 있는 글 상세 → "삭제" → 확인 → 홈 navigate → 목록 미노출 + 댓글 영역 빈 상태 (cascade 시각 확인)

### F-09: README 재현성 E2E

출처: 05#F-09, 04#R-N-03
테스트 레벨: E2E
시나리오 (UC-06):
- Happy: 새 PC + README 따라 install→dev → 부팅 + 시드 글 노출 (수동 골든 패스 — gstack `/qa`)
- Failure: 누락 단계 발견 시 ADR로 README 보강

### F-11: 반응형 E2E

출처: 05#F-11, 04#R-N-06
테스트 레벨: E2E
시나리오:
- Happy: 360/768/1024/1440px viewport에서 5 페이지 진입 → 레이아웃 정상 (gstack viewport 스위치)
- Failure: 특정 viewport 콘텐츠 잘림 → 디자인 보강

## 4. 레벨 매트릭스 (단위·통합·E2E)

본 §은 04 R-XX·05 F-XX 1개당 1행. 각 셀은 ✅(적용) 또는 N/A(부적합)만 허용 — ❌(미작성) 금지 (ADR-0023). 본 매트릭스가 12 Test Design fan-in의 완결성 검증 정본.

| ID(R-/F-) | 단위 | 통합 | E2E | 비고 |
|---|---|---|---|---|
| R-F-01 (글 목록 API) | ✅ | ✅ | ✅ | F-01과 1:1 |
| R-F-02 (글 작성·수정 API) | ✅ | ✅ | ✅ | F-03·F-06 |
| R-F-03 (글 상세·삭제 API) | ✅ | ✅ | ✅ | F-04·F-07 |
| R-F-04 (태그 API) | ✅ | ✅ | ✅ | F-02·F-08 |
| R-F-05 (입력 검증) | ✅ | ✅ | ✅ | UI 인라인 에러 (F-03·F-05·F-06) |
| R-F-06 (댓글 API) | ✅ | ✅ | ✅ | F-05 |
| R-F-07 (cascade) | ✅ | ✅ | ✅ | F-07 시각 확인 |
| R-F-08 (라우팅) | ✅ | N/A | ✅ | 통합 N/A — 단위(라우터 매칭)+E2E로 충분 |
| R-N-01 (응답 시간 < 200ms) | N/A | ✅ | ✅ | 단위 N/A — 성능은 통합·E2E 측정 |
| R-N-02 (에러 schema) | ✅ | ✅ | ✅ | F-04·F-05 인라인 에러 검증 |
| R-N-03 (README 재현성) | N/A | N/A | ✅ | E2E 수동 (UC-06) |
| R-N-04 (3 profile 부팅) | N/A | ✅ | ✅ | LOCAL.md §3 검증 |
| R-N-05 (한국어 주석 ≥80%) | ✅ | N/A | N/A | 정적 grep 룰 단위 |
| R-N-06 (반응형) | ✅ | N/A | ✅ | snapshot + viewport E2E |
| R-N-07 (시크릿 안내) | N/A | N/A | N/A | 정적 분석 + PreToolUse 훅 (테스트 외) |
| F-01 (글 목록 + 페이지네이션) | ✅ | ✅ | ✅ | R-F-01 묶음 |
| F-02 (태그 필터) | ✅ | ✅ | ✅ | R-F-04 묶음 |
| F-03 (글 작성) | ✅ | ✅ | ✅ | R-F-02 묶음 |
| F-04 (글 상세) | ✅ | ✅ | ✅ | R-F-03 묶음 |
| F-05 (댓글 작성·삭제) | ✅ | ✅ | ✅ | R-F-06 묶음 |
| F-06 (글 수정) | ✅ | ✅ | ✅ | R-F-02 묶음 |
| F-07 (글 삭제 cascade) | ✅ | ✅ | ✅ | R-F-07 묶음 |
| F-08 (인기 태그 사이드바) | ✅ | ✅ | ✅ | R-F-04 묶음 |
| F-09 (README 친화) | N/A | N/A | ✅ | E2E 수동 |
| F-10 (한국어 주석) | ✅ | N/A | N/A | 정적 grep 단위 |
| F-11 (반응형 UI) | ✅ | N/A | ✅ | viewport |
| F-12 (보안 안내) | N/A | N/A | N/A | 정적 + 훅 |
