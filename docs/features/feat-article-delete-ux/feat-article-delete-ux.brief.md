---
doc_type: feature-brief
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

# feat-article-delete-ux — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (Sprint 4 #15, feat-article-delete-ux) |

## 1. 한 줄 의도

상세 페이지 "삭제" 버튼에 ConfirmModal + `deleteArticle` API 결합 → 확인 시 글·댓글(cascade) 삭제 후 목록(`/`)으로 navigate.

## 2. 사용자 가치

- 사용자는 자신이 작성한 글을 모달 확인 1회만으로 안전하게 삭제할 수 있다 (오삭제 방지).
- 삭제 후 즉시 목록으로 돌아가 결과를 시각적으로 확인한다.
- 삭제된 글에 직접 URL(`/article/:id`)로 재진입하면 404 → NotFound로 cascade 효과가 명확히 드러난다 (R-F-07 검증 가치).

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| Article.tsx 삭제 핸들러 | mount-only (`handleDelete` 빈 함수, #13 PR) | `setConfirmOpen(true)` → 모달 확인 시 `deleteArticle(id)` → `navigate('/')` |
| ConfirmModal 컴포넌트 | 부재 | `frontend/src/components/ConfirmModal.tsx` 신규 (재사용 가능 — title/message/onConfirm/onCancel props) |
| 삭제 실패 처리 | 없음 | 모달 내부 alert(role="alert") 인라인 노출 + 모달 유지 (재시도 가능) |
| 키보드 a11y | 없음 | Escape 키 → 취소, focus trap (모달 open 시 confirm 버튼 focus) |
| 단위 테스트 | 없음 | ConfirmModal RTL 4건 + Article 삭제 흐름 RTL 3건 |

## 4. 모드 자동 감지 결과

**mode=add** (ADR-0032). 신호 분석:
- `type:feature` 라벨 ✓ (add)
- "삭제" 키워드 — 신규 *결합* (mount-only → 실 동작 wiring)이지 기존 동작 변경 아님. #14(Editor 수정 핸들러 결합)와 동일 패턴이므로 modify 시그널로 해석하지 않음.
- bug / design 시그널 없음.

→ 부정 시그널 0건 → 자동 add 결정 (질문 없이 진행).

## 5. 영향 범위

- **frontend/src/components/ConfirmModal.tsx** — 신규 컴포넌트 (재사용 가능, ~50 lines)
- **frontend/src/pages/Article.tsx** — `handleDelete` 본문 + 모달 상태 (`useState<boolean>`) + 에러 alert 상태 (~30 lines 추가)
- **frontend/tests/unit/components/ConfirmModal.test.tsx** — 신규 (4 cases)
- **frontend/tests/unit/pages/Article.test.tsx** — 신규 또는 기존 보강 (삭제 흐름 3 cases)
- **docs/features/feat-article-delete-ux/** — 8 산출
- **docs/features/feat-article-delete-ux/screenshots/** — 3장 (article-delete-confirm-open, article-delete-success-navigate, article-delete-cascade-404)
- **docs/planning/13-test-design/02-catalog.md** — R-F-03·R-F-07 FE 시나리오 보강

영향 외:
- backend cascade 동작은 #8(test-cascade-integration) 머지로 이미 보장 — 본 PR은 FE 시각 확인만.
- 댓글 작성/삭제 UI는 Sprint 4 #16 별도 PR.
- ErrorBoundary는 Sprint 4 #17 별도 PR.

## 6. 비목표

- 댓글 단건 삭제 UI (#16 scope).
- Toast 시스템 — 본 PR은 inline alert(role="alert")만. 글로벌 toast는 follow-up.
- "복구" 기능 (Soft delete) — backend·schema 변경 없음.
- 권한 체크 — 본 프로젝트는 인증 없는 board-app, 누구나 삭제 가능 (R-F-03 정의).

## 7. Open Questions

- ConfirmModal의 ESC 키 / 외부 클릭 cancel을 본 PR에서 다 구현할지 (a11y 권장이지만 분량 가드 — 답: ESC만 구현, 외부 클릭은 follow-up).
- 삭제 실패 시 모달 자체를 닫을지 유지할지 (답: 유지 + alert 노출로 재시도 가능 — UX 일관성).
