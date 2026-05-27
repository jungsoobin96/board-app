---
doc_type: feature-contract
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# sync-issue-labels.yml workflow 0 runs — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — workflow permissions 변경 + YAML 방어 보강 (Issue #47 mode=bug) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | 04-srs | (none — 운영 인프라) |
| F-ID (기능) | 05-prd | (none) |
| 영향 모듈 | 08-lld-module-spec | (none — CI/CD 영역, 08 module-spec 범위 밖) |
| 영향 엔드포인트 | 09-lld-api-spec | (none) |
| 적용 컨벤션 절 | 11-coding-conventions | (none — YAML workflow는 11 컨벤션 적용 외) |

## 1. 변경 의도

`.github/workflows/sync-issue-labels.yml`이 PR 이벤트에 트리거되지 않는 근본 원인(repository GITHUB_TOKEN 기본 권한이 read인 점)을 fix하여, ADR-0029의 status 라벨 자동 전이 + 머지 시 status:* 일괄 제거 자동화를 회복한다. 동시에 workflow YAML에 방어적 보강(concurrency·comment 명확화)을 추가한다.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| Repository GITHUB_TOKEN 기본 권한 | `default_workflow_permissions: "read"` | `default_workflow_permissions: "write"` (workflow YAML의 `permissions:` override 활성화) |
| workflow runs 카운트 (sync-issue-labels.yml) | 0 (Sprint 1~4 9건 PR 모두 미트리거) | ≥ 2 per PR (opened + closed) — 본 PR 자체로 검증 |
| 라벨 자동 전이 동작 | 미동작 (수동 정리 누적) | PR opened → status:in-progress → status:in-review / PR merged → status:* 일괄 제거 |
| issue-pr-title-lint.yml runs 카운트 | 0 (동일 원인 영향) | ≥ 1 per PR (부수적 회복) |
| workflow YAML concurrency 설정 | 부재 | `concurrency: group: sync-issue-labels-${{ github.event.pull_request.number }} / cancel-in-progress: true` (중복 트리거 시 직전 실행 취소) |
| workflow YAML 주석 | ADR-0029 참조만 | + 본 이슈 #47 + workflow_permissions 의존 명시 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `.github/workflows/sync-issue-labels.yml` | workflow 본체 — concurrency 추가 + 주석 보강 | 본 PR diff에서 직접 수정 |
| `.github/workflows/issue-pr-title-lint.yml` | 같은 권한 정책 의존. 본 PR fix로 부수적 회복 | 동시 변경 없음. 자연 회복 관찰 |
| GitHub Repository Settings → Actions → General → Workflow permissions | `default_workflow_permissions` 변경 — Settings API 호출 또는 UI 변경 | **본 PR 작업의 일부로 사용자 승인 후 `gh api -X PUT` 호출**. 자동 reversible (UI/API로 즉시 read 복귀 가능) |
| 향후 모든 PR | workflow 자동 트리거 + 라벨 전이 활성 | 변경 없음 (자연스럽게 회복) |
| 사용자/LLM의 수동 라벨 정리 패턴 | 더 이상 불필요 | Sprint 5+ 운영에서 수동 호출 0건 기대 |

## 4. Backward Compatibility

- Breaking: **no** — workflow YAML 변경은 추가/보강만(기존 step 동작 그대로). repository settings 변경은 *권한 확대*로 기존 workflow 동작에 부정 영향 없음.
- 마이그레이션 필요: **no** — 기존 PR/이슈 라벨 데이터 그대로 유지. 잔존 `status:in-progress` 라벨은 Sprint 5 첫 정상 머지 시 workflow가 자동 정리.
- deprecation 일정: **N/A**.
- 보안 영향: `default_workflow_permissions: write`는 workflow YAML에서 `permissions:` 명시한 *그 workflow의 권한 상한*을 확대. 본 repo의 2 workflow 모두 `issues: write` 정도만 요청 (개인 repo + 단일 trunk 운영 정합). `can_approve_pull_request_reviews: false` 유지로 GITHUB_TOKEN이 PR 승인은 못 함 (Generator≠Evaluator 원칙 보존).

## 5. Rollback 전략

- revert 가능: **yes** (3단계 이내)
- rollback 절차:
  1. `git revert <merge-commit>` — workflow YAML 변경 되돌리기 (concurrency 보강 제거)
  2. `gh api -X PUT repos/jungsoobin96/board-app/actions/permissions/workflow -F default_workflow_permissions=read` — 권한 read 복귀
  3. `gh api repos/jungsoobin96/board-app/actions/workflows/sync-issue-labels.yml/runs --jq '.total_count'` — rollback 후 새 PR에서 다시 0건 회귀 확인
- 데이터 손상 위험: **없음** — workflow 권한 + YAML 변경만. 이슈/PR 데이터 무변경

## 6. 비목표

- `issue-pr-title-lint.yml` 자체 디버그·수정은 본 PR scope 밖 — 부수적 회복만 관찰. 추가 결함 발견 시 Sprint 5 별도 이슈
- `pr-body-checkbox-gate.yml` (ADR-0046 §2.5) 신설은 별도 이슈 — 본 PR은 *기존* workflow 회복만
- agent-toolkit `manual-sync-guide.md` 갱신 (workflow permissions 변경 단계 추가)은 별도 이슈 (newProject 도입 시 본 결함 재발 방지)
- install.sh 자동화 (workflow permission auto-PUT)는 ADR + agent-toolkit upstream 변경 영역. 본 PR scope 밖
- 다른 newProject들에 동일 fix 전파는 별도 작업
