---
doc_type: feature-acceptance
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-F-05, R-F-06]
  F-ID: [F-05]
  supersedes: null
---

# feat-comment-create-delete-ui — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #16) |

## 1. 인수 기준 (Given/When/Then)

### AC-01 — CommentForm 렌더 (Functional, 골든패스)
- **Given**: 사용자가 정상 글 상세 페이지(`/article/:id`)에 있다.
- **When**: 페이지 로드 직후.
- **Then**: 댓글 목록 위에 CommentForm이 노출된다 — body textarea + author input + "댓글 작성" 버튼.

### AC-02 — 댓글 작성 성공 → 즉시 추가 (Functional, 골든패스)
- **Given**: CommentForm body·author 모두 입력된 상태.
- **When**: 사용자가 "댓글 작성" 버튼을 클릭한다.
- **Then**: `createComment(articleId, {body, author})` 호출 → 200 응답 → 댓글 영역 상단에 새 댓글이 즉시 추가된다. body 필드는 빈 값으로 reset되고, author는 유지된다.

### AC-03 — 빈 body submit → 인라인 에러 (Functional, R-F-05)
- **Given**: CommentForm body가 빈 값 (공백만 포함 포함).
- **When**: 사용자가 "댓글 작성" 버튼을 클릭한다.
- **Then**: 인라인 에러 "본문은 필수입니다"가 body 아래에 노출. `createComment`는 호출되지 않음. 입력값(author 등)은 보존.

### AC-04 — 작성 실패 → 상단 alert (Functional, 회귀 위험 완화)
- **Given**: CommentForm 정상 입력 + BE 5xx 시뮬레이션.
- **When**: 사용자가 "댓글 작성" 클릭 → `createComment` reject.
- **Then**: 폼 상단에 `role="alert"`로 한국어 메시지 노출. body·author 입력값 보존. 사용자는 재시도 가능.

### AC-05 — 댓글 삭제 모달 노출 (Functional)
- **Given**: 댓글 영역에 댓글이 1건 이상 있다.
- **When**: 사용자가 특정 댓글의 "삭제" 버튼을 클릭한다.
- **Then**: ConfirmModal 노출 (#15 재사용) — 메시지 "이 댓글을 삭제하시겠습니까?" + 취소·삭제 버튼 + confirm 자동 focus.

### AC-06 — 댓글 삭제 확정 → 즉시 제거 (Functional, 골든패스)
- **Given**: AC-05 모달이 열려 있다.
- **When**: 사용자가 모달 "삭제" 클릭.
- **Then**: `deleteComment(articleId, commentId)` 호출 → 204 → 모달 닫힘 + 해당 댓글이 목록에서 즉시 제거됨. 다른 댓글·글 본문은 그대로.

### AC-07 — 글 삭제와 댓글 삭제 모달 독립 (Functional, 회귀 위험 완화)
- **Given**: AC-05 모달이 열려 있다.
- **When**: 사용자가 "취소" 또는 ESC.
- **Then**: 댓글 모달만 닫힘. 글 본문은 그대로, 글 삭제 모달은 열리지 않음. 이후 글 "삭제" 버튼 클릭 시 글 삭제 모달이 정상 노출 (메시지 "이 글을 삭제하시겠습니까? 댓글도 함께 삭제됩니다.").

## 2. Definition of Done (D-06)

- [ ] 단위 테스트 8건 추가 (CommentForm 4 + CommentList 1 + Article 3) — **PR diff에 추가됨**
- [ ] AI 게이트 6축 PASS — Build / Automated / Manual / DoD / UI(golden_path + stylesheet) / 3-profile boot
- [ ] PR Test Plan 4블록 본문 작성
- [ ] `Closes #16` 본문 포함
- [ ] Approve ≥ 1
- [ ] CI green (status check `pr-body-checkboxes` PASS)

## 3. 비기능 인수

- a11y: CommentForm `<label htmlFor>` 연결. submit 결과 `role="alert"`. CommentList 삭제 버튼 `aria-label="댓글 #N 삭제"`. ConfirmModal a11y는 #15 검증.
- 키보드 only: textarea/input Tab 순회 정상. ESC로 모달 닫힘.
- 성능: 댓글 작성 → UI 반영 < 500ms (BE 정상, 로컬 dev).
- 반응형: 모바일 textarea rows=3 + max-width 100%, 데스크탑 textarea rows=4 + max-width 그대로.

## 4. 회귀 인수

- 기존 #15 글 삭제 흐름 (PR #43) 모두 정상 — confirmTargetType='article' 분기로 격리.
- 기존 useComments 5상태 (idle/loading/success/error/empty) 모두 그대로.
- 기존 25개 단위 테스트 + #14 7건 + #15 7건 = 39 + 27 = 66 PASS 유지.
- typecheck/build 미회귀 (pre-existing 3건은 main 동일).
- CommentList 기존 3 cases 모두 통과 (onDelete optional이라 영향 없음).
