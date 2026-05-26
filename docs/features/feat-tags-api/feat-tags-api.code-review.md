---
doc_type: feature-code-review
version: v0.1
status: Draft
author: claude-reviewer-agent@anthropic.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-04]
  F-ID: [F-02, F-08]
  supersedes: null
---

# feat-tags-api — Code Review

> Issue #7 -- mode=add -- P9 산출. Generator(developer)와 독립된 Reviewer agent가 5 commit + 7 신규/변경 파일에 대해 8단계 점검 수행. articles/comments 패턴 답습 PR.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | claude-reviewer-agent@anthropic.com | 초안 (P9 code-review, Generator!=Evaluator 독립 검수) |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: claude-reviewer-agent@anthropic.com
- **review_at**: 2026-05-26
- **note**: 230 lines, 단일 read-only GET endpoint. articles/comments 패턴 100% 답습. MAJOR 발견 0, MINOR 2 (follow-up 후보), INFO 3. 머지 차단 사유 없음.

## 1. 컨트랙트 충실도

Contract(feat-tags-api.contract.md) Before/After 11 항목 대비 실제 코드 정합 검증:

| # | Contract 항목 | 코드 정합 | 판정 |
|---|---|---|---|
| 1 | `backend/src/routes/tags.ts` 신설 -- Router() + GET / | tags.ts L8-10: `Router()` + `tagsRouter.get('/', listTagsCtrl)` | OK |
| 2 | `backend/src/controllers/tags.controller.ts` 신설 -- 1 handler + asyncHandler | tags.controller.ts L8-19: asyncHandler + listTagsCtrl 1 handler | OK |
| 3 | `backend/src/services/tag.service.ts` 신설 -- list() + DEFAULT_LIMIT=20 + response shape | tag.service.ts L9-17: `DEFAULT_LIMIT=20`, `list()` -> `{ tags }` | OK |
| 4 | `backend/src/repositories/tag.repo.ts` 신설 -- findManyByFrequency(limit) + Prisma _count orderBy | tag.repo.ts L12-22: `findManyByFrequency(limit)`, `_count.articleTags`, `orderBy: { articleTags: { _count: 'desc' } }`, `take: limit` | OK |
| 5 | `backend/src/app.ts` + `app.use('/api/tags', tagsRouter)` 1줄 | app.ts L30: `app.use('/api/tags', tagsRouter)` -- comments 직후, notFoundHandler 직전 | OK |
| 6 | 단위 테스트 3+ 케이스 | tag.service.test.ts: 3 케이스 (default limit / 빈 결과 / 명시 limit) | OK |
| 7 | 통합 테스트 3+ 케이스 | tags.integration.test.ts: 3 케이스 (AC-01/02/03 매핑) | OK |
| 8 | typecheck PASS 유지 | Prisma `_count` select + orderBy syntax schema 정합 확인 (Tag.articleTags 관계 존재) | OK |
| 9 | build PASS 유지 | 의존성 추가 0, import 체인 정상 | OK |
| 10 | 부팅 자산 변경 없음 | .env.example, migrations, lockfile, LOCAL.md 미수정 | OK |
| 11 | 09 API spec 9/9 완결 | GET /api/tags 신설로 9번째 endpoint 달성 | OK |

**Plan 커밋 시퀀스 (6 commit DAG) 대비 실제 5 commit**: plan commit 1~5와 1:1 대응. commit 6 (docs)은 본 PR 외 docs P10에서 처리 -- 정합.

## 2. 테스트 커버리지

### 단위 테스트 (tag.service.test.ts, 3 cases)

| Case | Plan 매핑 | AC 매핑 | 검증 내용 | 판정 |
|---|---|---|---|---|
| default limit 20 | plan SS3(a)(c) | AC-01 부분 | `findManyByFrequency(20)` 호출 + response shape `{ tags: [...] }` | OK |
| 빈 결과 | plan SS3(b) | AC-02 | `{ tags: [] }` 반환 | OK |
| 명시 limit 5 | plan SS3(c) | -- | `findManyByFrequency(5)` 호출 확인 | OK |

- vi.mock 격리 정상 (repo mock -> service 단독 검증)
- `beforeEach` clearAllMocks 적용

### 통합 테스트 (tags.integration.test.ts, 3 cases)

| Case | AC 매핑 | 검증 내용 | 판정 |
|---|---|---|---|
| AC-01: 30종 시드 | AC-01 | 200 + length=20 + count desc + tags[0]=tag-30(count=30) + monotonic decreasing | OK |
| AC-02: 빈 태그 | AC-02 | 200 + `{ tags: [] }` | OK |
| AC-03: 동률 5종 | AC-03 | 200 + length=5 + 모든 count=3 + 5종 name 포함 (순서 무단언, sorted 비교) | OK |

- `beforeEach` 4 deleteMany 격리 = articles/comments 패턴 답습 (articleTag -> comment -> article -> tag)
- `afterAll` `$disconnect` 정상
- AC-03 동률 검증: 특정 index 순서 단언 없음 -- `names.sort()` 후 배열 비교로 flaky 방지 (T-RISK-04 완화 확인)

### 시드 함수 `seedThirtyTagsWithFrequency` 검토

- await 순회 (for loop + await) 사용: 30개 article + 30개 tag 각각 순차 생성. 총 60+ DB calls
- 개선 가능: `Promise.all`로 article 생성 병렬화, `createMany`로 tag 일괄 생성
- **판정**: INFO -- 테스트 격리 우선 패턴으로 합리적. 성능 최적화는 테스트 실행 시간이 문제될 때 개선

