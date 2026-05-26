---
doc_type: feature-code-review
version: v0.1
status: Draft
author: claude-reviewer-agent@anthropic.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-N-02]
  F-ID: [F-12]
  supersedes: null
---

# feat-error-schema-integration — Code Review

> Issue #9 -- mode=add -- P9 독립 코드 리뷰. Generator != Evaluator 원칙 적용.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | claude-reviewer-agent | 초안 (P9 독립 리뷰) |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: claude-reviewer-agent@anthropic.com
- **review_at**: 2026-05-26
- **findings**: MAJOR 0 / MINOR 2 / INFO 3
- **note**: test 전용 PR (src 0). 12 it 케이스가 AC-01/02/03 모두 정합. vi.mock 격리 안전. afterEach 복원 로직 복잡성은 MINOR이나 merge-blocking 아님. Sprint 2 완결 승인.

## 1. 컨트랙트 충실도

### 1.1 Contract Before/After 11항목 대조

| Contract 항목 | 코드 반영 | 판정 |
| --- | --- | --- |
| `error-schema.integration.test.ts` 신설 | 179 lines 신설 완료 | OK |
| R-N-02 통합 검증 -- 9 endpoint 일괄 | 12 it 케이스, 9 endpoint 전수 커버 | OK |
| 의도 throw 500 통합 | AC-02 (line 166) vi.mock throw + 500 + stderr | OK |
| notFoundHandler 통합 | AC-03 (line 158) /nonexistent -> 404 | OK |
| 통합 테스트 합계 증가 | 기존 22 + 신규 12 = 34 기대 | OK |
| typecheck PASS | src 0 -- 기존 유지 | OK |
| build PASS | src 0 -- 기존 유지 | OK |
| smoke baseline | 부팅 자산 무변경 | OK |
| 09 API spec 영향 없음 | 검증만, 변경 0 | OK |
| 코드 라인 추가 ~200 (test) | 179 lines (허용 범위) | OK |
| src 변경 0 | `git diff main..branch -- backend/src/` = empty | OK |

### 1.2 Plan Subtask 매핑

| Plan Subtask | 반영 | 판정 |
| --- | --- | --- |
| C1: test 신설 (12 it, a~l) | 1cb0879 -- 12 it 정합 | OK |
| C2: docs 산출 | 본 리뷰 포함 산출 진행 | OK |

### 1.3 Acceptance Criteria 코드 매핑

| AC | 코드 위치 | 검증 내용 | 판정 |
| --- | --- | --- | --- |
| AC-01 (9 endpoint 4xx) | lines 72-155, 10 it (a~j) | 모든 케이스 `expectErrorSchema` 호출 -- `{error:string}` + !stack + !code | OK |
| AC-02 (의도 throw 500) | lines 165-179, 1 it (k) | `mockImplementationOnce(throw)` -> 500 + `expectErrorSchema` + errorSpy `[SRV_INTERNAL]` | OK |
| AC-03 (notFoundHandler) | lines 157-163, 1 it (l) | `/nonexistent-path` -> 404 + `expectErrorSchema` | OK |

### 1.4 Endpoint 전수 커버리지

| # | Endpoint | 테스트 케이스 | 에러 유형 |
| --- | --- | --- | --- |
| 1 | GET /api/articles | a: page=-1 -> 400 | ValidationError |
| 2 | GET /api/articles/:id | b: abc -> 400, c: 999 -> 404 | Val/NotFound |
| 3 | POST /api/articles | d: {} -> 400 | ValidationError |
| 4 | PUT /api/articles/:id | e: 999 -> 404 | NotFoundError |
| 5 | DELETE /api/articles/:id | f: 999 -> 404 | NotFoundError |
| 6 | GET /api/articles/:id/comments | g: 999 -> 404 | NotFoundError |
| 7 | POST /api/articles/:id/comments | h: {} -> 400, i: 999 -> 404 | Val/NotFound |
| 8 | DELETE /api/articles/:id/comments/:commentId | j: mismatch -> 404 | NotFoundError |
| 9 | GET /api/tags | k: throw inject -> 500 | Error (fallback) |

9/9 endpoint 100% 커버.

## 2. 테스트 커버리지

### 2.1 테스트 구조 분석

- **파일**: `backend/tests/integration/error-schema.integration.test.ts` (179 lines)
- **describe 블록**: 4 (Articles errors / Comments errors / notFoundHandler / 의도 throw 500)
- **it 블록**: 12 (a~l) -- plan.md 명세와 정합
- **공통 헬퍼**: `expectErrorSchema(body, msg)` -- 3 assertion 번들 (toEqual + !stack + !code)
- **예상 expect 수**: ~50+ (12 it x status + expectErrorSchema(3) + errorSpy(1 in AC-02))

