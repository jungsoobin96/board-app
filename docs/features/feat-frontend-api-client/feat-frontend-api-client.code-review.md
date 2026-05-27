---
doc_type: feature-code-review
version: v0.2
status: Accepted
author: claude-reviewer-agent@noreply.anthropic.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-N-02]
  F-ID: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08]
  supersedes: null
---

# feat-frontend-api-client — Code Review

> Issue #11 . mode=add . Sprint 3 . 4 commits, +453/-6, 9 files.
> reviewer: claude-reviewer-agent (Generator != Evaluator 독립 검수)

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | claude-reviewer-agent | 재검수 — MAJOR 2건 보정 확인, verdict PASS |
| v0.1 | 2026-05-27 | claude-reviewer-agent | 초안 — 독립 리뷰 (NEEDS-WORK, MAJOR 2건) |

## 0. Verdict

- **Verdict**: **PASS**
- **Reviewer**: @claude-reviewer-agent
- **Review at**: 2026-05-27 (재검수)
- **MAJOR**: 0건 (2건 보정 완료)
- **MINOR**: 1건 (non-blocking)
- **INFO**: 4건

## 같은 PR 보정 사항

| # | 보정 commit | 내용 | 검증 |
|---|---|---|---|
| MAJOR-CR-01 | `b89c782` | normalize-error.test.ts: `res.clone()` -> `makeRes()` factory 패턴. 각 expect마다 새 Response 생성으로 body consumed 문제 해결 | PASS (7/7) |
| MAJOR-CR-02 | `b89c782` | client.test.ts AC-02: `mockResolvedValueOnce` 1회 -> 2회 체인. 두 `listArticles` 호출 모두 mock 응답 보장 | PASS (12/12) |

보정 후 전체 테스트: **25/25 PASS** (vitest v2.1.9, 3 test files).

## 1. 컨트랙트 충실도

### Before/After 11항목 대비

| # | 항목 | 검증 | 결과 |
|---|---|---|---|
| 1 | `shared/src/index.ts` SCAFFOLD_OK 제거 + 4종 re-export | diff 확인 | PASS |
| 2 | `shared/src/article.ts` 신설 (Article, ArticleInput, ListResult) | 파일 확인 | PASS |
| 3 | `shared/src/comment.ts` 신설 (Comment, CommentInput, CommentListResult) | 파일 확인 | PASS |
| 4 | `shared/src/tag.ts` 신설 (Tag, TagListResult) | 파일 확인 | PASS |
| 5 | `shared/src/api-error.ts` 신설 (NormalizedError class, ApiErrorBody) | 파일 확인 | PASS |
| 6 | `frontend/src/api/client.ts` 신설 (9 method) | 파일 확인, 09 API spec 9/9 URL/method 정합 | PASS |
| 7 | `frontend/src/api/normalizeError.ts` 신설 | 파일 확인 | PASS |
| 8 | `frontend/tests/unit/api/client.test.ts` 신설 | 파일 확인 (12 test, 12 PASS) | PASS |
| 9 | `frontend/tests/unit/api/normalize-error.test.ts` 신설 | 파일 확인 (7 test, 7 PASS) | PASS |
| 10 | 단위 합계 22+ | 25 test, 25 pass / 0 fail | PASS |
| 11 | 의존성 변경 0 | package.json 무변경 | PASS |

### 9 method URL/method 정합 (AC-04)

| method | URL | HTTP | 09 spec 정합 |
|---|---|---|---|
| listArticles | `/articles` + query(page,limit,tag) | GET | PASS |
| getArticle | `/articles/{id}` | GET | PASS |
| createArticle | `/articles` | POST + JSON body | PASS |
| updateArticle | `/articles/{id}` | PUT + JSON body | PASS |
| deleteArticle | `/articles/{id}` | DELETE (204) | PASS |
| listComments | `/articles/{articleId}/comments` | GET | PASS |
| createComment | `/articles/{articleId}/comments` | POST + JSON body | PASS |
| deleteComment | `/articles/{articleId}/comments/{commentId}` | DELETE (204) | PASS |
| listTags | `/tags` | GET | PASS |

### AC 매핑

| AC | 테스트 위치 | 검증 | 결과 |
|---|---|---|---|
| AC-01 | client.test.ts "AC-01" + "AC-01b" | happy path + no-args | PASS |
| AC-02 | client.test.ts "AC-02" | 400 -> NormalizedError | PASS (보정 b89c782) |
| AC-03 | client.test.ts "AC-03" | offline -> NormalizedError(0) | PASS (after shared build) |
| AC-04 | client.test.ts 9 describe blocks | URL/method 정합 | PASS (10 happy tests pass) |
| AC-05 | normalize-error.test.ts 500+HTML | body parse fail fallback | PASS (after shared build) |

## 2. 테스트 커버리지

### 실행 결과 (보정 후)

```
pnpm --filter @app/frontend test:unit

Tests: 25 passed (25)
Test Files: 3 passed (3)
Duration: 5.44s
```

### MAJOR-CR-01: normalize-error.test.ts "400 + {error} body" — RESOLVED (b89c782)

