---
doc_type: feature-risk
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

# GitHub Actions workflow 전역 0 runs (Issue 51) — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 3 F-RISK 모두 Low (보안/외부 의존/회귀) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | 본 PR push 후에도 trigger 0건 (H6 기각) | 3 | 2 | Low |
| F-RISK-02 | dispatcher 활성화 후 의도와 다른 라벨 자동 전이 동작 | 2 | 1 | Low |
| F-RISK-03 | Sprint 5 후속 PR(#52, #48) 회귀 시 자연 회복 안 됨 | 3 | 1 | Low |

## 2. 리스크 상세

### F-RISK-01 — H6 기각 시 BLOCKED 처리

본 PR push + open 후 30초 대기에도 sync-issue-labels.yml runs = 0이면 H6 가설 기각. P10 ai-qa-report 단계에서 BLOCKED + 사용자 추가 협업 요청:
- (a) GitHub Billing & plans 페이지 (`/settings/billing`) 스크린샷 — spending limit / free tier 한도 확인 (H8)
- (b) GitHub Security & 2FA 페이지 — account 보안 요구사항 미충족 확인 (H10)
- (c) `gh api repos/.../actions/runs --jq '.total_count'` 재실행 + Actions 페이지 직접 새로고침 — dispatcher 활성화 지연 가능성

**완화책**: investigation.md §7에 본 검증 임계가 명시되어 있고, P10 단계에서 0건 발견 시 PR 생성 자체를 BLOCK한다 (추측 기반 머지 금지). 코드 변경 0건이므로 BLOCKED 처리에 따른 작업 손실 거의 없음.

### F-RISK-02 — 자동 라벨 전이 오작동

sync-issue-labels.yml이 의도와 다르게 `status:in-review`를 머지된 PR에서 잔존시키거나, `tested` 라벨을 잘못 제거할 위험. 본 워크플로는 #47 PR #49에서 검증 완료된 YAML이며 본 PR은 코드 변경 0건.

**완화책**: 본 PR 머지 후 이슈 #51의 라벨 상태를 사용자가 직접 확인 (AC-03 §3 단계). 오작동 시 즉시 `gh issue edit 51 --add-label status:in-progress` 수동 복원.

### F-RISK-03 — Sprint 5 후속 PR 회귀 실패

본 PR로 dispatcher 활성화가 검증되었더라도, 어떤 GitHub 내부 정책으로 다음 PR에서 다시 0건이 될 가능성. 가능성 매우 낮으나 잔존.

**완화책**: Sprint 5 retro에서 #52·#48 머지 후 trigger 상태 명시 검증. 회귀 발견 시 ADR 신설 + agent-toolkit 보강 follow-up.

## 3. High 등급 단계적 롤아웃

High 등급 RISK 부재 — 본 PR은 코드 변경 0건 docs/screenshots 산출 + 자연 검증 PR. 단계적 롤아웃 불필요.

## 4. 데이터 영속성 변경

없음 — 본 PR은 read-only 진단. DB 마이그레이션·schema 변경·migration script 모두 N/A.

## 5. 15-risk.md 갱신 항목

신규 추가 항목 없음. 본 PR의 3 F-RISK는 모두 본 PR scope 내 Low 등급으로 흡수. 단, Sprint 5 retro에서 다음 항목 검토 후보:
- **RISK 신규**: "agent-toolkit 도입 newProject들 — Actions dispatcher 첫 활성화 cycle 위험 잔존" (다른 repo 일괄 점검 필요) — Sprint 6+ 별도 운영 이슈
