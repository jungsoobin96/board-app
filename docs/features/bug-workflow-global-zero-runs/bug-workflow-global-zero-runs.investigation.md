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

# GitHub Actions workflow 전역 0 runs (Issue 51) — Bug Investigation

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — UI 협업 진단 + H6 (Actions 첫 활성화 cycle) 채택 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 현상 / 보고

- 보고 출처: Issue #47 (PR #49 merge_commit=`67ae9cc`) 사후 검증 단계에서 `gh api .../actions/runs --jq '.total_count'` 결과 0건 지속 관찰
- 현상: #47 H4 가설(`default_workflow_permissions: read`)을 Settings API로 `write` 적용 + workflow YAML concurrency 보강을 머지했음에도 두 workflow(`sync-issue-labels.yml`, `issue-pr-title-lint.yml`)의 trigger가 **여전히 전역 0건**. PR #49·#50 머지 후에도 변동 없음.
- 재현 빈도: 항상 — Sprint 1~5 모든 PR(#33·#36·#38·#42·#43·#44·#45·#46·#49·#50, 10건 이상)에서 100% 미트리거
- 영향 범위: ADR-0029 FSM 라벨 자동 전이가 미작동 → 매 머지 후 사용자/LLM이 `gh issue edit --remove-label status:in-progress`를 수동 호출. ADR-0021 title-lint도 미작동 → 잘못된 commit/PR 제목 차단 안 됨.

## 2. 재현 절차

```bash
# 1. workflow 상태 (active 확인됨)
gh api repos/jungsoobin96/board-app/actions/workflows \
  --jq '.workflows[] | {id, name, path, state}'
# → 둘 다 state: active

# 2. workflow runs (#49 + #50 머지 이후 시점)
gh api 'repos/jungsoobin96/board-app/actions/workflows/sync-issue-labels.yml/runs?per_page=1' \
  --jq '.total_count'
# 기대: ≥ 2 (PR #49 opened + closed)
# 실제: 0

gh api 'repos/jungsoobin96/board-app/actions/workflows/issue-pr-title-lint.yml/runs?per_page=1' \
  --jq '.total_count'
# 기대: ≥ 5 (issues + PRs 합산)
# 실제: 0

# 3. 전체 repo runs (모든 event)
for e in pull_request push schedule workflow_dispatch issues; do
  echo "event=$e: $(gh api "repos/jungsoobin96/board-app/actions/runs?event=$e&per_page=1" --jq '.total_count')"
done
# 실제: 모든 event=0
```

## 3. 환경 / 컨텍스트

- Repository: `jungsoobin96/board-app` — public, created `2026-05-22T05:11:51Z`, default_branch=`main`, archived=false, disabled=false, fork=false
- 사용자: `jungsoobin96` (personal account, `gh api user --jq '.plan'` → `null` — token scope 부족으로 plan 조회 불가, free plan 가능성)
- gh CLI token scopes: `gist, read:org, repo, workflow` (정상)
- Repository Settings → Actions → General 실측 (스크린샷 `docs/features/bug-workflow-global-zero-runs/screenshots/settings-actions-general.png`):
  - **Actions permissions**: `Allow all actions and reusable workflows` ✅
  - **Approval for running fork pull request workflows from contributors**: `Require approval for first-time contributors` 선택
  - **Workflow permissions**: `Read and write permissions` ✅ (#47 PR #49 API 적용 확인)
  - **Allow GitHub Actions to create and approve pull requests**: ❌ unchecked
  - 페이지 상단/하단 차단 배너(disabled/policy/billing 등) **없음**
- Actions 페이지(`/jungsoobin96/board-app/actions`) 실측:
  - 좌측 패널: `issue-pr-title-lint`, `Sync Issue Labels on PR` 두 workflow 정상 나열
  - **상단 청록색 배너 "Actions Enabled."** — 일회성 알림 (페이지 첫 접근 시 활성화 의미)
  - 중앙: "**There are no workflow runs yet.**" — `0 workflow runs`
  - Approval 대기 / pending run 배너 없음
  - Filter 가능한 Workflow/Event/Status/Branch/Actor 드롭다운 정상
- GitHub Status (`githubstatus.com/api/v2/components.json`): Actions=`operational` (service-side 정상)
- 두 workflow 파일 SHA: GitHub contents API = `5bbd2f6` = 로컬 `git ls-tree` = 일치 (파일 동기 정상)
- 인코딩: UTF-8 / LF only / BOM 없음 / 권한 644 (정상)

## 4. 로그·증적

- `gh api .../actions/workflows/<name>/runs --jq '.total_count'` = 0 (두 workflow)
- `gh api .../actions/runs?event=<e>` = 0 (5종 event 모두)
- `gh api .../actions/cache/usage` = `active_caches_size_in_bytes: 0`
- `actions/permissions/workflow` = `{"default_workflow_permissions":"write","can_approve_pull_request_reviews":false}` ← #47 fix 적용 확인
- `actions/permissions` = `{"enabled":true,"allowed_actions":"all","sha_pinning_required":false}` ← 정상
- 스크린샷 2장: `screenshots/settings-actions-general.png`, `screenshots/actions-page.png`(외부 캡처) — 모두 차단 표시 없음

## 5. 가설 + 근거

| # | 가설 | 근거 | 검증 방법 | 결과 |
| --- | --- | --- | --- | --- |
| H4 (#47) | `default_workflow_permissions: read` → 권한 부족으로 trigger 차단 | API 응답 `read` | API PUT `write` 적용 후 PR open | ❌ **기각** — PR #49/#50 머지 후에도 0건 지속 |
| H5 | workflow file 인코딩/CRLF/BOM 오염 (install.sh windows 카피 부작용) | `file` 명령 결과 UTF-8 + `tr -cd '\r' \| wc -c` 0 + SHA local=GitHub 일치 | local + remote SHA 비교 | ❌ 기각 — 파일 정합 정상 |
| H6 | **Actions 첫 활성화 cycle** — GitHub은 신규 personal account의 신규 repo에 대해 owner가 직접 Actions 페이지를 방문할 때까지 workflow trigger를 silent로 보류. API `enabled: true` 응답은 inactive enable이고 실제 dispatcher는 첫 UI 방문 시점에 활성화 | Actions 페이지 상단 **"Actions Enabled."** 일회성 배너 + 차단/approval 배너 부재 + 모든 event 0건 + repo 5일 됨에도 cache 0 bytes | 본 PR push 직후 trigger 발생 여부 관찰 | ✅ **본 가설 채택** (검증은 P10 단계 자연 진행) |
| H7 | `Require approval for first-time contributors` 옵션이 owner 본인 workflow에도 적용 → 모든 PR이 "Awaiting approval"로 silent block | Settings 라디오 선택됨 | Actions 페이지에 "Approval required" 배너/pending run 확인 | ❌ 기각 — Actions 페이지에 pending run 0건, approval 배너 없음 |
| H8 | GitHub plan billing/spending limit 0 → free tier 외부 호출 차단 | `gh api user --jq '.plan'` = null (조회 불가) | settings → billing 페이지 확인 | ⏳ Low 가능성 — public repo는 무제한, 단 plan 미설정 시 일부 기능 제약 가능 (검증 보류, H6 확인 후 재진단) |
| H9 | install.sh 카피 시 workflow file을 detached commit으로 push (default branch 무관 commit) | `git log --all -- .github/workflows/sync-issue-labels.yml` → main 직 commit `5d59039`, `67ae9cc` 2건 | git log 결과 | ❌ 기각 — 모두 main 직 commit |
| H10 | account 보안(2FA·SMS) 미설정으로 Actions trust score 부족 | (직접 검증 불가) | settings → security 확인 | ⏳ Low — H6 확인 후 재진단 |

## 6. 근본 원인 (Root Cause)

**H6 채택 — Actions 첫 활성화 시점 cycle (Inactive Enable 상태)**:

GitHub은 신규 personal account의 신규 repository에 대해 다음 단계 분리 정책을 적용한다:
1. `.github/workflows/*.yml` commit이 default branch에 들어가면 API상 `enabled: true` + `state: active`로 등록
2. **그러나 owner가 직접 Actions 탭에 처음 방문할 때까지 dispatcher가 active mode로 전환되지 않음** — 일종의 inactive enable
3. 본 inactive enable 상태에서는 push/PR/issue 이벤트가 발생해도 workflow run이 silent로 trigger되지 않음. UI상 차단 표시도 없음 (단순히 0 runs)
4. owner가 처음 Actions 탭 방문 시 GitHub이 사용자에게 일회성 "Actions Enabled." 배너 표시 + dispatcher를 active mode로 전환
5. 그 이후 발생하는 PR/push/이슈 이벤트부터 정상 trigger

본 repo는 2026-05-22 install.sh로 workflow가 main에 commit되었으나 2026-05-27까지 owner가 Actions 탭을 방문한 적 없었음. 따라서 Sprint 1~4 + Sprint 5 #47·#50 모든 PR이 inactive enable 상태에서 발생 → 전역 0건. 2026-05-27 사용자가 본 진단 협업 단계에서 Actions 탭에 직접 방문 → "Actions Enabled." 배너 노출 → dispatcher 활성화 완료.

**부가 원인**: #47 PR #49의 H4 가설은 잘못된 근본 원인 식별이었음. `default_workflow_permissions: read`는 *부수적* 보안 강화 조치였고 trigger 0건의 직접 원인은 아니었음. 그러나 fix 자체는 보존 (장기적으로 필요한 조치).

**해결책**: 
1. **즉시 fix (코드 변경 0건)**: 본 진단 PR push 자체가 dispatcher 활성화 이후 첫 PR이므로 trigger 자연 발생 관찰로 H6 확정 + 회복 완료
2. **장기 fix (별도 후속 이슈)**: `manual-sync-guide.md` §"agent-toolkit 도입 후 수동 보강"에 "**필수**: 도입 직후 owner가 Actions 탭(`https://github.com/<owner>/<repo>/actions`) 직접 방문"을 추가 — 다른 newProject 회귀 방지
3. **install.sh 자동화 후보 (Sprint 6+)**: install.sh가 setup 완료 시점에 자동으로 Actions 탭 URL을 사용자에게 안내

> **추론 한계**: H6은 GitHub 공식 문서에 명시된 정책이 아님. 본 관찰("Actions Enabled." 배너 + 모든 진단 정상인데 trigger 0건)로 가장 일관되게 설명되는 가설. 본 PR push 후 trigger ≥ 1 발생으로 자연 확정 / 발생 안 하면 H8·H10 재진단.

## 7. 회귀 테스트 추가 항목

- **본 PR push 직후 trigger 발생 검증 (H6 확정 단계)**: 
  ```bash
  git push -u origin bug/workflow-global-zero-runs-issue-51
  gh pr create --base main ...
  sleep 30
  gh api repos/jungsoobin96/board-app/actions/workflows/sync-issue-labels.yml/runs --jq '.total_count'
  # 기대: ≥ 1 (PR opened 이벤트 trigger)
  # 0이면 → H6 기각 → H8·H10 재진단
  ```
- **본 PR 머지 직후 추가 trigger**: 머지 시 `closed && merged==true` 이벤트로 +1 (sync-issue-labels.yml) → total ≥ 2
- **Sprint 5 다음 PR (#52 or #48 등) 자동 trigger 자연 관찰**: 본 PR 머지 후 후속 PR open 시 라벨 자동 전이 + title-lint 모두 동작
- **단위 테스트 N/A** — workflow YAML 자체는 GitHub Actions runtime에서만 실행. CI 게이트는 양축 검증으로 대체 (ADR-0047)

## 8. 영향 받는 다른 영역

- `.github/workflows/issue-pr-title-lint.yml` — 같은 dispatcher 영향. 본 fix 적용으로 동시 회복 기대 (runs 0 → ≥1)
- ADR-0029 자동화 — sync-issue-labels.yml 회복으로 FSM 라벨 자동 전이 정상 작동 예상
- ADR-0021 title-lint — issue-pr-title-lint.yml 회복으로 commit/PR 제목 강제 정상 작동 예상
- ADR-0046 §2.5 `pr-body-checkbox-gate.yml` — 추후 도입 예정. H6 가설이 옳다면 도입 후에도 즉시 trigger 정상 (사용자가 이미 Actions 탭 방문 완료 상태)
- `manual-sync-guide.md` — install.sh 카피 후 수동 보강 절차에 "Actions 탭 owner 첫 방문 필수" 추가 (별도 follow-up 이슈, Sprint 6+ 후보)
- 다른 newProject들 — agent-toolkit 도입 시 동일 inactive enable 상태 위험. install.sh 자동화 또는 README BLOCK 후보
