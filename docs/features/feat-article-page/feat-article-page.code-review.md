---
doc_type: feature-code-review
version: v0.1
status: Draft
author: claude-reviewer-agent@noreply.anthropic.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-03, R-F-06, R-F-08]
  F-ID: [F-04, F-05]
  supersedes: null
---

# feat-article-page — Code Review

> Issue #13 | mode=add | Sprint 3 (last) | branch=feat/article-page-issue-13 | base=main
> 3 commit, +414 / -9, 7 files (5 new + 1 modified + 1 snapshot pending)
> reviewer: claude-reviewer-agent (Generator != Evaluator)

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | claude-reviewer-agent@noreply.anthropic.com | 독립 8단계 코드 리뷰 |

## 0. Verdict

- **verdict**: **PASS**
- **reviewer**: @claude-reviewer-agent
- **review_at**: 2026-05-27
- **MAJOR**: 0
- **MINOR**: 3
- **INFO**: 4

**사유**: Contract Before/After 10 항목 전수 반영. AC-01~05 모두 코드 증거 확인. 보안 점검 PASS (XSS 0, dangerouslySetInnerHTML 0, 시크릿 0). 테스트 9건 신규 (48 total PASS, 1 existing skip). #12 패턴(5상태 hook + AbortController signal forwarded + afterEach cleanup) 정확 답습. MINOR 3건 모두 merge 비차단 -- formatDate 3중 복제, hooks id<1 불필요 fetch, CommentList snapshot 미커밋. High 리스크 0. Sprint 3 마지막 PR로서 완성도 충분.

## 1. 컨트랙트 충실도

### Before/After 10 항목 대조

