---
doc_type: feature-acceptance
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

# Snapshot 회귀 5종 (Issue 19, scope 축소) — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — AC-01/02/03 + DoD 7항 + 회귀 1항 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: snapshot 5 컴포넌트 도달 (#19 본문 DoD)

- **Given** 본 PR 머지 후
- **When** `ls frontend/tests/unit/components/__snapshots__/*.snap | wc -l`
- **Then** 결과 = **5** (ArticleCard + CommentList + Pagination + TagList + Toast). 측정 방법: ls count.

### AC-02: Toast snapshot 2 sub-snap 신설 (success + error variant)

- **Given** 본 PR 머지 후
- **When** `grep -cE '^exports\[' frontend/tests/unit/components/__snapshots__/Toast.test.tsx.snap`
- **Then** 결과 ≥ **2** (Toast-success + Toast-error). 측정 방법: grep count.

### AC-03: 단위 테스트 86 passed 도달 (토큰 회귀 자연 감지 baseline)

- **Given** Toast.test.tsx 신규 it 5 (snapshot success + error)
- **When** `pnpm --filter @app/frontend run test:unit`
- **Then** **86 passed + 1 skipped** + 첫 실행 시 `Snapshots: 2 written`. 측정 방법: vitest 출력. Tailwind class 변경 시 차후 PR에서 snapshot diff 자연 감지.

## 2. Definition of Done (D-06)

| # | 항목 | 검증 |
| --- | --- | --- |
| 1 | Toast.test.tsx snapshot it +1 (2 sub-snap) | grep test count 5 |
| 2 | `frontend/tests/unit/components/__snapshots__/Toast.test.tsx.snap` 신설 | AC-02 grep |
| 3 | snapshot 컴포넌트 수 5종 도달 | AC-01 ls count |
| 4 | `pnpm --filter @app/frontend run test:unit` 86 passed + 1 skip | AC-03 |
| 5 | AI 게이트 6축 PASS (5번째 ui_changed=false, 6번째 3 profile smoke) | ai-qa-report §2 |
| 6 | Manual verification + DoD coverage 체크박스 *항상 미체크* | ADR-0046 §2.3 |
| 7 | 사람 Approve + 머지 + 자동 close + 라벨 자동 제거 | P14 휴먼 게이트 |

## 3. 비기능 인수

- **R-OPS-AUTO-LABEL**: 본 PR open/머지 시 sync-issue-labels.yml 자동 trigger + 이슈 #19 라벨 자동 전이/제거 자연 회귀
- **R-OPS-SMOKE**: 3 profile smoke PASS (ai-qa-report §7)
- **R-OPS-WORKFLOW**: PR open 시 issue-pr-title-lint.yml conclusion=success (title `test(frontend):` 정규식 정합)

## 4. 회귀 인수

- **회귀-01**: 기존 4 Toast it (success role=alert + error 닫기 onDismiss + auto-dismiss 3000ms + durationMs null) 모두 PASS 유지. 신규 snapshot it가 기존 it에 영향 없음 (cleanup 모듈 수준).
  - 검증 시점: `pnpm test:unit` 출력 — Toast 5/5 모두 PASS
  - 실패 시: snapshot it 격리 또는 cleanup 추가
