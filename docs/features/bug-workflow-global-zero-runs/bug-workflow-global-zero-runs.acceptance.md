---
doc_type: feature-acceptance
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-OPS-AUTO-LABEL]
  F-ID: []
  supersedes: null
---

# GitHub Actions workflow 전역 0 runs (Issue 51) — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — AC-01/02/03 + DoD 6항 + 회귀 1항 + 비기능 1항 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

> **R-OPS-AUTO-LABEL**: 04-srs §비기능에 정식 등록되지 않은 ad-hoc R-ID. #47에서 schema BLOCK 워크어라운드로 도입. Sprint 5 #52에서 R-OPS-* prefix 정식 등록 예정 — 본 PR에도 동일 ad-hoc R-ID 재사용.

## 1. 인수 기준 (Given/When/Then)

### AC-01: 본 PR push 직후 sync-issue-labels.yml trigger ≥ 1 발생

- **Given** Actions dispatcher가 사용자 P3a 단계 Actions 탭 방문으로 활성화된 상태에서 본 PR (`bug/workflow-global-zero-runs-issue-51`) 코드 변경 0건 + docs 8건 push
- **When** `gh pr create --base main --head <branch>` 실행 후 30초 대기
- **Then** `gh api 'repos/jungsoobin96/board-app/actions/workflows/sync-issue-labels.yml/runs?per_page=1' --jq '.total_count'` 결과 ≥ 1 (PR opened 이벤트)

### AC-02: issue-pr-title-lint.yml trigger ≥ 1 발생 + 본 PR title 정규식 검증 PASS

- **Given** AC-01 PR open 상태
- **When** 30초 대기 후 title-lint workflow run 조회
- **Then** `gh api 'repos/jungsoobin96/board-app/actions/workflows/issue-pr-title-lint.yml/runs?per_page=1' --jq '{total_count, conclusion: .workflow_runs[0].conclusion}'` 결과 `total_count` ≥ 1 + 본 PR run의 `conclusion: success` (title `bug(infra): ...` 정규식 PASS)

### AC-03: PR 머지 직후 sync-issue-labels.yml closed&&merged 이벤트 +1 + 이슈 #51 자동 close + status:* 라벨 일괄 제거

- **Given** AC-01/02 PASS 후 사람이 본 PR 머지 (D-06 2단)
- **When** 머지 후 30초 대기
- **Then** (a) sync-issue-labels.yml total_count ≥ 2 (open + close 합산), (b) `gh issue view 51 --json state` → `"CLOSED"`, (c) `gh issue view 51 --json labels --jq '.labels[].name'` 결과에 `status:in-progress` 또는 `status:in-review` 부재 (자동 제거)

## 2. Definition of Done (D-06)

| # | 항목 | 검증 |
| --- | --- | --- |
| 1 | 8 docs(investigation·contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report) + 2 스크린샷 모두 PR diff에 포함 | `git diff main...HEAD --name-only \| wc -l` ≥ 10 |
| 2 | `validate-doc.sh` 8 docs 모두 OK | Phase P5/P10 명시 |
| 3 | AI 테스트 게이트 6축 모두 PASS (5번째 N/A, 6번째 3 profile smoke OK) | `ai-qa-report.md` §5 |
| 4 | AC-01/02 PR open 직후 자연 검증 PASS (sync runs ≥ 1, lint runs ≥ 1) | `ai-qa-report.md` `## Manual verification` 통합 1줄 |
| 5 | Manual verification + DoD coverage 체크박스 *항상 미체크* (ADR-0046 §2.3 schema BLOCK) | LLM 사전 ✅ 금지 |
| 6 | 사람 Approve + 머지 후 AC-03 회귀 PASS 자연 관찰 | 머지 후 30초 + 본 acceptance §AC-03 검증 |

## 3. 비기능 인수

- **R-OPS-AUTO-LABEL** (운영 자동화 신뢰성): PR open/머지 시 라벨 자동 전이가 사용자/LLM 수동 정리 없이 완료. 본 PR 머지 후 Sprint 5 후속 PR(#52 등)에서 자연 회귀 관찰로 추가 확정.
- Settings 변경 reversibility: 본 PR은 Settings 변경 0건. dispatcher 활성화는 사용자 방문으로 완료된 상태이며 GitHub 측 비활성화 API 미제공 — rollback contract §5에 명시.

## 4. 회귀 인수

- **회귀-01**: Sprint 5 다음 PR (`#52 R-OPS-*` 또는 `#48 TS 정정`) open 시 본 PR과 동일하게 sync-issue-labels.yml + issue-pr-title-lint.yml 모두 trigger ≥ 1. 머지 후 라벨 자동 전이 + close 자연 동작.
  - 검증 시점: 본 PR 머지 후 첫 후속 PR
  - 실패 시: H6 부분 채택 + 추가 가설 진단 신설 follow-up
