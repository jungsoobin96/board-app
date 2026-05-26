---
doc_type: feature-code-review
version: v0.1
status: Draft
author: claude-reviewer-agent@anthropic.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-05, R-F-06]
  F-ID: [F-05]
  supersedes: null
---

# feat-comments-api — Code Review

> Issue #6 -- mode=add -- P9 산출. Generator(developer)와 독립된 Reviewer agent가 contract/plan/acceptance 대비 코드 정합성 검증. 8단계 점검 + C-RISK 9건 mitigation 확인.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | claude-reviewer-agent@anthropic.com | 초안 (P9 code-review, independent reviewer) |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: claude-reviewer-agent@anthropic.com
- **review_at**: 2026-05-26
- **note**: 11개 점검 항목 모두 충족. MAJOR/MINOR 발견 0건. INFO 2건 (asyncHandler 중복, VAL_BODY_REQUIRED 공유 코드). C-RISK 9건 mitigation 전부 코드에서 실증 확인. P10 ai-qa-report 진입 허가.

## 1. 컨트랙트 충실도

contract Before/After 14개 항목을 코드 대비 1:1 검증. plan 7 Subtask 중 6건 코드 커밋 완료 (7번 docs는 본 Phase에서 자연 흡수).

| # | contract Before/After 항목 | 코드 대조 | 결과 |
|---|---|---|---|
| 1 | `routes/comments.ts` 신설 -- Router({ mergeParams: true }) + 3 method | routes/comments.ts 17줄, mergeParams=true, GET/POST/DELETE 등록 | PASS |
| 2 | `controllers/comments.controller.ts` 신설 -- 3 handler + asyncHandler | comments.controller.ts 37줄, listCommentsCtrl/createCommentCtrl/deleteCommentCtrl | PASS |
| 3 | `services/comment.service.ts` 신설 -- list/create/remove + article 존재 검사 | comment.service.ts 55줄, 3 function + articleRepo.findById 호출 | PASS |
| 4 | `repositories/comment.repo.ts` 신설 -- findManyByArticle/findById/insertComment/deleteComment | comment.repo.ts 44줄, 4 function export | PASS |
| 5 | `validators/comment.validator.ts` 신설 -- body 1자+, author 1~50자, trim | comment.validator.ts 38줄, AUTHOR_MAX=50, trim 적용 | PASS |
| 6 | `app.ts` +1줄 추가 (articles 직후, notFoundHandler 직전) | app.ts line 12 import + line 28 use. 등록 순서: articles(27) > comments(28) > notFoundHandler(31) | PASS |
| 7 | unit/validators/comment.validator.test.ts 6+ 케이스 | 58줄 8 케이스 (계획 초과) | PASS |
| 8 | unit/services/comment.service.test.ts 5+ 케이스 | 128줄 8 케이스 (계획 초과) | PASS |
| 9 | integration/comments.integration.test.ts 7+ 케이스 | 174줄 7 케이스 (AC-01~06 + cascade fan-in) | PASS |
| 10 | typecheck PASS 유지 | Prisma Comment type 사용, import 정합 | PASS (코드 구조 검증) |
| 11 | build PASS 유지 | 신규 import 순환 없음, export 정합 | PASS (코드 구조 검증) |
| 12 | smoke 동일 통과 | 부팅 자산 변경 0, env/migration/lockfile/LOCAL.md 불변 | PASS |
| 13 | 09 API spec 정합 8/9 | GET/POST/DELETE 3 endpoint 신설, 글 5 + 댓글 3 = 8/9 | PASS |
| 14 | 의존성 변경 없음 | package.json 변경 0, supertest는 #4에서 도입 | PASS |

plan 7 commit DAG:

