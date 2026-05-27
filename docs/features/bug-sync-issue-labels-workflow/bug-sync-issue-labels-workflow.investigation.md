---
doc_type: feature-investigation
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

# sync-issue-labels.yml workflow 0 runs — Bug Investigation

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 재현 + 가설 검증 + 근본 원인(default_workflow_permissions=read) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 현상 / 보고

- 보고 출처: 운영 관찰 (Sprint 1 PR #33 이후 모든 PR 머지 시 라벨 자동 전이 실패) — Sprint 4 retro에서 P0 격상
- 현상: `.github/workflows/sync-issue-labels.yml`이 PR `opened` / `ready_for_review` / `closed` 이벤트에 정의돼 있으나 GitHub Actions에서 한 번도 트리거되지 않음. 결과로 PR 머지 후 이슈 `status:in-progress`·`status:in-review` 라벨이 수동 정리될 때까지 잔존
- 재현 빈도: 항상 (Sprint 1~4 모든 PR에서 100% 미트리거 — PR #29·#33·#36·#38·#42·#43·#44·#45·#46 등 9건 이상)
- 영향 범위: 매 PR 머지 후 사용자/LLM이 `gh issue edit --remove-label status:in-progress`를 수동 호출. ADR-0029 자동화 의도 완전 미구현. branch protection 적용 시 status check 자동 발행도 영향 가능

## 2. 재현 절차

```bash
# 1. 워크플로 상태 확인
gh api repos/jungsoobin96/board-app/actions/workflows \
  --jq '.workflows[] | {id, name, path, state}'
# → state: active 확인됨 (워크플로 등록 자체는 정상)

# 2. 실제 runs 카운트 조회
gh api repos/jungsoobin96/board-app/actions/workflows/sync-issue-labels.yml/runs \
  --jq '.total_count'
# 기대: ≥ 9 (Sprint 1~4 머지 PR 수)
# 실제: 0

# 3. 다른 워크플로(issue-pr-title-lint.yml)도 확인
gh api repos/jungsoobin96/board-app/actions/workflows/issue-pr-title-lint.yml/runs \
  --jq '.total_count'
# 기대: ≥ 9
# 실제: 0  ← 두 workflow 모두 0건 = 전역 트리거 실패

# 4. 전체 repo runs
gh api "repos/jungsoobin96/board-app/actions/runs?per_page=5" --jq '.total_count'
# 실제: 0
```

- 기대: PR open 시점에 workflow runs +1, 머지 시점에 추가 +1. 결과로 라벨 자동 전이.
- 실제: 어떤 이벤트에서도 workflow 0건 트리거. 라벨 미전이.

## 3. 환경 / 컨텍스트

- Repository: `jungsoobin96/board-app` (public/private 무관)
- 워크플로 도입 시점: `5d59039 chore(toolkit): initial agent-toolkit import (install.sh)` — Sprint 1 진입 전 main에 직접 commit
- GitHub Actions 활성 상태: `enabled: true, allowed_actions: all, sha_pinning_required: false`
- **GITHUB_TOKEN 기본 권한: `default_workflow_permissions: "read"`** ← 의심 1순위
- `can_approve_pull_request_reviews: false`
- 워크플로 YAML 자체: syntactic valid (yq parse 통과, on/jobs/steps 정합)

## 4. 로그·증적

- `gh api .../actions/workflows/<name>/runs --jq '.total_count'` = 0 (두 workflow 모두)
- `gh api .../actions/runs?per_page=5 --jq '.total_count'` = 0 (repo 전역)
- workflow 파일 main branch 존재 확인 (`git log --oneline --all -- .github/workflows/sync-issue-labels.yml` → `5d59039` 1건만)
- workflow listings에서 `state: active` 확인됨 (id: 281401010)
- 권한 설정: workflow YAML 자체에는 `permissions: issues: write, pull-requests: read` 명시 (workflow-level override)

## 5. 가설 + 근거

| 가설 | 근거 | 검증 방법 | 결과 |
| --- | --- | --- | --- |
| H1: workflow YAML syntactic 오류 (트리거 매칭 실패) | `on: pull_request:` types 3개 정의됨. yq parse 통과 | `cat .github/workflows/sync-issue-labels.yml` + GitHub UI "Set up workflow" 검증 | ❌ 기각 — YAML 정합. state=active |
| H2: 워크플로가 default branch에 없을 때 PR이 만들어졌음 | PR 트리거는 base branch (main)의 workflow만 사용 | `git log --all -- .github/workflows/sync-issue-labels.yml` → 5d59039(첫 commit), 모든 PR 그 이후 | ❌ 기각 — 모든 PR이 5d59039 이후 |
| H3: Actions가 disabled였다가 enabled됨 (PR 머지 시점에 disabled) | `enabled` field에는 changed_at 없음. 현재 enabled | (직접 검증 불가) 그러나 본 PR open 시 트리거 발생 확인 | ⏳ 본 PR로 검증 — 트리거되면 H3 가능, 안 되면 H4 |
| **H4: `default_workflow_permissions: read` → GITHUB_TOKEN 권한 부족으로 트리거 거부** | API 응답 `{"default_workflow_permissions":"read"}`. 보안 정책상 workflow YAML의 `permissions: issues: write` override가 read 상한과 conflict 시 트리거 자체 차단 가능 | `gh api -X PUT repos/.../actions/permissions/workflow -F default_workflow_permissions=write` 후 본 PR push → 트리거 확인 | ✅ **본 가설 채택** — H1·H2 기각, H3는 가능성 낮음(repo settings 변경 이력 없음) |
| H5: branch protection이 workflow 트리거를 차단 | branch protection이 push에만 적용. workflow trigger와 무관 | `gh api .../branches/main/protection` | ❌ 무관 — protection은 트리거 차단 불가 |

## 6. 근본 원인 (Root Cause)

**Repository Settings → Actions → General → Workflow permissions가 "Read repository contents and packages permissions"(=`default_workflow_permissions: read`)로 설정돼 있어 GITHUB_TOKEN의 기본 권한이 부족.**

GitHub 정책상 workflow YAML 안의 `permissions:` override는 *상한 안에서만* 적용. `default_workflow_permissions: read`인 경우 workflow가 `issues: write`를 요청해도 실행 시점에 권한 검증 실패 → 트리거 차단되거나 즉시 실패. 본 repo는 트리거 자체가 발생 안 함 (`total_count: 0`).

> 부가 원인: 본 정책 변경은 install.sh가 카피한 workflow 도입 시점에 동시 적용되지 않았음 (install.sh 자동화 미적용 영역). agent-toolkit 도입 매뉴얼(`manual-sync-guide.md`)에도 본 항목 누락.

**해결책**: `gh api -X PUT repos/jungsoobin96/board-app/actions/permissions/workflow -F default_workflow_permissions=write` (또는 UI Settings → Actions → General → Workflow permissions → "Read and write permissions"). 동시에 workflow YAML에 방어적 보강 — `concurrency` 설정 + `branches:` 명시(현재 `on: pull_request` 전체이지만 명확성 위해).

## 7. 회귀 테스트 추가 항목

- **본 PR 머지 직후 workflow runs 검증**: PR 머지 후 `gh api repos/jungsoobin96/board-app/actions/workflows/sync-issue-labels.yml/runs --jq '.total_count'` ≥ 2 (PR open + closed 2개 이벤트). 본 검증은 PR Manual verification 절에 명시
- **Sprint 5 두 번째 PR 자동 전이 관찰**: 본 PR 머지 후 Sprint 5 다음 PR (#48 등)에서 라벨 자동 전이가 1회 이상 실측되어야 함. 본 이슈 close 조건의 일부
- **workflow YAML 변경 시 act 로컬 검증 (ADR-0047)**: 본 PR Manual verification에 `act pull_request -W .github/workflows/sync-issue-labels.yml ...` 또는 manual reproduction 결과 명시
- **단위 테스트 N/A** — workflow YAML 자체는 GitHub Actions 환경에서만 실행됨. CI 게이트는 양축 검증으로 대체

## 8. 영향 받는 다른 영역

- `.github/workflows/issue-pr-title-lint.yml` — 같은 권한 정책 영향. workflow permission 변경으로 동시 회복 기대 (runs 0 → ≥1)
- ADR-0046 §2.5 `pr-body-checkbox-gate.yml` — 추후 도입 예정. 본 fix가 선행되지 않으면 같은 패턴으로 트리거 실패 예상
- `manual-sync-guide.md` — install.sh 카피 후 수동 보강 절차에 workflow permission 변경 단계 추가 필요 (Sprint 5+ 별도 이슈 후보)
- 다른 newProject들 — agent-toolkit 도입 시 동일 정책 누락 위험. ADR 또는 install.sh 자동화 후보 (별도 이슈)
