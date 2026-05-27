---
doc_type: feature-acceptance
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-OPS-AUTO-LABEL, R-OPS-SMOKE, R-OPS-WORKFLOW, R-OPS-DOCS-SYNC]
  F-ID: []
  supersedes: null
---

# R-OPS R-ID taxonomy (Issue 52) — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — AC-01/02/03/04 + DoD 11항 + 회귀 1항 + 비기능 4항 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: 04-srs §3에 R-OPS-* 4건 정식 등록

- **Given** 04-srs.md 본 PR 머지 후
- **When** `grep -cE '^### R-OPS-' docs/planning/04-srs/04-srs.md`
- **Then** 결과 = **4** (R-OPS-AUTO-LABEL/SMOKE/WORKFLOW/DOCS-SYNC). 측정 방법: grep count.

### AC-02: 13/02-catalog §2 통합에 R-OPS-* fan-in

- **Given** 13-test-design/02-catalog.md 본 PR 머지 후
- **When** §2 통합 절 안의 R-OPS-* subsection 카운트
- **Then** ≥ **2건** (R-OPS-AUTO-LABEL + R-OPS-WORKFLOW 최소). 측정 방법: `awk '/^## 2/,/^## 3/' | grep -cE '^### R-OPS-'`

### AC-03: ADR-0002 신설 + Status=Accepted

- **Given** docs/planning/adr/0002-mod-r-ops-r-id-taxonomy.md
- **When** `validate-doc.sh` + `grep -cE '^status: Accepted$' frontmatter`
- **Then** validate OK + status Accepted + 대안 3건 명시. 측정 방법: schema validate + grep.

### AC-04: check-test-catalog-sync.sh OK (R-OPS-* 누락 WARN 없음)

- **Given** 04-srs §3 R-OPS-* 4건 + 13/02-catalog §2 fan-in 적용
- **When** `bash .claude/scripts/check-test-catalog-sync.sh`
- **Then** WARN 출력 0건 (모든 R-OPS-*가 13-catalog §2에 fan-in 됨). 측정 방법: script exit 0 + stderr 빈 출력.

## 2. Definition of Done (D-06)

| # | 항목 | 검증 |
| --- | --- | --- |
| 1 | 04-srs §3에 R-OPS-* 4건 subsection 추가 | AC-01 grep |
| 2 | 04-srs frontmatter version v0.1 → v0.2, status Draft → Accepted, related.R-ID에 R-OPS-* 4건 추가 | 사람 review |
| 3 | 04-srs 변경 이력 v0.2 row 추가 (R-ID `R-OPS-*`) | 사람 review |
| 4 | 13/02-catalog §2 통합에 R-OPS-AUTO-LABEL/WORKFLOW fan-in (최소 2건) | AC-02 grep |
| 5 | 13/02-catalog §4 매트릭스에 R-OPS-* 4행 추가 (단위 N/A / 통합 ✅ / E2E N/A) | 사람 review |
| 6 | 13/02-catalog frontmatter version + related.R-ID 갱신 | 사람 review |
| 7 | ADR-0002 신설 (mode=modify Strict Rule) — 컨텍스트·결정·대안 3건·결과·재검토 모두 채움 | AC-03 validate |
| 8 | check-test-catalog-sync.sh WARN 0건 | AC-04 |
| 9 | AI 게이트 6축 PASS (5번째 N/A, 6번째 3 profile smoke OK) | ai-qa-report §2 |
| 10 | Manual verification + DoD coverage 체크박스 *항상 미체크* | ADR-0046 §2.3 |
| 11 | 사람 Approve + 머지 + 자동 close + 라벨 자동 제거 | P14 휴먼 게이트 |

## 3. 비기능 인수

- **R-OPS-AUTO-LABEL**: 본 PR open/머지 시 sync-issue-labels.yml 자동 trigger + 이슈 #52 라벨 자동 전이/제거 자연 회귀 관찰 (R-OPS-WORKFLOW 자기 검증 동시)
- **R-OPS-SMOKE**: 3 profile smoke 본 PR ai-qa-report §7 PASS (dev/stg/prod ready + 에러 0건)
- **R-OPS-WORKFLOW**: PR open 시 issue-pr-title-lint.yml + sync-issue-labels.yml 모두 trigger + conclusion=success (title prefix `mod(docs):` 정규식 정합 확인 — `mod`는 정규식 `(feat|fix|chore|docs|test|refactor)` 미포함이므로 **fail 예상**, 후속 follow-up과 일관성)
- **R-OPS-DOCS-SYNC**: 부팅 자산 변경 0건 → LOCAL.md 동기 N/A (사유 명시 본 PR ai-qa-report §7)

## 4. 회귀 인수

- **회귀-01**: Sprint 5 후속 PR (#48 등) acceptance.md에서 R-OPS-* 정본 R-ID를 사용 가능. ad-hoc 워크어라운드 불필요. 실측 시점 — #48 머지 후 acceptance §0 R-ID 컬럼에 R-OPS-* 등장 여부.
  - 검증 시점: 본 PR 머지 후 첫 후속 PR (#48 또는 #18~#21)
  - 실패 시: R-OPS-* 정의 부족 + ADR 보강 follow-up