| # | commit 메시지 | 실 커밋 SHA | 상태 |
|---|---|---|---|
| 1 | feat(backend): comment validator + 단위 (#6) | fb1bd50 | DONE |
| 2 | feat(backend): comment repository (#6) | ec7bb36 | DONE |
| 3 | feat(backend): comment service + 단위 (#6) | c21ccb9 | DONE |
| 4 | feat(backend): comments controller + router (#6) | 7e68490 | DONE |
| 5 | feat(backend): comments router 마운트 (#6) | cd8cff2 | DONE |
| 6 | test(backend): comments 통합 7건 + cascade fan-in (#6) | 3ff52e4 | DONE |
| 7 | docs -- 본 review + AI QA 단계에서 흡수 | - | P9/P10 |

## 2. 테스트 커버리지

### 단위 테스트 -- comment.validator (8 cases)

| # | 시나리오 | plan 매핑 | 결과 |
|---|---|---|---|
| 1 | 정상 입력 trim 적용 | plan a/d | PASS |
| 2 | body 빈 문자열 -> VAL_COMMENT_BODY_REQUIRED | plan b | PASS |
| 3 | body 공백만 -> VAL_COMMENT_BODY_REQUIRED | plan c | PASS |
| 4 | author 빈 -> VAL_COMMENT_AUTHOR_REQUIRED | plan e | PASS |
| 5 | author 51자 -> VAL_COMMENT_AUTHOR_TOO_LONG | plan f | PASS |
| 6 | author 50자 (경계값) -> 통과 | plan (추가) | PASS |
| 7 | input null -> VAL_BODY_REQUIRED | plan g | PASS |
| 8 | body 비문자열(숫자) -> 빈 값 처리 | plan (추가) | PASS |

### 단위 테스트 -- comment.service (8 cases, 3 describe)

| # | 시나리오 | plan 매핑 | AC | 결과 |
|---|---|---|---|---|
| 1 | list happy: article 존재 -> comments 반환 | plan a | AC-05 | PASS |
| 2 | list article 미존재 -> NotFoundError | plan b | AC-03a | PASS |
| 3 | create happy: insert -> findById 반환 | plan c | AC-01 | PASS |
| 4 | create article 미존재 -> NotFoundError | plan d | AC-03b | PASS |
| 5 | create insert 직후 findById null -> REPO_INSERT_RACE | (추가) | - | PASS |
| 6 | remove happy: comment 존재 + articleId 일치 | (추가) | AC-02 | PASS |
| 7 | remove comment 미존재 -> NotFoundError | (추가) | - | PASS |
| 8 | remove articleId mismatch -> NotFoundError | plan e | AC-03c | PASS |

### 통합 테스트 -- comments.integration (7 cases)

| # | 시나리오 | AC | 결과 |
|---|---|---|---|
| 1 | GET 200 + comments.length=2, createdAt DESC 정렬 | AC-05 | PASS |
| 2 | GET article 미존재 -> 404 | AC-03a | PASS |
| 3 | POST 201 + 응답 body 5필드 + DB count 검증 | AC-01 | PASS |
| 4 | POST 빈 body -> 400 | AC-04 | PASS |
| 5 | POST article 미존재 -> 404 | AC-03b | PASS |
| 6 | DELETE 204 + DB count=0 | AC-02 | PASS |
| 7 | DELETE articleId mismatch -> 404 + DB 미삭제 | AC-03c | PASS |
| 8 | cascade fan-in: 글 + 댓글 3 -> DELETE article -> 404 + DB 0 | AC-06 | PASS |

Note: 통합 테스트 8번째 케이스는 별도 describe 블록("cascade fan-in 회귀")으로 분리되어 7+1 = 8 case total. plan에서 "7+ 케이스" 명시와 정합.

AC 커버리지: AC-01 PASS, AC-02 PASS, AC-03a PASS, AC-03b PASS, AC-03c PASS, AC-04 PASS, AC-05 PASS, AC-06 PASS -- **6/6 AC 전부 충족**.

## 3. 보안 / 시크릿

| 점검 항목 | 결과 |
|---|---|
| DATABASE_URL 접근 (grep `DATABASE_URL\|process\.env`) | 신규 5파일 모두 0건 |
| console.log 노출 (grep `console\.log`) | 신규 5파일 모두 0건 |
| .env 커밋 | .env* 변경 0 |
| 시크릿 패턴 (*.key, *.pem, credentials.json) | 해당 없음 |
| 입력 검증 (XSS/injection) | validator에서 trim 적용. Prisma parameterized query로 SQL injection 방지 |
| 에러 응답 내 내부 정보 노출 | errorHandler가 message만 출력. stack/env/code는 stderr에만 (기존 #2 패턴 불변) |
| C-RISK-08 mitigation | PASS -- 신규 코드에 process.env 접근 0, logger/response에 DATABASE_URL 미출력 |

보안 위반 0건.

## 4. 가독성 / 단순성

### 긍정 (articles 패턴 답습으로 일관성 우수)

- 4 레이어 분리(router -> controller -> service -> repository)가 articles와 동일 구조. 신규 진입자도 articles 코드를 참고하면 comments 구조 즉시 이해 가능.
- controller thin layer: 검증 + service 호출 + status 매핑만. 비즈니스 로직 0.
- service에서 article 존재 검사를 일관되게 수행 (list/create 모두). remove에서 mismatch 검사 추가.
- validator 코드가 article.validator.ts와 대칭 구조 (asString helper, null check, trim, 길이 검사).
- 테스트 코드가 articles 테스트와 동일 패턴 (vi.mock, beforeEach clearAllMocks, supertest buildApp).

### INFO -- asyncHandler 중복 (MINOR-candidate -> INFO 하향)

`asyncHandler` 함수가 `articles.controller.ts`와 `comments.controller.ts` 양쪽에 동일 구현으로 존재. 공통 유틸로 추출 가능하나:

- articles PR(#4)에서 이미 확립된 패턴
- 본 PR은 articles 답습을 명시한 contract이므로 일관성 유지가 합리적
- 추출은 리팩터링 이슈로 분리 권장 (Sprint 2 후 retro 후보)
- 코드 5줄이라 중복 비용 낮음

판정: **INFO** -- 머지 차단 불필요. 후속 리팩터링 후보로 기록.

### INFO -- VAL_BODY_REQUIRED 공유 코드

`comment.validator.ts` line 20에서 `VAL_BODY_REQUIRED` (= request body null/non-object 검사) 사용. 이는 `article.validator.ts` line 23과 동일한 코드. "요청 본문이 비어 있습니다"는 comment-specific이 아니라 HTTP layer 공통 검증이므로 `VAL_BODY_REQUIRED` 사용이 적절. `VAL_COMMENT_*` PREFIX는 comment 도메인 필드 검증에만 적용 -- 11 section 2 PREFIX 컨벤션 정합.

판정: **INFO** -- 의도적 설계. 변경 불필요.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
|---|---|---|---|---|
| INFO-01: asyncHandler 함수 articles/comments 양 controller에 중복 (5줄, 동일 구현) | False | False | True | 후속 리팩터링 이슈 후보. Sprint 2 retro에서 추출 결정 |
| INFO-02: VAL_BODY_REQUIRED 코드가 article/comment validator 공유 (null-body 공통 검증) | True | False | True | 의도적 설계, 변경 불필요 |

MAJOR 발견: 0건
MINOR 발견: 0건
INFO 발견: 2건

3축 판정 (INFO-01): Q1 in_scope=False (asyncHandler 추출은 본 이슈 범위 외), Q2 blocks_merge=False (5줄 중복은 머지 차단 수준 아님), Q3 same_area=True (comments controller 파일 내). 모든 Q 조건에서 블로커 아님.

3축 판정 (INFO-02): Q1 in_scope=True (comment validator 내), Q2 blocks_merge=False (의도적 설계), Q3 same_area=True. 모든 Q 조건에서 블로커 아님.

## 6. NEEDS-WORK 항목

없음. MAJOR/MINOR 발견 0건.

---

### C-RISK 9건 mitigation 검증 (부록)

| RISK-ID | 제목 | 코드 위치 | 검증 결과 |
|---|---|---|---|
| C-RISK-01 | mergeParams 미설정 | `routes/comments.ts:13` -- `Router({ mergeParams: true })` | PASS -- 명시적 설정 확인 |
| C-RISK-02 | 라우터 등록 순서 오류 | `app.ts:27-28` -- articles(27) > comments(28) > notFoundHandler(31) | PASS -- 올바른 순서 |
| C-RISK-03 | article 존재 검사 누락 | `comment.service.ts:19-21` (list), `33-35` (create) | PASS -- 양 함수 모두 articleRepo.findById 호출 |
| C-RISK-04 | DELETE mismatch 검사 누락 | `comment.service.ts:50-53` -- `comment.articleId !== articleId` | PASS -- mismatch 시 NotFoundError throw |
| C-RISK-05 | findById articleId 누락 | `comment.repo.ts:24-25` -- findUnique select 미명시 = 전 컬럼 반환 | PASS -- Prisma 기본 동작으로 articleId 포함 |
| C-RISK-06 | 에러 메시지 혼선 | service: article 미존재="글을 찾을 수 없습니다", comment 미존재="댓글을 찾을 수 없습니다" | PASS -- 메시지 분리 확인. 통합 테스트에서 정확성 검증 |
| C-RISK-07 | 테스트 격리 실패 | `comments.integration.test.ts:28-34` -- beforeEach 4 deleteMany transaction | PASS -- cascade-friendly 순서 (articleTag > comment > article > tag) |
| C-RISK-08 | 시크릿 노출 | grep 결과: 신규 5파일 모두 DATABASE_URL/process.env/console.log 0건 | PASS |
| C-RISK-09 | smoke 회귀 | app.ts import 정합, 순환 의존 없음, 부팅 자산 변경 0 | PASS (코드 구조 검증) |
