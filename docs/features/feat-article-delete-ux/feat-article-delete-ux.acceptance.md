---
doc_type: feature-acceptance
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-03, R-F-07]
  F-ID: [F-07]
  supersedes: null
---

# feat-article-delete-ux — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #15) |

## 1. 인수 기준 (Given/When/Then)

### AC-01 — 삭제 확인 모달 노출 (Functional)
- **Given**: 사용자가 `/article/:id`에서 정상 글을 보고 있다 (articleState=success).
- **When**: "삭제" 버튼을 클릭한다.
- **Then**: ConfirmModal(role="dialog", aria-modal="true")이 노출되며, 메시지는 "이 글을 삭제하시겠습니까? 댓글도 함께 삭제됩니다."이고, "삭제"·"취소" 두 버튼이 표시된다. 확인 버튼이 자동 focus된다.

### AC-02 — 삭제 확정 → 목록 navigate (Functional, 골든패스)
- **Given**: ConfirmModal이 열려 있다.
- **When**: 사용자가 "삭제" 버튼을 클릭(또는 Enter)한다.
- **Then**: `deleteArticle(id)` API 호출 → 성공 → `navigate('/')`로 목록 페이지로 이동한다. 목록에서 해당 글이 더 이상 노출되지 않는다 (cascade 검증).

### AC-03 — 삭제 취소 (Functional)
- **Given**: ConfirmModal이 열려 있다.
- **When**: 사용자가 "취소" 버튼 클릭 또는 Escape 키를 누른다.
- **Then**: 모달이 닫힌다. `deleteArticle`는 호출되지 않는다. 글 본문은 그대로다.

### AC-04 — 삭제 실패 → 모달 유지 + alert (Functional, 회귀 위험 완화)
- **Given**: ConfirmModal이 열려 있고, 네트워크/서버 오류가 발생할 상황이다 (BE 5xx 또는 네트워크 fault).
- **When**: 사용자가 "삭제"를 클릭한다 → `deleteArticle` reject.
- **Then**: 모달은 닫히지 않는다. 모달 내부에 `role="alert"`로 한국어 오류 메시지가 노출된다 (NormalizedError의 user-friendly message). 사용자는 모달 안에서 재시도("삭제" 클릭) 가능하다. 글 본문 데이터는 변경되지 않는다.

### AC-05 — Direct URL 재진입 → NotFound (Functional, cascade 시각 확인)
- **Given**: AC-02로 글 #N이 정상 삭제된 상태.
- **When**: 사용자가 브라우저 주소창에 `/article/N`을 직접 입력하고 진입한다.
- **Then**: 백엔드가 404를 반환 → useArticle의 error.status==404 분기 → `<NotFound />` 컴포넌트가 렌더된다 ("요청하신 경로..." 메시지). URL은 `/article/N` 그대로 유지된다.

### AC-06 — pending 중 더블 클릭 방지 (Functional, race 방지)
- **Given**: 사용자가 ConfirmModal에서 "삭제"를 클릭하여 `deleteArticle` 호출이 진행 중인 상태.
- **When**: 사용자가 다시 "삭제" 또는 "취소"를 클릭하거나 ESC를 누른다.
- **Then**: pending 중 버튼은 disabled + 라벨이 "삭제 중…"으로 변경. ESC도 무시된다. `deleteArticle`는 1회만 호출된다.

## 2. Definition of Done (D-06)

> 본 acceptance가 PR Test Plan 4블록으로 변환되며, AI 게이트(D-06 1단)와 휴먼 게이트(D-06 2단) 모두 사용한다.

- [ ] 단위 테스트 7건 추가 (ConfirmModal 4 + Article 3) — **PR diff에 추가됨**
- [ ] AI 게이트 6축 PASS — Build / Automated tests / Manual / DoD / UI(golden_path_verified + stylesheet) / 3-profile boot
- [ ] PR Test Plan 4블록 본문 작성 (`### Build`, `### Automated tests`, `### Manual verification`, `### DoD coverage`)
- [ ] `Closes #15` 본문 포함
- [ ] Approve ≥ 1 (사람 검수)
- [ ] CI green (status check `pr-body-checkboxes` PASS — Manual + DoD 모든 체크박스 ✅)

## 3. 비기능 인수

- a11y: ConfirmModal은 `role="dialog"` + `aria-modal="true"` + `aria-labelledby` (제목 id 참조) 갖는다. confirm 버튼이 모달 open 시 자동 focus. ESC로 닫힘. alert는 `role="alert"`로 스크린리더 즉시 알림.
- 키보드 only: Tab/Shift+Tab으로 confirm/cancel 버튼 간 순환. 외부 마우스 클릭 차단 없음(backdrop 클릭 무시는 본 PR 비목표).
- 성능: 삭제 API 호출 → navigate 까지 사용자 체감 < 500ms (BE 정상 응답 기준, 로컬 dev).
- 응답성 (반응형): 모바일(<640px) 모달 width=full-width-with-padding, 데스크탑(>=640px) max-w-md center.

## 4. 회귀 인수

- 기존 `Article.tsx` 5상태(idle/loading/success/error/empty/404) 모두 그대로 동작 (deleteHandler 변경이 다른 분기를 건드리지 않음).
- 기존 "수정" 버튼 (#14 PR #42)도 `/editor/:id`로 navigate 정상.
- 기존 CommentList 렌더링 정상 (commentsState 5상태).
- 기존 useArticle/useComments hook AbortController 정상 동작 (unmount cleanup).
- 25개 기존 단위 테스트 모두 PASS 유지 — 본 PR 추가 7건과 합해 32+ PASS.
- typecheck 미회귀 (`pnpm exec tsc --noEmit` PASS).
- build 미회귀 (`pnpm run build` PASS).
