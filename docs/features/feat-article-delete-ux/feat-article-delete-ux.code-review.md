---
doc_type: feature-code-review
version: v0.1 (Draft)
status: Draft
author: reviewer@board-app.dev
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-03, R-F-07]
  F-ID: [F-07]
  supersedes: null
---

# feat-article-delete-ux — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | reviewer | Sprint 4 #15 독립 코드 리뷰 |

## 0. Verdict

- **verdict**: PASS
- **reviewer**: @reviewer (Generator!=Evaluator)
- **review_at**: 2026-05-27
- MAJOR: 0 / MINOR: 2 / INFO: 2
- P10 qa-test --ai 진입: **허가** (MINOR 2건은 같은 PR 보정 권장이나 merge-blocking 아님)

## 1. 컨트랙트 충실도

Contract Before/After 6항 모두 정합 확인:

- handleDelete: 빈 함수(`// Sprint 4 #15`) -> `setConfirmOpen(true)` (Article.tsx:67-70). 정합.
- 모달 상태: `useState` 3개 추가(confirmOpen, deletePending, deleteError). 정합.
- 모달 확정: `deleteArticle(id)` -> 성공 시 `navigate('/')`, 실패 시 모달 내 alert. 정합.
- ConfirmModal.tsx: 신규 123줄, props interface = contract 명세 일치. 정합.
- 키보드 a11y: ESC/Tab/Shift+Tab/auto-focus. 정합.
- 단위 테스트: ConfirmModal 4건 + Article 3건 = 7건. 정합.

Plan 4-commit DAG vs 실제 3 커밋: 4번째(docs-update: 13/02-catalog 보강)는 미수행. Plan에 "커밋 4는 /docs-update Phase 결과로 동일 PR에 추가"로 명시되어 있으므로, P10 이후 최종 커밋으로 추가 예정임을 확인. Contract/Plan 정합에 문제 없음.

비목표 6항(댓글 삭제 UI, Toast, Soft delete, 권한, backdrop click, Context Provider) 모두 코드에 누설 없음. Scope clean.

## 2. 테스트 커버리지

AC -> 테스트 매핑:

| AC | 테스트 | 커버 |
|---|---|---|
| AC-01 모달 노출 | Article.test (e) + ConfirmModal.test (a) | O |
| AC-02 삭제 확정+navigate | Article.test (f) | O |
| AC-03 취소/ESC | ConfirmModal.test (b) | O |
| AC-04 실패 시 모달 유지+alert | Article.test (g) + ConfirmModal.test (d) | O |
| AC-05 direct URL 404 | 단위 테스트 외 (기존 useArticle 404 분기는 #13에서 검증, 본 PR 변경 없음) | N/A (기존) |
| AC-06 pending race 방지 | ConfirmModal.test (c) pending disabled + (b) ESC 무시 | O |

66 PASS / 0 fail / 1 skipped (기존 skip). 기존 59건 회귀 없음.

## 3. 보안 / 시크릿

- .env, API Key, 시크릿 파일 커밋: 없음.
- 코드 내 하드코딩 시크릿: 없음.
- `deleteArticle` 호출 시 인증 토큰: board-app은 인증 없음(R-F-03 정의). 해당 없음.
- XSS: error.message는 NormalizedError 생성자 제어, 사용자 입력 아님. React JSX 자동 이스케이프. 안전.
- 변경된 10개 파일 중 docs 6개 + frontend 코드/테스트 4개 -- 보안 리스크 없음.

## 4. 가독성 / 단순성

- ConfirmModal: controlled 패턴으로 단일 책임 명확. JSDoc 주석 충실. Props interface 명시적. 123줄 적정.
- Article.tsx: 삭제 관련 state 3개 + handler 3개 추가. 함수 본체 내에서 선언 위치 논리적 (hooks -> early returns -> handlers -> JSX). 가독성 양호.
- React Rules of Hooks: useEffect 2개(ConfirmModal L43, L48) 모두 unconditional. Article의 useState 3개(L24-26)도 hook 호출 후 조건 분기(L29+). 위반 없음.
- 메모리 누수: useEffect L48-57의 cleanup `return () => window.removeEventListener('keydown', onKeydown)` -- 동일 함수 참조로 정확히 해제. open=false 시 early return으로 listener 미부착. 누수 없음.
- focus trap: Tab은 cancel->confirm 순환, Shift+Tab은 confirm->cancel 순환 (L62-76). 단, focus가 두 버튼 외부(예: 모달 내 error alert div)에 있으면 trap이 작동하지 않으나, 두 버튼만 interactive이므로 실질 문제 없음.

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
| --- | --- | --- | --- | --- |
| MINOR-1: `aria-labelledby="confirm-modal-title"` 하드코딩 id -- 동일 페이지에 ConfirmModal 2개 mount 시 id 충돌. 현재 호출자 1곳이라 실해 없으나 재사용 컴포넌트 목적상 `useId()` 또는 prop 주입 권장 | O | X | O | follow-up 권장 |
| MINOR-2: ConfirmModal의 `onCancel` prop이 useEffect deps에 포함(L58) -- 호출자가 inline arrow를 넘기면 매 render마다 listener 재등록. 현재 Article은 `handleCancelDelete`를 컴포넌트 본문에 선언하므로 매 render 재생성됨. `useCallback` wrap 또는 ref 패턴 권장 | O | X | O | follow-up 권장 |
| INFO-1: Plan 4번째 커밋(docs-update) 미수행 -- P10 qa-test + docs-update Phase에서 같은 PR에 추가 예정 | O | X | O | P10에서 처리 |
| INFO-2: typecheck/build pre-existing 에러 3건 -- main과 동일, 본 PR 비회귀 확인됨 | X | X | X | 기존 follow-up |

## 6. NEEDS-WORK 항목

해당 없음 -- verdict PASS. MINOR 2건은 같은 PR 내 보정 권장이나 merge-blocking이 아님.

- MINOR-1 수정 방법: `ConfirmModal.tsx` L82, L87의 `"confirm-modal-title"` 하드코딩을 `React.useId()` 기반 동적 id로 교체 (React 18+). 또는 `titleId` prop 추가.
- MINOR-2 수정 방법: `Article.tsx`의 `handleCancelDelete`를 `useCallback`으로 wrap. 또는 ConfirmModal 내부에서 `onCancel`을 ref로 감싸 useEffect deps에서 제외.