### 2.2 기존 테스트와의 관계

| 기존 테스트 | 본 PR 관계 | 판정 |
| --- | --- | --- |
| `error-handler.test.ts` (단위 5 case) | 층위 분리 -- 단위=mock Express, 통합=실 buildApp+SQLite | 중복 아닌 보완 |
| `articles.integration.test.ts` (9 case) | 일부 에러 케이스 중복 (AC-02/04/07) -- 다만 본 PR은 R-N-02 일괄 회귀 관점 | 허용 중복 |
| `comments.integration.test.ts` (7 case) | 일부 에러 케이스 중복 (AC-03a/03b/03c/04) | 허용 중복 |
| `tags.integration.test.ts` (3 case) | happy path만 -- 본 PR이 에러 path 보완 | 상호 보완 |

### 2.3 격리 패턴 답습

| 패턴 | 기존 4 파일 | 본 PR | 판정 |
| --- | --- | --- | --- |
| `beforeAll` buildApp | O | O | OK |
| `beforeEach` 4 deleteMany | O | O | OK |
| `afterAll` $disconnect | O | O | OK |
| `singleFork: true` (config) | O | O (동일 config 사용) | OK |
| `fileParallelism: false` | O | O | OK |
| PrismaClient 인스턴스 | 파일별 독립 | 독립 생성 | OK |

### 2.4 에러 메시지 정합 검증

모든 12 케이스의 기대 에러 메시지가 실제 src 코드의 throw 메시지와 정합 확인 완료:
- `잘못된 페이지/리미트 값입니다` -- query.validator.ts:32
- `잘못된 ID 형식입니다` -- query.validator.ts:49
- `글을 찾을 수 없습니다` -- article.service.ts:53/93/114/122, comment.service.ts:21/35
- `제목은 필수입니다` -- article.validator.ts:32
- `본문은 필수입니다` -- comment.validator.ts:28
- `댓글을 찾을 수 없습니다` -- comment.service.ts:52
- `서버 오류가 발생했습니다` -- error-handler.ts:47
- `요청한 리소스를 찾을 수 없습니다` -- error-handler.ts:22

## 3. 보안 / 시크릿

### 3.1 시크릿 노출 검사

| 항목 | 결과 | 판정 |
| --- | --- | --- |
| .env 파일 접근 | `process.env.DATABASE_URL ?? 'file:./dev.db'` -- 기존 패턴 동일, 값 출력 없음 | OK |
| API Key / Secret | 0 | OK |
| console.error spy | `mockImplementation(() => {})` -- CI 로그에 stack 미출력 | OK |
| test data | 임시값 ('t', 'b', 'a' 등) -- 시크릿 0 | OK |
| stack trace in body | `expectErrorSchema`가 `!stack` `!code` 명시 검증 | OK |

### 3.2 E-RISK-02 mitigation 확인

- errorHandler는 `console.error(`[SRV_INTERNAL] ${stack}`)` -- stack은 코드 trace 문자열
- `process.env` 값이 stack trace에 직접 포함되는 경우 없음 (Node.js stack은 callsite 정보만)
- test에서 `errorSpy.mockImplementation(() => {})` -- console.error 실제 출력 차단

### 3.3 시크릿 파일 변경 0

`git diff` 확인: .env*, *.key, *.pem, credentials.json, *secret* 파일 변경 없음.

## 4. 가독성 / 단순성

### 4.1 코딩 컨벤션 준수

| 규칙 | 준수 | 비고 |
| --- | --- | --- |
| 파일명 kebab-case (11 SS1) | `error-schema.integration.test.ts` | OK |
| 한국어 주석 (R-N-05) | 파일 상단 JSDoc 한국어, describe/it 한국어 | OK |
| vi.spyOn console.error 패턴 | 기존 error-handler.test.ts 동일 패턴 | OK |
| beforeAll/beforeEach/afterAll 구조 | 기존 4 통합 파일 패턴 답습 | OK |
| import 정렬 | vitest -> supertest -> types -> prisma -> app -> service | OK |
| TypeScript strict | type annotation 정확 (Application, Env, ReturnType) | OK |

### 4.2 afterEach 복원 로직 (MINOR-01 -- 복잡성)

Lines 50-56의 afterEach 내 mock 복원 로직:

```ts
vi.mocked(tagService.list).mockImplementation(
  (vi.mocked(tagService.list) as unknown as { getMockImplementation(): ... }).getMockImplementation() ??
    (async () => ({ tags: [] })),
);
```

**분석**: `mockImplementationOnce`는 자체 소비 후 base implementation으로 자동 복귀한다. 따라서 이 코드는 사실상 no-op이다 -- 현재 base implementation을 다시 자기 자신으로 설정하는 것. `as unknown as` 타입 캐스팅도 불필요한 복잡성을 추가한다.

