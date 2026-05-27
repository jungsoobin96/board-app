---
doc_type: feature-contract
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

# feat-article-delete-ux — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #15) |

## 0. 참조 정본 ID (Referenced-IDs)

> ADR-0018. 본 contract가 건드리는 게이트 C 정본 명시. 후속 plan이 본 표를 파싱해 selective read.

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | docs/planning/04-srs/04-srs.md | R-F-03 (글 삭제), R-F-07 (cascade — 글 삭제 시 댓글 동반 삭제) |
| F-ID (기능) | docs/planning/05-prd/05-prd.md | F-07 (글 삭제 UX) |
| 영향 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md | frontend/pages/Article (삭제 핸들러), frontend/components/ConfirmModal (신규) |
| 영향 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md | DELETE /api/articles/:id (소비측만, 신규 X) |
| 적용 컨벤션 절 | docs/planning/11-coding-conventions/11-coding-conventions.md | §3 명명 (Confirm* 컴포넌트 prefix), §4 a11y (role="dialog", aria-modal) |

## 1. 변경 의도

#13에서 mount-only로 남긴 Article 페이지 "삭제" 버튼을 실 동작과 결합한다. 사용자는 모달 확인 1회만으로 글을 안전하게 삭제하고, 즉시 목록으로 navigate한다. 삭제된 글의 URL에 직접 재진입 시 NotFound로 cascade 효과를 시각 확인할 수 있다 (#8에서 backend cascade는 이미 검증됨).

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `Article.tsx` handleDelete | 빈 함수 (`// Sprint 4 #15` 주석만) | `setConfirmOpen(true)` 호출 |
| Article.tsx 모달 상태 | 없음 | `useState<boolean>(false)` for `confirmOpen` + `useState<NormalizedError\|null>(null)` for `deleteError` |
| 모달 확정 시 동작 | 없음 | `deleteArticle(id)` → 성공 시 `navigate('/')`, 실패 시 alert |
| `ConfirmModal.tsx` | 부재 | 신규: `{open, title, message, confirmLabel, cancelLabel, isPending, error, onConfirm, onCancel}` props, role="dialog" + aria-modal="true" + ESC 처리 + confirm 버튼 자동 focus |
| 키보드 a11y | 없음 | ESC → onCancel 호출 (pending 중 무시), confirm 버튼 자동 focus, Tab focus trap (간단 구현 — confirm/cancel 두 버튼만 순환) |
| 단위 테스트 | Article.test.tsx 부재 | ConfirmModal.test.tsx (4 cases), Article.test.tsx (3 cases — 삭제 흐름) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `frontend/src/pages/Article.tsx:62-64` | handleDelete 본문 교체 | `setConfirmOpen(true)` |
| `frontend/src/pages/Article.tsx` (JSX) | 삭제 버튼 onClick은 유지, ConfirmModal mount 추가 | `<ConfirmModal open={confirmOpen} ... />` |
| `frontend/src/api/client.ts:90` | `deleteArticle` 소비 | 변경 없음 (Read-only 의존) |
| `frontend/src/components/index` (있는 경우) | export 추가 | 본 프로젝트는 명시적 barrel 부재 — 직접 import 유지 |
| 기존 ConfirmModal 호출자 | 없음 (신규 컴포넌트) | N/A |

## 4. Backward Compatibility

- Breaking: **no** — 삭제 핸들러가 빈 함수에서 동작 함수로 바뀌는 것만 신규 동작 결합이라 호환성 이슈 없음.
- 마이그레이션 필요: **no** (BE schema·API 변경 없음).
- deprecation 일정: N/A.
- 외부 소비자 영향: 없음 (frontend 내부 변경).

## 5. Rollback 전략

- revert 가능: **yes** — 단일 PR이므로 머지 후 revert PR 1개로 충돌 없이 복원.
- rollback 절차:
  1. `gh pr revert <PR_N>` 또는 GitHub UI "Revert" 클릭 → 자동 PR 생성
  2. revert PR을 D-06 정상 플로우로 머지
  3. Article 페이지 삭제 버튼은 다시 mount-only 상태 (사용자 영향: 클릭해도 아무 일 안 일어남 — 데이터 손상 없음)
- 데이터 손상 위험: **없음** — DELETE는 backend 책임이고, 본 PR은 그 호출만 wiring. cascade 정합은 #8 PR #36에서 이미 검증.

## 6. 비목표

- 댓글 단건 삭제 UI (Sprint 4 #16 scope).
- 글로벌 Toast 시스템 — 본 PR은 모달 내부 inline alert만.
- Soft delete / 복구 기능 — schema·API 변경 필요, 별 이슈.
- 모달 외부 클릭(backdrop) cancel — Open Q에서 follow-up으로 결정.
- 권한 체크 — board-app은 인증 없음 (R-F-03 정의).
- 전역 ConfirmModal Provider (Context) — 본 PR은 컴포넌트만, Context 도입은 사용처 3+ 곳 누적 후 follow-up.
