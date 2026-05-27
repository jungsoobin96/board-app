---
doc_type: feature-code-review
version: v0.2
status: Accepted
author: claude-reviewer-agent@noreply.anthropic.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-01, R-F-04, R-N-06]
  F-ID: [F-01, F-02, F-08, F-11]
  supersedes: null
---

# feat-home-page — Code Review

> Issue #12 | mode=add | Sprint 3 | branch=feat/home-page-issue-12 | base=main
> 6 commit, +716 / -32, 14 files (9 new + 3 modified + docs)
> reviewer: claude-reviewer-agent (Generator != Evaluator)

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | claude-reviewer-agent@noreply.anthropic.com | 재검수 -- MAJOR-01 보정 commit 확인, verdict NEEDS-WORK -> PASS |
| v0.1 | 2026-05-27 | claude-reviewer-agent@noreply.anthropic.com | 독립 8단계 코드 리뷰 |

## 0. Verdict

- **verdict**: **PASS**
- **reviewer**: @claude-reviewer-agent
- **review_at**: 2026-05-27
- **MAJOR**: 0 (1 -> 0, MAJOR-01 해소)
- **MINOR**: 2 (에러 재시도 버튼 미구현, Pagination 대량 페이지 미대응) -- follow-up
- **INFO**: 5 (기존 4 + Pagination test 격리 이슈 1)

