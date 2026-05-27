---
doc_type: feature-brief
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

# feat-comment-create-delete-ui — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #16, feat-comment-create-delete-ui) |

## 1. 한 줄 의도

Article 상세 페이지에 CommentForm + 댓글 단건 삭제 결합 — body·author 입력 → POST → 목록 즉시 추가 + 각 댓글 "삭제" 버튼 → ConfirmModal 확인 → DELETE → 목록 즉시 제거.

## 2. 사용자 가치

- 사용자가 글에 댓글을 즉시 작성·확인할 수 있다 (목록 페이지 새로고침 불필요 — 응답 후 추가 패턴).
- 잘못 작성한 댓글을 모달 확인 1회로 안전하게 삭제할 수 있다 (#15 ConfirmModal 재사용 첫 케이스 — 검증).
- 빈 body 입력 시 즉시 인라인 에러로 알 수 있어 서버 왕복 없이 수정 가능 (R-F-05 정합).

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| CommentForm 컴포넌트 | 부재 | `frontend/src/components/CommentForm.tsx` 신규 (controlled body·author + onSubmit prop + 인라인 검증) |
| CommentList 삭제 버튼 | 없음 | 각 댓글 하단에 "삭제" 버튼 + onDelete prop |
| Article.tsx 댓글 핸들러 | useComments 5상태 분기만 (작성/삭제 핸들러 부재) | createComment + deleteComment 핸들러 + commentsLocal state로 즉시 추가/제거 |
| 갱신 전략 | N/A | **응답 후 추가 패턴** — POST 성공 응답을 받은 후 commentsLocal에 prepend (낙관적 갱신 X — 단순화 + race 회피). 삭제는 DELETE 204 후 filter out |
| 단위 테스트 | CommentList 3건 (#13 PR #41) | + CommentForm RTL 4건 + Article 댓글 흐름 RTL 3건 |

## 4. 모드 자동 감지 결과

**mode=add** (ADR-0032). 신호 분석:
- `type:feature` 라벨 ✓ (add)
- "작성/삭제 UI" — #13에서 댓글 목록 mount된 위에 작성/삭제 *결합*. 기존 useComments hook의 5상태는 그대로 유지하고 추가 동작만 wiring.
- bug / design / modify(기존 동작 변경) 시그널 없음.

→ 부정 시그널 0건 → 자동 add 결정.

## 5. 영향 범위

- **frontend/src/components/CommentForm.tsx** — 신규 컴포넌트 (~80 lines, controlled 2 필드 + 검증 + pending alert)
- **frontend/src/components/CommentList.tsx** — 삭제 버튼 추가 + onDelete prop + Article에서 주입 (~10 lines 추가)
- **frontend/src/pages/Article.tsx** — useComments에서 받은 data를 useState로 local 관리 + handleCreateComment / handleDeleteComment + CommentForm/CommentList wiring + 삭제 모달 재사용 (~50 lines 추가)
- **frontend/tests/unit/components/CommentForm.test.tsx** — 신규 (4 cases)
- **frontend/tests/unit/components/CommentList.test.tsx** — 보강 (삭제 버튼 클릭 onDelete 호출 + 기존 3 cases 회귀)
- **frontend/tests/unit/pages/Article.test.tsx** — 댓글 흐름 3 cases 추가 (기존 3 cases 회귀)
- **docs/features/feat-comment-create-delete-ui/** — 8 산출
- **docs/features/feat-comment-create-delete-ui/screenshots/** — 3장 (comment-form-validation-error, comment-create-success-append, comment-delete-confirm-and-remove)
- **docs/planning/13-test-design/02-catalog.md** — R-F-05·R-F-06 FE 시나리오 보강

영향 외:
- backend createComment/deleteComment endpoint는 #6 PR #34에서 이미 검증.
- 글 자체 삭제(#15)와는 독립 흐름 — 글 삭제 시 cascade로 댓글 함께 사라지는 건 #15에서 처리.
- 권한 체크 없음 (R-F-03 정의 — 누구나 작성·삭제 가능).

## 6. 비목표

- 낙관적 갱신 (optimistic update) — 응답 후 추가만, 실패 시 rollback 복잡도 회피.
- 댓글 수정 — 백로그 (현재 R-/F-ID 매핑 없음).
- 댓글 좋아요 / 대댓글 — scope 외.
- 페이지네이션 / 무한 스크롤 — 댓글 ≤ 20건 가정 (현 시드 기준).
- 권한 / 본인 댓글만 삭제 — R-F-03 정의대로 누구나.
- 글 자체 삭제 모달 컴포넌트 분리 — #15에서 ConfirmModal 신규 도입 완료, 본 PR은 재사용만.

## 7. Open Questions

- 댓글 작성 후 form 필드 reset 여부 (답: body만 reset, author는 유지 — 사용자가 같은 author로 연속 작성하는 경우 일반적).
- author 빈 값 default ("익명") 처리할지 (답: backend가 author 필수라 frontend도 필수 검증, default 없음).
- 삭제 모달 메시지 차별화 (글 vs 댓글) (답: ConfirmModal props로 title/message 주입하므로 호출자에서 "이 댓글을 삭제하시겠습니까?" 메시지 전달, 컴포넌트 변경 X).
