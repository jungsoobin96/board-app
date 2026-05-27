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

# sync-issue-labels.yml workflow 0 runs — Feature Risk

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 3 RISK + Low 등급 + reversible (Issue #47) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| F-RISK-01 | GITHUB_TOKEN write 권한 확대로 인한 잠재 보안 노출 | 2 | 1 | Low |
| F-RISK-02 | workflow 변경에도 트리거 회복 실패 (H4 가설 오인 가능성) | 3 | 2 | Low |
| F-RISK-03 | concurrency 보강이 정상 시나리오에서 race condition 유발 | 2 | 1 | Low |

## 2. 리스크 상세

### F-RISK-01: GITHUB_TOKEN write 권한 확대로 인한 잠재 보안 노출

- 카테고리: 보안
- 트리거 신호: 제3자가 본 repo에 PR을 열어 workflow를 통해 부정 라벨 조작 시도 (개인 repo + 단일 trunk 환경에서 가능성 매우 낮음)
- 완화 전략: `can_approve_pull_request_reviews: false` 유지 (PR 승인 권한은 GITHUB_TOKEN에 없음). workflow YAML의 `permissions:` 명시는 *그 workflow의 권한 상한*에만 적용 — 다른 workflow는 기본 write를 받지만 명시적으로 issues:write를 사용하지 않는 한 실제 권한 동작 없음. `allowed_actions: all` 유지(외부 action 사용 가능), 단 본 repo의 2 workflow는 외부 action 미사용
- 검증 방법: `gh api repos/.../actions/permissions/workflow --jq '.can_approve_pull_request_reviews'` 결과 `false` 확인. workflow YAML 변경 시 권한 추가는 ADR 또는 별도 PR 강제

### F-RISK-02: workflow 변경에도 트리거 회복 실패

- 카테고리: 외부 의존
- 트리거 신호: 본 PR open 후 5분 이내 `gh api .../runs --jq '.total_count'` 결과 여전히 0
- 완화 전략: (a) GitHub Actions 서비스 자체 장애일 가능성 1차 점검 — `https://www.githubstatus.com/`. (b) Repository Settings UI 확인 — Actions → General → Workflow permissions가 실제 "Read and write permissions"로 적용됐는지 (API와 UI 간 sync 시점차 가능). (c) 가설 재수립 — H3(disabled period) 또는 미발견 가설 추가 점검. 본 PR을 draft로 전환 후 추가 debug. (d) install.sh 도입 시 별도 자동화 단계가 빠진 sub-effect 가능성 점검
- 검증 방법: 본 PR open 후 5분 + 추가 5분 모니터링. `gh run list --workflow=sync-issue-labels.yml --limit=5` 결과 비어 있으면 F-RISK-02 발동 → BLOCKED + draft 전환 + 추가 investigation

### F-RISK-03: concurrency 보강이 정상 시나리오에서 race condition 유발

- 카테고리: 호환성
- 트리거 신호: 빠른 연속 open/closed 이벤트 시 cancel-in-progress가 cleanup step을 cancel하여 라벨이 미정리 상태로 잔존
- 완화 전략: `concurrency.group`을 PR 번호별로 namespace (`sync-issue-labels-${{ github.event.pull_request.number }}`)하여 다른 PR의 run과 충돌 없음. 같은 PR 내 빠른 open→close는 의도적으로 마지막 이벤트만 처리되도록 — 단, closed 이벤트는 일반적으로 사람의 머지 클릭이라 빠르게 연속 발생 가능성 낮음. AC-03 시나리오로 사후 관찰
- 검증 방법: AC-03 — Sprint 5 #48 또는 후속 PR에서 인위적 재현 또는 자연 관찰. 라벨 잔존 시 P1 follow-up 이슈 등록

## 3. High 등급 단계적 롤아웃

(없음 — 본 변경 모든 리스크 Low 등급. 단계적 롤아웃 N/A.)

> 다만 본 PR이 머지된 직후 Sprint 5 *첫 후속 PR* (#48)에서 자연 관찰을 1회 거쳐 회복을 최종 확인. 회복 실패 시 즉시 contract §5 rollback 절차 발동.

## 4. 데이터 영속성 변경

(없음 — workflow YAML + repository settings만. DB·캐시·스토리지 무변경.)

## 5. 15-risk.md 갱신 항목

(없음 — 본 PR 리스크 모두 Low + 본 PR 내 완화. `docs/planning/15-risk/15-risk.md` 신규 추가 항목 없음.)