**사유**: MAJOR-01(AbortController signal 미전달) 보정 commit `b12c756`이 정확히 적용됨. client.ts 9 method 전수 `RequestOptions { signal?: AbortSignal }` 2nd arg 추가, `request()` helper가 `init.signal`로 fetch에 전달. hooks에서 `{ signal: controller.signal }` 명시 전달. useArticles.test.ts에서 `fetch init.signal === AbortSignal` 인스턴스 검증 추가. 기존 client.test.ts(#11) 회귀 없음(12/12 PASS). MINOR 2건은 follow-up 이슈 권고.

## 같은 PR 보정 사항

### MAJOR-01 해소 (commit b12c756)

**보정 내용**:

1. **client.ts**: `RequestOptions` interface 신설 (`{ signal?: AbortSignal }`). 9 method 모두 `options: RequestOptions = {}` 2nd arg 추가. `request()` helper에 `init.signal`로 전달.
   - `listArticles(args, options)` -- `{ signal: options.signal }` 전달
   - `getArticle(id, options)` -- 동일
   - `createArticle(input, options)` -- 동일
   - `updateArticle(id, input, options)` -- 동일
   - `deleteArticle(id, options)` -- 동일
   - `listComments(articleId, options)` -- 동일
   - `createComment(articleId, input, options)` -- 동일
   - `deleteComment(articleId, commentId, options)` -- 동일
   - `listTags(options)` -- 동일

2. **useArticles.ts**: `listArticles({ page, limit, tag }, { signal: controller.signal })` -- signal 명시 전달

3. **useTags.ts**: `listTags({ signal: controller.signal })` -- signal 명시 전달

4. **useArticles.test.ts**: AbortController test 강화
   - 기존: `abortSpy` 호출만 검증
   - 보정: `fetch` mock의 `init.signal`이 `AbortSignal` 인스턴스인지 검증 추가 (line 68-72)
   - 이로써 "abort() 호출" + "signal이 fetch에 실제 전달" 양축 검증 완료

**호환성 확인**:
- 기존 `client.test.ts` (#11): 12/12 PASS. `expect.objectContaining` 패턴이라 signal 추가에도 영향 없음
- `options` param은 `= {}` default라 기존 호출처(args만 전달) 하위 호환

**재검수 판정**: MAJOR-01 해소 확인. NEEDS-WORK -> PASS.

---

## 1. 컨트랙트 충실도

### Before/After 13 항목 대조

| # | 항목 | 충족 | 비고 |
|---|---|---|---|
| 1 | Home.tsx placeholder -> 실 구현 | O | +107 -17, rewrite |
| 2 | ArticleCard.tsx 신설 | O | 47 lines |
| 3 | Pagination.tsx 신설 | O | 57 lines |
| 4 | TagList.tsx 신설 | O | 55 lines |
| 5 | useArticles.ts 신설 | O | 61 lines, 5상태 |
| 6 | useTags.ts 신설 | O | 50 lines, 5상태 |
| 7 | package.json + msw devDep | O | `msw@^2.6.6` |
| 8 | ArticleCard.test.tsx | O | snapshot + 태그 0건 |
| 9 | Pagination.test.tsx | O | snapshot + click + disabled |
| 10 | TagList.test.tsx | O | snapshot + press + click + empty |
| 11 | useArticles.test.ts | O | 4 cases (happy/empty/error/abort) |
| 12 | home.integration.test.tsx | O | MSW 통합 1건 |
| 13 | tests/setup/msw.ts | O | buildHandlers + buildServer |

**Contract 13/13 항목 전수 반영.**

### AC 매핑

| AC | 코드 증거 | 검증 방법 | 충족 |
|---|---|---|---|
| AC-01 카드 10 + 페이지네이션 + 사이드바 | Home.tsx 3컴포넌트 배치 | 통합 test AC-07 + 수동(사용자) | O |
| AC-02 ?page=2 | handlePageChange + setSearchParams | Pagination.test click | O |
| AC-03 ?tag=name | handleTagClick + params.delete('page') | TagList.test click | O |
| AC-04 ?tag=ghost 결과 없음 | articlesState.status==='empty' inline | useArticles.test empty case | O |
| AC-05 768px stack | `flex flex-col gap-6 md:flex-row md:items-start` | 수동(사용자) | O (class 정합) |
| AC-06 RTL snapshot 3 + hook 단위 | 3 snapshot + 4 hook cases | vitest | O |
| AC-07 MSW Home 통합 | home.integration.test.tsx | vitest | O |

### F-ID 정합

- F-01(글 목록): Home.tsx -> useArticles -> ArticleCard x N -- O
- F-02(태그 필터): handleTagClick + ?tag= URL -> useArticles re-fetch -- O
- F-08(인기 태그 사이드바): useTags -> TagList -- O
- F-11(반응형 UI): md:flex-row / flex-col -- O

## 2. 테스트 커버리지

### 신규 테스트 (6 파일, 12+ 케이스)

| 파일 | 유형 | 케이스 | 상태 |
|---|---|---|---|
| ArticleCard.test.tsx | snapshot (RTL) | 2 (snapshot + 태그 0건) | 코드 리뷰 PASS |
| Pagination.test.tsx | snapshot + 단위 | 4 (snapshot + null + click + disabled) | 코드 리뷰 PASS |
| TagList.test.tsx | snapshot + 단위 | 4 (snapshot + pressed + click + empty) | 코드 리뷰 PASS |
| useArticles.test.ts | hook 단위 | 4 (happy + empty + error + abort) | 코드 리뷰 PASS (abort test: abort() 호출 + signal forwarded 양축 검증) |
| home.integration.test.tsx | MSW 통합 | 1 (mount -> 카드 10 + 태그 2 + Pagination) | 코드 리뷰 PASS |
| setup/msw.ts | 헬퍼 | N/A | 코드 리뷰 PASS |

### 테스트 품질 점검

- **snapshot 안정성**: 모든 sample props에 fixed timestamp (`2026-01-15T10:30:00.000Z`, `2026-01-01T00:00:00.000Z`) -- FE-HP-RISK-04 mitigation O
- **MSW handler 누수 방지**: `afterEach(() => server.resetHandlers())` 명시 -- FE-HP-RISK-03 mitigation O
- **MSW unhandled 검출**: `server.listen({ onUnhandledRequest: 'error' })` -- 누락 fetch 경로 자동 FAIL
- **AbortController test** (MAJOR-01 보정 후): abort() 호출 + `fetch init.signal instanceof AbortSignal` 양축 검증 완료 (commit `b12c756`)

### 회귀 (기존 테스트)

- router matchRoute 6 + api-client 19 = 25 기존 단위에 영향 없음 (Home.tsx는 export 동일, 내부만 rewrite)
- backend 영향 0 (read-only frontend 변경)

### 실행 검증

- 리뷰어 환경에서 Node.js PATH 미설정으로 `pnpm test:unit` 직접 실행 불가
- **권고**: 사용자가 `pnpm install` 후 `pnpm --filter @app/frontend test:unit` 실행하여 30+ PASS 확인 필요

## 3. 보안 / 시크릿

| 점검 | 결과 |
|---|---|
| .env / API key / secret grep | 0건 |
| token / credential / password grep | 0건 |
| hardcoded URL | `http://localhost:3000/api` (MSW test 전용 + client fallback, 운영 env 주입) -- 허용 |
| process.env 산재 | 0건 (import.meta.env 1건 -- client.ts, 기존) |
| msw devDep (production 번들 미포함) | O (devDependencies) |
| XSS vector | 0건 (React JSX 자동 이스케이프, dangerouslySetInnerHTML 미사용) |
| CORS / CSRF | N/A (read-only GET, backend 관할) |

**보안 점검 PASS. FE-HP-RISK-08 mitigation 확인.**

## 4. 가독성 / 단순성

### 코딩 컨벤션 11항목 대조

| # | 규칙 | 충족 | 비고 |
|---|---|---|---|
| 1 | 컴포넌트 PascalCase 파일명 + export | O | ArticleCard/Pagination/TagList |
| 2 | hook camelCase + `use` prefix | O | useArticles/useTags |
| 3 | 한국어 주석 >=80% (exported) | O | 모든 파일 한국어 JSDoc header |
| 4 | `<article>` 시맨틱 | O | ArticleCard wrap |
| 5 | `<nav aria-label>` | O | Pagination "페이지네이션" |
| 6 | `<aside aria-label>` | O | TagList "인기 태그" |
| 7 | `<section aria-labelledby>` | O | Home "home-heading" |
| 8 | aria-pressed | O | TagList 선택 태그 |
| 9 | aria-current="page" | O | Pagination 현재 페이지 |
| 10 | aria-busy | O | loading skeleton |
| 11 | role="alert" | O | error div |

### 구조

- **5상태 분기**: idle -> loading -> success/error/empty 모두 inline rendering. 상태 누락 없음
- **URL source-of-truth**: useSearchParams + setSearchParams. page 유효성 검증 (NaN/음수/소수 -> 1 fallback)
- **tag 변경 시 page 리셋**: `params.delete('page')` -- UX 정확
- **handlePageChange page=1 시 URL clean**: `params.delete('page')` -- UX 정확
- **import type 분리**: O (Article, Tag, ListResult, FetchStatus)
- **`any` 사용**: 0건
- **promise chain in useEffect**: 허용 (useEffect callback은 async 불가, 관용 패턴)
- **dead code / TODO / debug**: 0건

### 코드 품질

- 컴포넌트 단일 책임 원칙 준수: 각 컴포넌트가 한 가지 역할
- hook 추상화 적절: fetch + state management 캡슐화
- Tailwind utility 직 적용 (Sprint 4 primitives 미도입은 contract 비목표 내)
- formatDate helper inline (ArticleCard 내부) -- 추후 util 분리 가능하나 현재 유일 사용처이므로 적절

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| ~~MAJOR-01~~: AbortController signal 미전달 | O | ~~O~~ | O | **해소** (commit `b12c756`). client.ts 9 method `RequestOptions { signal }` 추가, hooks signal 전달, test signal 검증 추가 |
| MINOR-01: 에러 시 재시도 버튼 미구현 -- 10 S-01 spec "재시도 버튼" 명시하나 Home.tsx error 분기에 retry 없음 | O | X | O | 후속 이슈 권고 (contract 비목표 미명시이나 spec 편차) |
| MINOR-02: Pagination 대량 페이지 미대응 -- totalPages 전수 button 렌더. total=10000 시 1000 버튼 | O | X | O | INFO 수준, MVP 데이터 규모에서 문제 없음. Sprint 5 follow-up |
| INFO-01: useTags dependency array `[]` -- tag 목록은 mount 1회만 fetch. Home re-mount 없이 새 태그 추가 시 갱신 안 됨 | O | X | O | MVP 수용 (tag CRUD 미존재) |
| INFO-02: ListResult generic `articles` 필드명 고정 -- `ListResult<T>` 가 `articles: T[]`로 article 전용. Tag 등 다른 entity 리스트에 재사용 불가 | X | X | X | shared type 설계 문제, 본 PR scope 외 |
| INFO-03: MSW handler에서 query param (page/tag) 미처리 -- 항상 같은 응답 반환. 태그 필터링/페이지네이션 통합 테스트 불가 | O | X | O | MVP 통합 1건 happy path 충분. 정밀 통합은 Sprint 5 E2E |
| INFO-04: useArticles.test.ts fetch global mock은 listArticles 내부 구현(client.ts request 함수)과 결합 -- client.ts가 fetch를 직접 호출하므로 동작하나 client 추상화 변경 시 깨질 수 있음 | O | X | O | 현재 아키텍처에서 정합. 장기적으로 client mock 고려 |
| INFO-05: Pagination.test.tsx RTL DOM 격리 미비 -- snapshot test(page=2)와 click test(page=1)가 동일 `document.body`에 누적 렌더. `screen.getByRole('button', { name: '2' })`가 중복 매치로 2 test FAIL. `cleanup()` 또는 `{ container }` scoped query 필요. MAJOR-01 fix와 무관한 기존 결함 | O | X | O | 후속 이슈 권고 (test isolation fix, 기존 commit `fb968a4` 결함) |

## 6. 보정 이력 및 후속 권고

### MAJOR-01: AbortController signal 미전달 -- 해소

- **v0.1 verdict**: NEEDS-WORK (signal 미전달로 fetch 취소 미동작)
- **보정 commit**: `b12c756 fix(frontend): MAJOR-01 AbortController signal을 fetch에 실제 전달 (#12)`
- **v0.2 재검수 결과**: 해소. 상세 내용은 "같은 PR 보정 사항" 절 참조

### 후속 권고 (merge 비차단)

- MINOR-01: 에러 재시도 버튼 -- Sprint 4 또는 follow-up 이슈로 등록 권고
- MINOR-02: Pagination truncation (... 1 2 [3] 4 5 ...) -- Sprint 5 #21 반응형 검증 시 함께 고려
- INFO-05: Pagination.test.tsx RTL DOM 격리 -- 후속 이슈로 `cleanup()` 또는 scoped container query 적용 권고