## 3. 보안 / 시크릿

| 점검 항목 | 결과 |
|---|---|
| console.log / console.debug 잔존 | 0건 (grep 확인) |
| process.env 직접 참조 (src) | 0건 |
| TODO / FIXME / HACK / XXX | 0건 |
| secret / api_key / password / token / credential 문자열 | 0건 |
| .env 파일 커밋 | 0건 (schema/migration 미수정) |
| SQL injection | N/A -- Prisma parameterized query only |
| 입력 검증 | N/A -- GET, query/body 없음 |
| 에러 응답 leak | DB 오류 시 errorHandler가 generic "서버 오류가 발생했습니다" 반환 (기존 패턴) |

T-RISK-06 (시크릿 노출) 완화 확인: 본 PR 4 src 파일 + 2 test 파일에 시크릿/환경변수 직접 참조 0건.

## 4. 가독성 / 단순성

### 패턴 일관성 (articles/comments 답습)

| 측면 | articles | comments | tags (본 PR) | 일관 |
|---|---|---|---|---|
| router 파일명 | articles.ts | comments.ts (mergeParams) | tags.ts | OK |
| controller 파일명 | articles.controller.ts | comments.controller.ts | tags.controller.ts | OK |
| service 파일명 | article.service.ts | comment.service.ts | tag.service.ts | OK (단수형) |
| repo 파일명 | article.repo.ts | comment.repo.ts | tag.repo.ts | OK (단수형) |
| asyncHandler 위치 | controller 내 정의 | controller 내 정의 | controller 내 정의 | OK (중복 인지, INFO) |
| 모듈 JSDoc M-번호 | M5/M6/M7/M8 | M5/M6/M7/M8 | M5/M6/M7/M8 | OK |
| export 스타일 | named const | named const | named const | OK |
| import .js 확장자 | 일관 | 일관 | 일관 | OK |

### MINOR 발견

1. **asyncHandler 3중 중복** (articles.controller + comments.controller + tags.controller): 동일 함수 3곳 정의. #6 code-review에서 이미 follow-up 후보로 logged. 본 PR이 3번째 복사본 확정. Sprint 2 내 또는 Sprint 3 초반에 `middleware/async-handler.ts`로 추출 권장.

2. **`seedThirtyTagsWithFrequency` 시드 최적화 가능**: 60+ await 순차 호출 -> `Promise.all` + `createMany` 조합으로 ~10x 개선 가능. 단, 테스트 격리 우선이라 현재 합리적. 테스트 suite 실행 시간 체감 시 개선 후보.

### 코드 크기 적정성

- src 71 lines (4 files) + tests 159 lines (2 files) + app.ts 2 lines = 총 ~232 lines
- 단일 read-only endpoint 대비 적정. 과잉/부족 없음.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| MINOR-01: asyncHandler 3중 중복 (articles+comments+tags controller) | O | X | O | follow-up 이슈 후보 (#6에서 이미 logged). Sprint 2~3 추출 |
| MINOR-02: seedThirtyTagsWithFrequency 60+ 순차 await -- Promise.all 병렬화 가능 | O | X | O | 성능 체감 시 개선. 현재 격리 우선 합리적 |
| INFO-01: Prisma _count orderBy syntax -- schema Tag.articleTags 관계 존재 확인, Prisma 5.x 정합 | O | X | O | 확인 완료, 위험 없음 |
| INFO-02: 동률 정렬 AC-03 -- sorted name 비교로 flaky 방지 확인 (T-RISK-04 완화) | O | X | O | 비목표(secondary sort) 처리 적정 |
| INFO-03: 09 API spec 9/9 endpoint 완결 -- 글 5 + 댓글 3 + 태그 1 | O | X | O | milestone 달성 기록 |

## 6. NEEDS-WORK 항목

없음. MAJOR 발견 0건. MINOR 2건은 모두 `blocks_merge=X` (follow-up 후보, 머지 차단 불필요).

### T-RISK 7건 Mitigation 실제 구현 확인

| RISK-ID | Mitigation | 실제 구현 | 판정 |
|---|---|---|---|
| T-RISK-01 | typecheck + AC-01 정렬 검증 | tag.repo.ts L18 `orderBy: { articleTags: { _count: 'desc' } }` -- schema Tag.articleTags ArticleTag[] 관계 존재, Prisma 5 정합 | OK |
| T-RISK-02 | contract SS3 + plan commit 4 등록 순서 | app.ts L28-30: articles -> comments -> tags -> notFoundHandler 순서 정확 | OK |
| T-RISK-03 | beforeEach 4 deleteMany 격리 | tags.integration.test.ts L27-33: articleTag -> comment -> article -> tag 순서 = 기존 패턴 동일 | OK |
| T-RISK-04 | AC-03 순서 무단언 | tags.integration.test.ts L114: `names.sort()` 후 배열 비교 -- 특정 index 순서 단언 없음 | OK |
| T-RISK-05 | 200 + 빈 배열 | tags.integration.test.ts L89-90: `expect(res.status).toBe(200)` + `expect(res.body).toEqual({ tags: [] })` | OK |
| T-RISK-06 | 시크릿 grep | 4 src + 2 test 파일 대상 console.log/process.env/secret 패턴 0건 | OK |
| T-RISK-07 | MVP 수십 태그 가정, take 20 상한 | tag.repo.ts L19 `take: limit` (limit=20) -- 전체 스캔 아닌 상한 적용 | OK |
