---
doc_type: feature-brief
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-N-06]
  F-ID: [F-11]
  supersedes: null
---

# Snapshot 회귀 5종 (Issue 19, scope 축소) — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — Toast snapshot +1 it (기존 4 + 신규 1 = 5종). viewport는 #21 이관 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 한 줄 의도

5 컴포넌트 snapshot 회귀 보호 완결 — Toast.test.tsx에 snapshot 1 it 추가하여 기존 4종(ArticleCard/CommentList/Pagination/TagList) + 신규 1종(Toast)로 5종 충족. 토큰 변경 시 snapshot diff로 자연 감지.

## 2. 사용자 가치

- 디자인 토큰(`bg-secondary-500`, `text-neutral-0` 등 Tailwind class) 변경 시 vitest snapshot diff로 자동 감지 — 의도하지 않은 시각 변동 회귀 보호
- Toast는 #17 PR #45에서 도입된 신규 컴포넌트로 snapshot 부재 → 본 PR로 회귀 보호 확보
- 5종 도달로 #19 이슈 본문 "snapshot 5 컴포넌트" DoD 충족
- viewport 4종 × 5 페이지 E2E는 Playwright 도입과 묶어 #21로 이관 — 단일 PR 규모 적정화

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| Snapshot 컴포넌트 수 | 4종 (ArticleCard/CommentList/Pagination/TagList) | **5종** (+Toast) |
| Toast 단위 it | 4 (success/error/auto-dismiss/durationMs null) | 5 (+snapshot success+error 2 sub-snap) |
| 단위 카운트 | 85 passed + 1 skipped (Sprint 5 #18 후) | **86 passed + 1 skipped** (+1 신규 it) |
| Toast snapshot 파일 | 부재 | `Toast.test.tsx.snap` 신설 (Toast-success + Toast-error 2 sub-snap) |
| viewport 4종 × 5 페이지 E2E | 없음 | 본 PR scope 외 — **#21 이관** (Playwright 도입과 묶음) |
| 토큰 회귀 감지 | 부분 (4 컴포넌트만) | **전 5 컴포넌트** (Tailwind class 변경 시 diff) |

## 4. 모드 자동 감지 결과

- 부정 시그널: type:bug=No / UI키워드=No / modify="회귀"는 modify 시그널 약함 / type:test 라벨=Yes
- 충돌 0건 → ADR-0032 규칙 4 기본값 add 자동 결정 (type:test는 add 분류)
- **결정: mode=add** (snapshot 1 it 신규 추가)
- Mode Decision Trace: type:test 라벨 + "snapshot 5종 추가" → 부정 시그널 0건 → mode=add 무질문 진행

## 5. 영향 범위

- `frontend/tests/unit/components/Toast.test.tsx` (snapshot it +1, 2 sub-snap)
- `frontend/tests/unit/components/__snapshots__/Toast.test.tsx.snap` (신설)
- `frontend/src/components/Toast.tsx` (변경 없음)
- `docs/features/feat-snapshot-regression/*.md` (8건 신설)
- 13/02-catalog F-11 §1 단위 — 기존 fan-in 그대로 유지 (snapshot 추가는 기존 시나리오 회귀 보호 강화, 별도 row 추가 불필요)

## 6. 비목표

- viewport 4종 × 5 페이지 Playwright E2E — **#21로 이관**
- gstack /qa 수동 viewport 검증 — #21에서 통합
- Playwright 설치 + setup-playwright.sh — #21
- snapshot 5종 외 추가 컴포넌트 (ConfirmModal/EditorForm/CommentForm/NotFound/ErrorBoundary) — 본 PR scope 한정 (Toast 1건만으로 5종 도달)
- 디자인 토큰 변경 자체 — 별 PR (ADR-0038 §10 LLD)

## 7. Open Questions

(없음 — Toast snapshot 1 it 추가 단순 작업)
