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

# sync-issue-labels.yml workflow 0 runs — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — AC-01·02·03 + DoD 6항 (Issue #47) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

> **R-OPS-AUTO-LABEL 주석**: 본 ad-hoc R-ID는 ADR-0029의 *운영 비기능 요구*(FSM 라벨 자동 전이)를 임시 표현. 04-srs §비기능에 R-OPS-* prefix 신설은 Sprint 5 후속 이슈 후보 (eng-review 6.4 발견 사항과 동일 맥락).

## 1. 인수 기준 (Given/When/Then)

### AC-01: PR open 시 라벨 자동 전이

- Given: 본 PR(`bug/sync-issue-labels-workflow-issue-47`)의 body에 `Closes #47`이 포함되어 있고, Repository Settings의 `default_workflow_permissions: write`가 적용된 상태.
- When: `gh pr create`로 PR 생성 (draft 아님).
- Then: 5분 이내에 `gh api repos/jungsoobin96/board-app/actions/workflows/sync-issue-labels.yml/runs --jq '.total_count'` 결과 ≥ 1, 이슈 #47 라벨이 `status:in-progress` → `status:in-review`로 자동 전이.
- 측정 방법: 자동 테스트 (workflow run + 이슈 라벨 조회 명령 — `gh issue view 47 --json labels`)
- R-ID: R-OPS-AUTO-LABEL

### AC-02: PR merged 시 status:* 일괄 제거 + 이슈 close

- Given: 본 PR이 AC-01 PASS 후 사람이 머지(`gh pr merge --squash`)한 시점.
- When: workflow `closed && merged == true` 이벤트 트리거.
- Then: `runs.total_count` ≥ 2 (open 1 + closed 1), 이슈 #47에서 `status:in-progress`·`status:in-review`·`status:todo`·`status:blocked` 라벨 모두 제거(존재한 것만), 이슈 #47 자동 close (`Closes #47` 키워드 효과).
- 측정 방법: 자동 테스트 (`gh issue view 47 --json state,labels` → state=CLOSED + labels에 status:* 없음)
- R-ID: R-OPS-AUTO-LABEL

### AC-03: workflow YAML concurrency 보강 동작

- Given: 본 PR의 `.github/workflows/sync-issue-labels.yml` 변경 — `concurrency: group: sync-issue-labels-${{ github.event.pull_request.number }} / cancel-in-progress: true` 추가.
- When: 같은 PR에서 빠르게 두 번 `opened`/`reopened` 이벤트 발생 (인위적 시나리오 — Sprint 5 #48 PR re-open 시 자연 관찰 가능).
- Then: 두 번째 트리거가 첫 번째 진행 중 run을 cancel하고 새로 시작 (Actions UI에서 cancelled status 1건 + completed 1건).
- 측정 방법: 수동 확인 (Actions UI 관찰, Sprint 5 #48 reopen 시나리오 발생 시)
- R-ID: R-OPS-AUTO-LABEL

## 2. Definition of Done (D-06)

- [ ] **단위 테스트**: N/A (workflow YAML 자체는 GitHub Actions 환경 전용 — manual reproduction으로 대체. plan §4 단계 B `grep -oiE` 추출 cherry-pick 확인 1회)
- [ ] **AI 게이트** (D-06 1단, ADR-0011 + ADR-0037 + ADR-0047): 6축 PASS (1 Build / 2 Automated tests / 3 Manual verification / 4 DoD coverage / 5 UI 골든패스 N/A `ui_changed=false` / 6 로컬 부팅 3 profile 검증). 워크플로 양축 검증 manual reproduction 결과 명시.
- [ ] **Test Plan 4블록** (Build / Automated tests / Manual verification / DoD coverage) PR body에 자동 채움 — `/qa-test --ai` 산출
- [ ] **tested 라벨** 자체는 폐지 (ADR-0046 §3 v1.2) — 머지 게이트는 `pr-body-checkboxes` status check가 자동 발행. 본 PR은 status check 미도입 단계라 사람이 Manual + DoD 미체크 → 머지 시점에 사람이 직접 확인 후 머지 클릭
- [ ] **Approve** ≥ 1 (사용자 본인 머지)
- [ ] **CI green** (`.github/workflows/issue-pr-title-lint.yml` PR title 정규식 PASS + sync-issue-labels.yml은 본 PR의 검증 대상 — runs 발생 자체가 PASS)

## 3. 비기능 인수

- 운영: PR 머지 후 5분 이내에 라벨 전이 완료 (Actions 큐 지연 고려)
- 보안: GITHUB_TOKEN write 권한 확대 후에도 `can_approve_pull_request_reviews: false` 유지 → workflow가 PR 승인 불가 (Generator≠Evaluator 보존)
- 가시성: Actions UI에서 본 PR `sync-issue-labels.yml` workflow run의 step 5개(extract / skip / transition / cleanup / 기타)가 실시간 관찰 가능

## 4. 회귀 인수

- (회귀 보호) Sprint 5 다음 PR (#48 P1 TS 정정)에서 본 fix가 회귀하지 않음 — `runs.total_count` ≥ 1, 이슈 #48 라벨 자동 전이 1회 자연 관찰
- (회귀 보호) `issue-pr-title-lint.yml`도 부수적 회복 — Sprint 5 첫 PR(#48 등) 머지 시점에 runs +1 관찰
- (잠재 회귀) 향후 누군가 Settings에서 `default_workflow_permissions: read`로 되돌리면 본 회복 무효화 — install.sh 자동화(Sprint 5 후속 후보) 또는 manual-sync-guide 갱신으로 방지
