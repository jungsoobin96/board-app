---
doc_type: feature-contract
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

# feat-comment-create-delete-ui — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #16) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | docs/planning/04-srs/04-srs.md | R-F-05 (입력 검증 — body 비어있지 않음, author 1~50자), R-F-06 (댓글 API) |
| F-ID (기능) | docs/planning/05-prd/05-prd.md | F-05 (댓글 작성·삭제 UX) |
| 영향 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md | frontend/pages/Article (댓글 핸들러), frontend/components/CommentForm (신규), frontend/components/CommentList (삭제 버튼 추가), frontend/components/ConfirmModal (재사용 — #15 도입) |
| 영향 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md | POST /api/articles/:id/comments (소비측), DELETE /api/articles/:id/comments/:commentId (소비측) — 신규 X |
| 적용 컨벤션 절 | docs/planning/11-coding-conventions/11-coding-conventions.md | §3 명명 (CommentForm/handle* prefix), §4 a11y (form label 연결, alert 패턴) |

## 1. 변경 의도

#13에서 댓글 목록만 mount된 상태(읽기 전용)를 작성·삭제 가능하도록 결합. CommentForm 신설 + CommentList 삭제 버튼 추가 + Article에서 commentsLocal 상태로 즉시 추가/제거(응답 후 갱신). #15 ConfirmModal 재사용으로 일관된 삭제 UX 제공.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `CommentForm.tsx` | 부재 | 신규 controlled (body textarea + author input) + 인라인 검증 (M9 정합 한국어 메시지) + onSubmit prop + pending disabled + NormalizedError alert |
| `CommentList.tsx` Props | `{comments: Comment[]}` only | `{comments: Comment[], onDelete?: (id: number) => void}` (optional → backward 호환) |
| `CommentList.tsx` JSX | 댓글 본문 + 메타만 | + "삭제" 버튼 (onDelete 있을 때만 렌더) |
| `Article.tsx` 댓글 상태 | `commentsState` 직접 사용 (useComments 결과) | `commentsLocal` useState로 local 관리 — useComments success/empty 시 초기화 (useEffect), 작성 성공 시 prepend, 삭제 성공 시 filter out |
| `Article.tsx` 핸들러 | 없음 | `handleCreateComment(input: CommentInput)` + `handleDeleteComment(commentId: number)` (ConfirmModal 흐름) |
| 삭제 모달 | 글 삭제용 1개 | 글 삭제용 1개 + 댓글 삭제용 1개 (state 분리 — `confirmTargetType: 'article' \| 'comment'` + `confirmTargetId`) |
| 단위 테스트 | CommentList 3 (#13) | + CommentForm 4 + CommentList 1 (onDelete 버튼) + Article 댓글 3 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `frontend/src/pages/Article.tsx` | useComments → commentsLocal local state로 mirror + 핸들러 + CommentForm/CommentList wiring | 약 50 lines 추가 |
| `frontend/src/components/CommentList.tsx` | onDelete prop 추가 | optional prop이라 #13 단위 테스트 그대로 통과 (회귀 0) |
| `frontend/src/api/client.ts:103·115` | createComment/deleteComment 소비 | 변경 없음 (Read-only 의존) |
| `frontend/src/components/ConfirmModal.tsx` | #15에서 도입한 컴포넌트 재사용 — props로 title/message만 차별화 | 변경 없음 |
| 기존 CommentList 호출자 (Article만) | onDelete prop 추가 시 동작 변경 | Article에서만 호출, 본 PR이 같이 갱신 |

## 4. Backward Compatibility

- Breaking: **no** — CommentList 새 prop은 optional, 기존 호출자 영향 없음. CommentForm은 신규.
- 마이그레이션 필요: **no** (BE schema·API 변경 없음, 기 도입 endpoint 호출만).
- deprecation: N/A.
- 외부 소비자 영향: 없음 (frontend 내부).

## 5. Rollback 전략

- revert 가능: **yes** — 단일 PR revert로 #13 mount-only 상태로 복원.
- rollback 절차:
  1. `gh pr revert <PR_N>` 또는 GitHub UI Revert 클릭
  2. revert PR을 D-06 정상 플로우로 머지
  3. Article 댓글 영역은 다시 읽기 전용 (작성/삭제 UI 비활성), 데이터 손상 없음
- 데이터 손상 위험: **없음** — POST/DELETE는 backend 책임 (#6 검증), 본 PR은 호출만 wiring. commentsLocal은 mount 시 useComments에서 초기화되므로 inconsistency 없음.

## 6. 비목표

- 낙관적 갱신 (optimistic update) — 응답 후 추가만 (단순화 + race 회피).
- 댓글 수정 UI — 백로그.
- 댓글 페이지네이션 / 무한 스크롤 — 시드 ≤ 20건 가정.
- 권한 / 본인 댓글만 삭제 — R-F-03 누구나.
- 본인 댓글 표시 — author 메타만 노출, 본인 표시 안 함.
- 전역 ConfirmModal Context — #15 비목표 그대로 (사용처 3+ 누적 후 follow-up).
- glob toast — inline alert만.