- **파일**: `frontend/tests/unit/api/normalize-error.test.ts`
- **원래 문제**: `normalizeResponse(res)` 호출 시 `res.json()` 소비 후 `res.clone()` 불가
- **보정**: `makeRes()` factory 패턴 적용. 각 expect마다 새 Response 객체 생성
- **검증**: 7/7 PASS

### MAJOR-CR-02: client.test.ts AC-02 — RESOLVED (b89c782)

- **파일**: `frontend/tests/unit/api/client.test.ts`
- **원래 문제**: `mockResolvedValueOnce` 1회 설정으로 `listArticles` 2회 호출 시 2차 호출 undefined
- **보정**: `mockResolvedValueOnce` 체인 2회 설정
- **검증**: 12/12 PASS

### 회귀 (기존 테스트)

- `tests/unit/router.test.ts` (6 tests) — PASS. 기존 baseline 유지.

## 3. 보안 / 시크릿

| 점검 항목 | 결과 |
|---|---|
| `process.env\|JWT\|SECRET\|API_KEY\|password` grep | 0건 |
| 시크릿 파일 (.env, *.key, credentials.json) 커밋 | 0건 |
| VITE_API_URL — client 노출 의도 (base URL only) | PASS |
| NormalizedError에 stack trace 외 정보 노출 | 0 |
| console.log/debug/warn 잔존 | 0건 |
| TODO/FIXME/HACK 잔존 | 0건 |

보안 점검 PASS.

## 4. 가독성 / 단순성

### 구조 평가

- **shared 4 파일 분리** (article/comment/tag/api-error): 도메인별 명확한 분리. 11 coding conventions 정합.
- **NormalizedError class**: Error 상속 + name 설정 + readonly status. instanceof 검사 가능. 적절.
- **normalizeError.ts**: 28줄. 단일 책임 (Response -> throw). FALLBACK/NETWORK 상수 분리. 명확.
- **client.ts**: 93줄. `request<T>` private wrapper + 9 public method. 간결.
- **JSDoc**: 한국어 짧은 헤더. 11 conventions 정합.
- **ESM .js extensions**: shared index.ts에서 `'./article.js'` 등 TypeScript ESM 표준.
- **export style**: interface는 `export type`, class는 `export`. 정확.

### MINOR-CR-01: request() headers 스프레딩 순서

`frontend/src/api/client.ts` line 23-26:

```typescript
res = await fetch(`${BASE_URL}${input}`, {
  headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  ...init,  // init.headers가 있으면 위 merged headers를 덮어씀
});
```

`headers`를 먼저 설정한 뒤 `...init`을 스프레딩하므로, `init`에 `headers`가 있으면 merged headers 전체가 덮어써진다. 현재 9 method 모두 `init.headers`를 전달하지 않으므로 실 영향 0이지만, 향후 확장 시 의도치 않은 header 손실 가능. 순서를 `{ ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } }`로 변경하거나 명시적 분리 권고.

**심각도**: MINOR (현재 동작 무영향, 향후 확장 시 잠재 이슈)

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| MAJOR-CR-01: normalize-error.test.ts Response.clone body consumed (1/7 fail) | O | O | O | RESOLVED (b89c782) |
| MAJOR-CR-02: client.test.ts AC-02 mockResolvedValueOnce 1회 설정 / 2회 호출 (1/12 fail) | O | O | O | RESOLVED (b89c782) |
| MINOR-CR-01: request() headers 스프레딩 순서 — init.headers 덮어쓰기 잠재 위험 | O | X | O | B. Follow-up 후보 (non-blocking) |
| INFO-CR-01: GET 요청에도 content-type: application/json 헤더 전송 (불필요하나 무해) | O | X | O | C. 선택 |
| INFO-CR-02: ListResult generic의 field name `articles` 하드코딩 — ListResult 용도가 Article 전용 | O | X | O | C. 인지 (현재 Comment/Tag는 별도 result type) |
| INFO-CR-03: contract에 `NormalizedError { status, code? }` 명시, 구현에 code 필드 부재 — contract optional이므로 PASS | O | X | X | C. 인지 |
| INFO-CR-04: vite/client types 미참조로 `import.meta.env` tsc 에러 (TS2339) — #10 pre-existing 이슈이나 본 PR client.ts가 최초 사용자 | X | X | X | C. 별도 이슈 권고 (#10 FE 골격 누락) |

## 6. 잔여 사항 (non-blocking)

### 권고 (MINOR, 후속 PR 후보)

1. **MINOR-CR-01** — `frontend/src/api/client.ts` line 23-26: headers 스프레딩 순서 개선. 현재 무영향이지만 확장성 고려. 후속 이슈로 추적 가능.

### 참고 (INFO, 비차단)

2. **INFO-CR-04** — `frontend/src/vite-env.d.ts` 부재 (`/// <reference types="vite/client" />`). 현재 `tsc --noEmit` 및 `tsc -b && vite build` 시 TS2339 발생. 본 PR 범위 외 (#10 pre-existing)이나, 본 PR의 `import.meta.env.VITE_API_URL` 사용이 처음으로 이 에러를 노출시켰으므로 별도 이슈로 추적 권고.