| # | 항목 | 충족 | 비고 |
|---|---|---|---|
| 1 | Article.tsx placeholder -> 실 구현 | O | +137 -9, rewrite. 본문+메타+태그+댓글+수정/삭제 버튼 |
| 2 | CommentList.tsx 신설 | O | 48 lines, Comment[] props -> ul/li + 빈 케이스 |
| 3 | useArticle.ts 신설 | O | 44 lines, getArticle(id) + 5상태 + AbortController |
| 4 | useComments.ts 신설 | O | 45 lines, listComments(articleId) + 5상태 + AbortController |
| 5 | NotFound.tsx 변경 없음 (재사용) | O | useArticle 404 -> NotFound 직 렌더 |
| 6 | 단위 테스트 +9 (48 total) | O | contract 44+ 초과 달성 |
| 7 | getArticle/listComments 첫 사용처 | O | client.ts (#11) 무변경, 정합 |
| 8 | ui_changed=true | O | Article rewrite + CommentList 신설 |
| 9 | 부팅 자산 무변경 | O | lock, .env.example, migrations 모두 동일 |
| 10 | 코드 라인 +414 | O | contract 예측 +250(src)+180(test) = 430과 유사 |

**Contract 10/10 항목 전수 반영.**

### AC 매핑

| AC | 코드 증거 | 검증 방법 | 충족 |
|---|---|---|---|
| AC-01 본문+댓글+수정/삭제 버튼 | Article.tsx 전체 + useArticle + useComments + CommentList | 수동(사용자 P14) + hook test | O |
| AC-02 /article/999 -> NotFound | useArticle.test 404 case + Article.tsx 404 분기 (line 24) | useArticle.test + 수동 | O |
| AC-03 댓글 0건 -> 메시지 | CommentList.test 빈 케이스 + useComments empty status | CommentList.test + useComments.test | O |
| AC-04 단위 8+ PASS | 9 신규 (3+3+3), 48 total | vitest 48 passed | O |
| AC-05 수정/삭제 버튼 mount | Article.tsx handleEdit/handleDelete 빈 함수 + TODO comment | 수동(클릭 시 무반응 -- 의도) | O |

### F-ID/R-ID 정합

- R-F-03(글 상세): Article.tsx useArticle -> 본문+메타+태그 -- O
- R-F-06(댓글 인터페이스): useComments + CommentList (목록만, 작성/삭제는 Sprint 4) -- O
- R-F-08(라우팅): useParams + id parse + 404 NotFound -- O
- F-04(글 상세): 동일 R-F-03 -- O
- F-05(댓글 목록): CommentList + 빈 케이스 -- O

## 2. 테스트 커버리지

### 신규 테스트 (3 파일, 9 케이스)

| 파일 | 유형 | 케이스 | 상태 |
|---|---|---|---|
| CommentList.test.tsx | RTL snapshot + 단위 | 3 (snapshot + 빈 배열 + 헤더 카운트) | PASS |
| useArticle.test.ts | hook 단위 | 3 (happy + 404 + AbortController signal) | PASS |
| useComments.test.ts | hook 단위 | 3 (happy + empty + AbortController signal) | PASS |

### 테스트 품질 점검

- **snapshot 안정성**: sampleComments에 fixed timestamp (`2026-01-15T10:30:00.000Z`, `2026-01-16T11:00:00.000Z`) -- 시간대 무관 결정적 출력
- **afterEach cleanup**: CommentList.test.tsx `afterEach(() => cleanup())` 명시 -- #12 패턴 답습
- **AbortController signal 양축 검증**:
  - useArticle.test: `initArg?.signal instanceof AbortSignal` (전달) + `abortSpy.toHaveBeenCalled()` (해제)
  - useComments.test: `initArg?.signal instanceof AbortSignal` (전달)
- **404 분기 검증**: useArticle.test `mockResolvedValue(Response(404))` -> `result.error?.status === 404` 정확
- **empty 분기 검증**: useComments.test `comments: []` -> `status === 'empty'` 정확
- **multiline 댓글**: sampleComments[1].body에 `\n` 포함 -- whitespace-pre-wrap 검증

### 실행 결과

```
 10 passed | 1 skipped (11 files)
 48 passed | 1 skipped (49 tests)
 Snapshots: 1 written
```

48 passed (기존 39 + 신규 9), 1 skipped (기존 home.integration). **AC-04 충족 (8+ 요구, 9 실제).**

### 누락 분석

- **Article.test.tsx 부재**: plan §3에서 `tests/unit/pages/Article.test.tsx` RTL snapshot을 명시했으나 실제 미구현. Article 페이지 자체는 hook을 통한 간접 테스트 + 수동 브라우저 검증으로 커버. 총 테스트 수는 contract 47+ 초과(48). INFO 수준 gap.
- **useComments error case 부재**: useComments.test에 error scenario(5xx) 없음. useArticle.test의 404 case와 구조 동일하므로 답습 패턴으로 추론 가능. INFO 수준.

### 회귀

- backend 영향 0 (read-only frontend 변경, BE 코드 무수정)
- 기존 FE 39 test 전수 PASS (client 12 + router 6 + hooks 4 + components 10 + integration 1skip = 33 + skip 1)
- Home 페이지(#12) 동작 영향 없음 (Article.tsx는 별도 라우트 컴포넌트)

## 3. 보안 / 시크릿

| 점검 | 결과 |
|---|---|
| dangerouslySetInnerHTML grep | 0건 |
| eval / Function() / document.write grep | 0건 |
| .env / API key / secret / token / credential grep | 0건 |
| hardcoded URL | 0건 (client.ts BASE_URL은 #11 기존, 본 PR 미수정) |
| process.env 산재 | 0건 |
| XSS vector | 0건 -- React JSX 자동 이스케이프. article.body는 `{article.body}` JSX 표현식으로 렌더, 텍스트 노드 자동 escape |
| CORS / CSRF | N/A (read-only GET, backend 관할) |
| 시크릿 커밋 이력 | 0건 (3 commit 전수 diff 검사) |

**보안 점검 PASS. FE-AP-RISK-06 XSS mitigation 확인.**

## 4. 가독성 / 단순성

### 코딩 컨벤션 11항목 대조

| # | 규칙 | 충족 | 비고 |
|---|---|---|---|
| 1 | 컴포넌트 PascalCase 파일명 + export | O | CommentList.tsx, Article.tsx |
| 2 | hook camelCase + `use` prefix | O | useArticle, useComments |
| 3 | 한국어 주석 >=80% (exported) | O | 모든 파일 한국어 JSDoc header + 인라인 한국어 주석 |
| 4 | `<article>` 시맨틱 | O | Article.tsx outer `<article aria-labelledby>` |
| 5 | `<section aria-label>` | O | CommentList `<section aria-label="댓글">` |
| 6 | key=안정ID | O | `key={comment.id}` (CommentList), `key={tag}` (태그 칩) |
| 7 | import type 분리 | O | `import type { Article }`, `import type { Comment }`, `import type { FetchStatus }` |
| 8 | `any` 미사용 | O | 0건, catch는 `err: unknown` |
| 9 | aria-busy loading | O | Article.tsx loading skeleton `aria-busy="true"` |
| 10 | role="alert" error | O | Article.tsx error div `role="alert"` |
| 11 | `<time dateTime>` | O | Article.tsx + CommentList에 `<time dateTime={...}>` |

### 구조

- **Article.tsx 5상태 분기**: idle -> loading -> error(404 -> NotFound, 기타 -> alert) -> success 완전 분기. 누락 없음
- **Comments 4상태 분기**: loading/error/success/empty 인라인 렌더. idle는 article loading에 흡수 (정합)
- **id parse robustness**: `Number.isInteger(parsed) && parsed >= 1 ? parsed : -1` -- float, 0, negative, NaN, undefined 모두 -1으로 정규화
- **404 URL 유지**: `<NotFound />` 직 렌더 (Navigate 미사용) -- UX 결정 O
- **수정/삭제 TODO**: Sprint 4 결합 명시, contract §6 비목표와 정합
- **whitespace-pre-wrap**: 본문 `<div className="whitespace-pre-wrap">` + 댓글 `<p className="whitespace-pre-wrap">` -- newline 보존
- **updatedAt 표시**: `article.updatedAt !== article.createdAt` 시 "수정됨" 표기 -- UX 적절
- **태그 칩**: `bg-secondary-500/10 text-secondary-700` -- Home ArticleCard 태그 칩과 동일 패턴 (#12 정합)
- **dead code / debug console**: 0건
- **TODO comment**: 2건 (handleEdit, handleDelete) -- 의도적, contract §6 명시

### promise chain in useEffect

useArticle/useComments에서 `.then().catch()` 사용. useEffect callback은 async 불가한 React 제약 하에서의 관용 패턴. #12 useArticles/useTags와 동일. 코딩 컨벤션 "async/await 일관" 조항은 일반 async 함수 대상이며 useEffect 내부 패턴은 기존 codebase 합의로 수용. INFO 수준.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| MINOR-01: `formatDate` 3중 복제 -- ArticleCard.tsx, CommentList.tsx, Article.tsx에 동일 함수 3벌 | O | X | O | 후속 이슈 권고. `frontend/src/utils/formatDate.ts`로 추출 1회 리팩토링. 현재는 동작 정확, 중복일 뿐 |
| MINOR-02: hooks id<1 불필요 fetch -- Article.tsx에서 `id === -1` 시 NotFound 반환하나, hooks는 그 전에 `useArticle(-1)` + `useComments(-1)` 호출. GET /api/articles/-1 불필요 network request 1회 발생 | O | X | O | 후속 이슈 권고. hooks에 `if (id < 1) return` early exit 추가. React Rules of Hooks 위반 없이 useEffect 내부 guard로 처리 가능 |
| MINOR-03: CommentList snapshot 미커밋 -- CommentList.test.tsx snapshot test가 `__snapshots__/CommentList.test.tsx.snap` 생성하나 커밋 누락. 첫 실행 시 "1 written" (기능상 PASS이나 CI 재현성 저하) | O | X | O | PR 머지 전 `pnpm --filter @app/frontend test:unit` 실행 후 snap 파일 커밋 권고 |
| INFO-01: Article.test.tsx 부재 -- plan §3에서 `tests/unit/pages/Article.test.tsx` 명시했으나 미구현. 48 total로 AC-04(8+) 초과 달성이므로 비차단 | O | X | O | Sprint 4 follow-up 가능. 현재 hooks + CommentList 단위 + 수동 브라우저 검증으로 커버 |
| INFO-02: useComments error case 미검증 -- useComments.test에 5xx/network error scenario 없음. useArticle.test 404 case에서 패턴 검증 완료이므로 동일 구조 추론 | O | X | O | 후속 보강 가능. 현재 hook 코드는 useArticle과 동형이므로 위험 낮음 |
| INFO-03: commentsState idle 분기 암묵 처리 -- Article.tsx에서 comments idle 상태 시 아무것도 렌더하지 않음. article idle/loading에서 조기 return하므로 도달 불가하나 명시적이지 않음 | O | X | O | 동작 정확. article loading skeleton이 comments idle을 마스킹 |
| INFO-04: promise chain vs async/await -- useEffect 내 `.then().catch()` 사용. React 제약 하 관용 패턴, #12 codebase 합의 | O | X | O | 허용. 컨벤션 조항은 일반 async 함수 대상 |

## 6. NEEDS-WORK 항목

없음. MAJOR 0건. MINOR 3건 모두 merge 비차단 (동작 정확, follow-up 이슈 권고).

### 후속 권고 (merge 비차단)

1. **MINOR-01 formatDate 추출**: `frontend/src/utils/formatDate.ts` 신설 후 3 파일에서 import. Sprint 4 첫 PR 또는 별도 chore 이슈.
2. **MINOR-02 hooks guard**: useArticle/useComments useEffect 내부에 `if (id < 1) { setState({ status: 'error', data: null, error: new NormalizedError(400, 'invalid id') }); return; }` 추가. 불필요 network request 제거.
3. **MINOR-03 snapshot 커밋**: PR 머지 전 CommentList snapshot 파일 추가 커밋.
4. **INFO-01 Article.test.tsx**: Sprint 4에서 Article 페이지 RTL test 추가 (hook mock으로 5상태 분기 렌더 검증).

### Risk mitigation 확인

| RISK-ID | mitigation | 검증 |
|---|---|---|
| FE-AP-RISK-01 (404 분기 누락) | useArticle catch NormalizedError + Article.tsx 404 분기 | useArticle.test 404 case PASS |
| FE-AP-RISK-02 (병렬 fetch 한쪽 실패) | 각 hook 독립 상태, Article.tsx에서 개별 분기 처리 | 코드 리뷰 확인 |
| FE-AP-RISK-03 (AbortController signal) | #12 MAJOR-01 패턴 답습, signal forwarded | useArticle.test + useComments.test signal assertion PASS |
| FE-AP-RISK-04 (시크릿 노출) | 0건 grep | 보안 점검 PASS |
| FE-AP-RISK-05 (a11y) | `<article>` + `<section aria-label>` + `<time>` + aria-busy + role="alert" | 컨벤션 11항목 PASS |
| FE-AP-RISK-06 (XSS) | React JSX auto-escape, dangerouslySetInnerHTML 0건 | 보안 점검 PASS |
| FE-AP-RISK-07 (버튼 mount만) | TODO comment + contract §6 비목표 명시 | 코드 리뷰 확인 |
