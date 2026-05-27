---
doc_type: feature-contract
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

# Snapshot 회귀 5종 (Issue 19, scope 축소) — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — Toast snapshot it +1 (sub-snap 2건), 단위 86 passed, viewport는 #21 이관 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | 04-srs | R-N-06 (반응형 레이아웃 — snapshot 회귀 보호로 토큰/시각 회귀 감지) |
| F-ID (기능) | 05-prd | F-11 (반응형 UI — snapshot 회귀로 발현 보호) |
| 영향 모듈 | 08-lld-module-spec | frontend/components/Toast (read-only 참조), frontend/tests/unit/components |
| 영향 엔드포인트 | 09-lld-api-spec | (none — frontend 단위 테스트) |
| 적용 컨벤션 절 | 11-coding-conventions | (none — 기존 vitest snapshot 패턴 답습) |

## 1. 변경 의도

`#19` 이슈 본문 "snapshot 5 컴포넌트" DoD 충족을 위해 Toast.test.tsx에 snapshot 1 it 추가. 기존 4종(ArticleCard/CommentList/Pagination/TagList) + 신규 1종(Toast)로 5종 도달. viewport 4종 × 5 페이지 Playwright E2E는 사용자 결정으로 #21(E2E 골든 패스 + Playwright 도입)로 이관 — 단일 PR 규모 적정화.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| Snapshot 컴포넌트 수 | 4종 | **5종** (+Toast) |
| Toast.test.tsx it 개수 | 4 (success/error/auto-dismiss/durationMs null) | 5 (+snapshot success+error) |
| Toast snapshot 파일 | 부재 | `Toast.test.tsx.snap` 신설 (2 sub-snap: Toast-success + Toast-error) |
| 단위 카운트 (frontend) | 85 passed + 1 skip | **86 passed + 1 skip** |
| 토큰 회귀 감지 컴포넌트 | 4 (ArticleCard/CommentList/Pagination/TagList) | **5** (+ Toast — bg-secondary-500/bg-danger-500 회귀 보호) |
| viewport 4×5 페이지 E2E | 없음 | **#21 이관** (Playwright 도입과 묶음) |
| `gstack /qa` 수동 viewport | DoD 명시 | **#21 이관** |
| Estimated Effort | 1d (이슈 본문) | **0.5d** (scope 축소) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `frontend/tests/unit/components/Toast.test.tsx` | snapshot it +1 (line 60~73, 2 sub-snap) | 본 PR diff |
| `frontend/tests/unit/components/__snapshots__/Toast.test.tsx.snap` | 신설 (vitest 자동 생성) | 본 PR diff |
| `frontend/src/components/Toast.tsx` | 변경 없음 | 영향 없음 |
| `docs/planning/13-test-design/02-catalog.md` §1 단위 F-11·R-N-06 | 기존 fan-in 그대로 (snapshot은 시각 회귀 보호 강화, 별도 row 추가 불필요) | 영향 없음 |
| `docs/features/feat-snapshot-regression/*.md` | 신설 8건 (brief·contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report — investigation은 mode=add N/A) | 본 PR diff |
| **#21 이관 항목** | viewport 4종 × 5 페이지 Playwright + gstack /qa 수동 + setup-playwright.sh | 본 PR scope 밖 — 비목표 §6 |

## 4. Backward Compatibility

- Breaking: **no** — 신규 it 추가만, 기존 4 it 무변경, Toast.tsx 무변경, snapshot 신설(기존 파일과 충돌 없음)
- 마이그레이션 필요: **no**
- 사용자 노출: 없음 (테스트 코드)
- 영향 사용자: 개발자만

## 5. Rollback 전략

- revert 가능: **yes** — `git revert <merge-sha>`로 it 1건 + snapshot 파일 + 8 feature docs 일괄 제거
- rollback 절차 (1단계): `git revert <PR-#-merge-sha>` → snapshot 회귀 4종 그대로 복귀
- 데이터 손상 위험: **없음** — 테스트 코드 + 자동 생성 snapshot 파일

## 6. 비목표

- viewport 4종 × 5 페이지 Playwright E2E — **#21 이관 결정** (사용자 선택 (C))
- gstack /qa 수동 viewport 검증 — #21에서 통합
- Playwright 설치 + `scripts/setup-playwright.sh` 활용 — #21
- snapshot 5종 외 추가 컴포넌트 (ConfirmModal/EditorForm/CommentForm/NotFound/ErrorBoundary) — Toast 1건만으로 5종 도달
- 토큰 정의 자체 변경 — 별 PR (ADR-0038 §10 LLD)
- snapshot diff CI gate — Sprint 6+ CI smoke job (Sprint 1 follow-up i) 후보