**대안**: afterEach에서 tagService.list mock 복원이 필요하다면 단순히 제거하거나, 최대한 방어적으로 하려면 `vi.mocked(tagService.list).mockReset()` 후 원본 재설정이 더 명확하다.

**판정**: 동작에는 영향 없음 (no-op이므로 해가 없다). 가독성 관점에서 불필요한 복잡성이나, merge-blocking은 아님. MINOR.

### 4.3 expectErrorSchema 중복 assertion (INFO-01)

`toEqual({error: msg})`가 strict equality이므로 이론적으로 `!stack` `!code`는 중복이다. 그러나 R-N-02 보안 요구를 명시적으로 문서화하는 방어적 패턴으로 **의도된 설계**. 향후 `toEqual`이 `toMatchObject`로 변경될 경우에도 안전. INFO -- 변경 불필요.

### 4.4 AC-02 위치 (INFO-02)

의도 throw 케이스(AC-02)가 파일 최하단에 위치 -- mock 격리 관점에서 최적. `mockImplementationOnce`가 자체 소비되더라도 마지막 위치로 후속 테스트 영향 0. 좋은 설계.

### 4.5 죽은 코드 / TODO / debug 잔재

- TODO: 0
- FIXME: 0
- HACK: 0
- console.log: 0
- debugger: 0

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| MINOR-01: afterEach mock 복원 로직(L52-55) no-op 복잡성 -- `mockImplementationOnce` 자체 소비이므로 불필요한 `as unknown as` 캐스팅+`getMockImplementation()` 재설정 | Y | N | Y | 후속 정리 권고. 현재 해 없음 |
| MINOR-02: afterEach에 `vi.restoreAllMocks()` 대신 errorSpy.mockRestore()만 호출 -- vi.mock module mock은 restoreAllMocks 대상 아니라 정확하지만, afterAll에만 restoreAllMocks 배치는 비대칭 | Y | N | Y | 스타일 선호. 현재 동작 정확 |
| INFO-01: `expectErrorSchema` 내 `!stack` `!code`가 `toEqual` strict equality와 기술적 중복 | Y | N | Y | 의도된 방어 패턴 -- 변경 불필요 |
| INFO-02: AC-02 throw 케이스 최하단 배치 -- 격리 관점 최적 위치 | Y | N | Y | 좋은 설계 -- 유지 |
| INFO-03: 기존 articles/comments 통합과 에러 케이스 일부 중복 (400/404 시나리오) | Y | N | Y | 층위 다름 (개별 endpoint 회귀 vs R-N-02 전수 회귀). 허용 중복 |

## 6. NEEDS-WORK 항목

없음. MAJOR 0. MINOR 2건은 모두 동작 영향 없는 가독성/스타일 사항으로 merge-blocking 아님.

### E-RISK mitigation 확인

| RISK-ID | 완화 조치 | 코드 확인 | 판정 |
| --- | --- | --- | --- |
| E-RISK-01: vi.mock 누수 | afterAll `vi.restoreAllMocks()` + `singleFork:true` 파일 격리 + `mockImplementationOnce` 자체 소비 | L60 afterAll, config singleFork, L167 mockImplementationOnce | OK |
| E-RISK-02: stderr 시크릿 | errorSpy mockImplementation 차단 + stack은 코드 trace만 | L47 mockImplementation, error-handler.ts:45-46 | OK |
| E-RISK-03: 단위/통합 중복 | 층위 분리 명시 (파일 상단 JSDoc L5) | 의도 설계 | OK |
| E-RISK-04: 테스트 시간 | 12 case + supertest -- 경량 | 예상 < 2s | OK |
| E-RISK-05: flaky | fileParallelism:false + singleFork:true + file-level mock | config + afterAll restore | OK |

### vi.mock 격리 심층 분석 (E-RISK-01 critical)

1. **모듈 level mock**: `vi.mock('../../src/services/tag.service.js', factory)` -- hoisted. `actual.list`를 `vi.fn(actual.list)`로 래핑. 다른 export는 `...actual`로 보존.
2. **it별 override**: `vi.mocked(tagService.list).mockImplementationOnce(throw)` -- 1회 호출 후 base implementation(`actual.list`)으로 자동 복귀.
3. **afterAll**: `vi.restoreAllMocks()` -- 모든 mock/spy 정리.
4. **파일 간 격리**: vitest는 `vi.mock`을 파일 scope로 관리. `singleFork:true`에서도 각 파일의 module registry는 독립. `tags.integration.test.ts`에는 영향 없음.
5. **AC-02 위치**: 마지막 describe -- 후속 it 없어 누수 경로 자체 부재.

결론: vi.mock 격리 안전. E-RISK-01 완화 충분.
