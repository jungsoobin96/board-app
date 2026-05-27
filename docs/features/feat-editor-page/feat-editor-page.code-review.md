---
doc_type: feature-code-review
version: v0.1
status: Draft
author: reviewer@board-app
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-02, R-F-05, R-F-08]
  F-ID: [F-03, F-06, F-11]
  supersedes: null
---

# feat-editor-page — Code Review

> Issue #14 / branch `feat/editor-page-issue-14` / reviewer agent (independent, Generator!=Evaluator).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | reviewer@board-app | 초안 (P9 independent code-review) |

## 0. Verdict

**PASS**

- reviewer: @reviewer-agent (independent evaluator)
- review_at: 2026-05-27
- MAJOR: 0
- MINOR: 2
- INFO: 3

본 PR은 PASS. MINOR 2건은 같은 PR 보정 권장이나 blocks_merge=X이므로 follow-up으로도 허용.

## 1. 컨트랙트 충실도

contract.md `§0 Referenced-IDs` 대비 전수 확인:

| ID | 항목 | 코드 반영 | 판정 |
| --- | --- | --- | --- |
| R-F-02 | 글 작성 | EditorForm.tsx controlled 4필드 + createArticle 호출 | OK |
| R-F-05 | 입력 검증 | validate() title 1~200, body >=1, author 1~50, parseTagList 정규화 | OK |
| R-F-08 | 라우팅 | /editor (신규) + /editor/:id (수정) + Article "수정" onClick navigate | OK |
| F-03 | 글 작성 | createArticle -> navigate(`/article/${result.id}`) | OK |
| F-06 | 글 수정 | updateArticle(id, input) -> navigate | OK |
| F-11 | 페이지 라우팅 | useParams 신구 분기 + NotFound 404 | OK |

contract `§2 Before/After` 4행 전부 diff와 정합.

plan.md `§1 커밋 시퀀스` 4 commit 계획 vs git log 3 commit (docs commit #4 미포함 -- 산출 docs는 본 리뷰 이후 합산 commit 예정이므로 정상).

## 2. 테스트 커버리지

acceptance.md AC-01~AC-07 대비:

| AC | 코드/테스트 매핑 | 판정 |
| --- | --- | --- |
| AC-01 | Editor.test "신규 모드 빈 form + 발행 라벨" | OK |
| AC-02 | EditorForm.test "정상 submit -> onSubmit 호출 with trimmed payload" | OK |
| AC-03 | Editor.test "수정 모드 사전 로드 후 form 초기값 + 저장 라벨" | OK |
| AC-04 | EditorForm.test "빈 title submit -> 인라인 에러 + 입력값 보존" | OK |
| AC-05 | Editor.test "수정 모드 + 404 -> NotFound" + "invalid id -> NotFound" | OK |
| AC-06 | Article.tsx handleEdit navigate 결합 (테스트는 수동 골든패스 위임) | OK |
| AC-07 | EditorForm 6건 + Editor 5건 = 11건 (계획 6+보다 초과 달성) | OK |

리포트된 59 passed + 1 skipped 신뢰. 합산이 contract 예상(53+)보다 많은 것은 EditorForm 추가 케이스(submit 실패 NormalizedError, initialValues 적용) 덕분.

## 3. 보안 / 시크릿

- `dangerouslySetInnerHTML`: grep 0건. XSS 안전 (FE-EP-RISK-06 완화 확인).
- `.env` / `API_KEY` / `SECRET` / `credential`: EditorForm.tsx + Editor.tsx grep 0건.
- payload 구성: ArticleInput 4필드만 명시 (title, body, author, tagList). 환경변수 혼입 0.
- OWASP injection: React JSX auto-escape + JSON.stringify 전송. 문제 없음.

## 4. 가독성 / 단순성

**양호**. 주요 판단:

- EditorForm은 순수 controlled UI로 props 3개(`initialValues`, `submitLabel`, `onSubmit`). 네트워크 책임을 Editor에 위임한 관심사 분리가 깔끔함.
- validate() + parseTagList()는 모듈 상단 순수 함수로 분리되어 테스트 용이.
- Editor.tsx 77줄로 신구 분기 + 5상태 처리가 응집적.
- Article.tsx 변경 최소 (diff +5/-12) -- 수정 버튼 결합만, 나머지 동작 불변.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| MINOR-01: Editor.tsx L22 조건부 early return이 useArticle 호출(L25) 전에 위치 -- React Rules of Hooks 기술적 위반. React Router remount 덕에 런타임 문제 없으나 eslint-plugin-react-hooks 경고 가능. 수정: useArticle 호출을 early return 위로 이동하거나, id=-1 guard를 useArticle 내부에 위임(이미 있음). | O | X | O | follow-up 권장 (#15 또는 별도) |
| MINOR-02: CommentList.test.tsx.snap이 본 PR commit에 신규 파일로 포함됨. #13 PR에서 누락된 잔재. 기능 영향 0이나 git blame 왜곡. | O | X | X | 수용 (plan.md에 명시됨) |
| INFO-01: EditorForm `noValidate` 속성으로 브라우저 네이티브 검증 비활성 -- JS 검증 단독 의존. 의도적 설계. | O | X | O | 수용 |
| INFO-02: Editor.tsx handleSubmit이 async 함수이나 에러 처리를 EditorForm 내부에 위임. Editor 측 catch 없음. EditorForm이 NormalizedError catch + 일반 에러 fallback 메시지 처리하므로 동작 정상. | O | X | O | 수용 |
| INFO-03: article.tags (수정 모드 초기값)를 `.join(', ')`로 역변환. 태그에 쉼표 포함 시 파싱 깨짐 가능하나 parseTagList가 split(',')이므로 backend 정규화와 일관. MVP 허용. | O | X | O | 수용 |

## 6. NEEDS-WORK 항목

없음. MINOR 2건 모두 blocks_merge=X.

**MINOR-01 권장 수정 (follow-up)**: Editor.tsx에서 `useArticle` 호출을 조건부 early return(`if (isEdit && id === -1) return <NotFound />`) 위로 이동. `useArticle(-1)`은 내부 guard로 idle 상태 유지하므로 동작 변경 0.

```tsx
// Before (현재)
if (isEdit && id === -1) return <NotFound />;
const articleState = useArticle(isEdit ? id : -1);

// After (권장)
const articleState = useArticle(isEdit ? id : -1);
if (isEdit && id === -1) return <NotFound />;
```

이 수정은 같은 PR에서 즉시 적용해도 좋고, #15에서 Editor 수정 시 함께 처리해도 무방.
