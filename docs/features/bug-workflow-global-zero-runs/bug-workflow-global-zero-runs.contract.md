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

# GitHub Actions workflow 전역 0 runs (Issue 51) — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — H6 (Actions 첫 활성화 cycle) 채택, 코드 변경 0건 진단/관찰 PR |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

> 본 변경은 운영 인프라(GitHub repository settings + workflow dispatcher 활성화 상태)에 대한 진단/관찰 PR이다. 04~12 정본 모두 무관.

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | 04-srs | (none — 운영 인프라) |
| F-ID (기능) | 05-prd | (none) |
| 영향 모듈 | 08-lld-module-spec | (none) |
| 영향 엔드포인트 | 09-lld-api-spec | (none) |
| 적용 컨벤션 절 | 11-coding-conventions | (none) |

## 1. 변경 의도

#47 partial fix(default_workflow_permissions write) 후에도 workflow 전역 0 runs 상태를 진단하여 root cause(H6 — Actions 첫 활성화 cycle)를 식별·기록하고, 본 PR push/머지 자체로 dispatcher 활성화를 자연 검증한다 (ADR-0029 자동화 완전 회복).

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `sync-issue-labels.yml` runs | 0건 (Sprint 1~5 모든 PR) | ≥ 2건 (본 PR opened + closed) |
| `issue-pr-title-lint.yml` runs | 0건 | ≥ 1건 (본 PR opened + title 검증) |
| 전역 `actions/runs total_count` | 0 | ≥ 3 |
| Actions cache 사용량 | `active_caches_size_in_bytes: 0` | > 0 (workflow checkout 발생) |
| Actions 탭 dispatcher 상태 | inactive enable (owner 미방문) | active (owner 방문 완료, "Actions Enabled." 배너 노출 완료) |
| PR 머지 후 이슈 라벨 자동 전이 | 미동작 (수동 정리 필요) | 자동 동작 (`status:in-progress` → `status:in-review` → close 시 일괄 제거) |
| commit/PR title 강제 | 미작동 | 정상 작동 (ADR-0021 정규식) |
| investigation.md | 부재 | 본 PR 산출 (H4 기각 + H5~H10 추가 + H6 채택) |
| manual-sync-guide 보강 | (다음 newProject 위험 잔존) | 본 PR 비목표 §6 — Sprint 6+ 후속 이슈 후보 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `.github/workflows/sync-issue-labels.yml` | 본 PR opened 이벤트로 첫 trigger 발생 예상 (H6 검증) | 코드 변경 없음 — dispatcher 활성화 후 자연 동작 |
| `.github/workflows/issue-pr-title-lint.yml` | 본 PR 제목 `bug(infra): ...` 정규식 검증 trigger 예상 | 코드 변경 없음 |
| `docs/features/bug-workflow-global-zero-runs/*.md` | 신규 8건 산출 (investigation·contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report) | 본 PR diff에 포함 |
| `docs/features/bug-workflow-global-zero-runs/screenshots/` | UI 협업 증적 2장 (settings-actions-general.png, actions-page.png) | 본 PR diff 포함 |
| GitHub repository (jungsoobin96/board-app) Actions 탭 | owner 첫 방문 완료 (2026-05-27 사용자 협업 단계) | PR diff 외 — 사용자 직접 수행, contract §3에 명시 |
| `manual-sync-guide.md` (agent-toolkit) | "Actions 탭 owner 첫 방문 필수" 단계 추가 권고 | 본 PR scope 밖 (비목표 §6) — Sprint 6+ 후속 이슈 후보 |

## 4. Backward Compatibility

- Breaking: **no** — 코드 변경 0건, dispatcher 활성화는 GitHub 측 상태 전환이며 사용자/외부 API 변경 없음
- 마이그레이션 필요: **no**
- 영향 사용자: 본 repo owner(`jungsoobin96`)만. 다른 newProject들은 동일 cycle 위험 잔존 — 별도 follow-up 이슈로 manual-sync-guide 보강 권고

## 5. Rollback 전략

- revert 가능: **no** (dispatcher 활성화 자체는 GitHub 측 상태이며 사용자 측에서 비활성화 API 미제공)
- rollback 절차: 본 PR docs revert는 가능 (`git revert <merge-sha>`)하지만 dispatcher 활성화는 그대로 유지됨 → 라벨 자동 전이도 그대로 작동
- 데이터 손상 위험: **없음** — 본 변경은 read-only 진단 + docs 산출
- 비상시 워크어라운드: 라벨 자동 전이가 의도와 다르게 동작 시 `actions/permissions`에서 workflow 일시 disable (`gh api -X PUT .../actions/permissions -F enabled=false`) — 단, 본 케이스 사후 발견되지 않을 가능성 높음

## 6. 비목표

- `manual-sync-guide.md` §"agent-toolkit 도입 후 수동 보강" 절에 "Actions 탭 owner 첫 방문" 단계 추가 — Sprint 6+ agent-toolkit upstream 후속 이슈
- install.sh가 setup 완료 시 Actions 탭 URL 자동 안내 또는 `gh api repos/.../actions/runs` polling으로 활성화 확인 자동화 — Sprint 6+ 후속
- ADR 신설 — "Actions 첫 활성화 cycle은 GitHub 정책 한계" 명문화 (Sprint 5 retro에서 결정)
- 다른 newProject(이미 도입된 repo들) 대량 점검 + Actions 탭 방문 일괄 처리 — 별도 운영 이슈
- `pr-body-checkbox-gate.yml` (ADR-0046 §2.5) 도입 — Sprint 5 별도 이슈
- #47 PR #49의 H4 fix(default_workflow_permissions write) revert — 보존 (장기적 보안 강화 조치로 필요)
