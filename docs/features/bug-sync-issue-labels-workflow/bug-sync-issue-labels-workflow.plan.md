---
doc_type: feature-plan
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

# sync-issue-labels.yml workflow 0 runs — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 2 커밋 분할(settings API · workflow YAML) + 양축 검증 (Issue #47) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `fix(infra): workflow YAML 방어 보강 (concurrency + 본 이슈 참조 주석) (#47)` | `.github/workflows/sync-issue-labels.yml` | manual reproduction (단계 4) | Low — 추가만, 기존 step 무변경 |
| 2 | (별도 step) Repository Settings API 호출 — `gh api -X PUT .../actions/permissions/workflow -F default_workflow_permissions=write` | Repository settings (코드 변경 없음) | API 호출 후 응답 확인 + 본 PR open 시 trigger ≥ 1 관찰 | Low — reversible (rollback contract §5 1단계로 즉시 복귀 가능) |

> 커밋 2는 **PR diff에 들어가지 않는 settings 변경**. PR body / commit message에 명시 + sing-issue-labels.yml 주석에 참조 명시. P14 휴먼 게이트 + ai-qa-report `## 7. 로컬 부팅 가능성` 표 외 별도 `## 8. Settings 변경 증적` 절(스키마 외 추가)로 직렬화.

## 2. 의존성 그래프

```
[설계] 04 SRS·05 PRD 불필요 (운영 인프라)
   │
   ▼
[Investigation] bug-sync-issue-labels-workflow.investigation.md (PASS, H4 근본 원인 확정)
   │
   ▼
[Contract] §0 Referenced-IDs 모두 (none) + §1~§6 PASS
   │
   ▼
[Plan] 본 문서
   │
   ▼
커밋 1: workflow YAML 보강      ⟶  PR diff에 포함
커밋 2: Settings API 호출       ⟶  PR body / commit body에 명시 (diff 외)
   │                                  │
   └──────────┬───────────────────────┘
              ▼
   [PR open] workflow 자동 트리거 검증 (H4 가설 최종 검증)
   [PR merged] runs ≥ 2 + status:* 일괄 제거 확인
```

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 1 (YAML 보강) | manual reproduction (act 또는 dev fork) — `act pull_request -W .github/workflows/sync-issue-labels.yml -e <event.json>` 또는 PR open 시 GitHub UI Actions 탭 관찰 | (a) PR opened 시 step "Extract linked issues" `issues=47` 추출, (b) step "Transition labels" 호출 시 `gh issue edit ... --add-label status:in-review --remove-label status:in-progress` 실행, (c) PR closed && merged 시 step "Cleanup status:* labels" 호출 — status:* 4개 라벨 일괄 제거 시도 |
| 2 (Settings API) | API 응답 확인 — `gh api repos/.../actions/permissions/workflow --jq '.default_workflow_permissions'` → `"write"`. 본 PR open 후 5분 이내 `gh api .../runs --jq '.total_count'` ≥ 1 관찰 | (a) 권한 변경 직후 응답 200, (b) 본 PR open 시 workflow trigger ≥ 1, (c) 본 PR merged 시 trigger ≥ 2 + 이슈 #47 close + 라벨 일괄 제거 |
| 통합 회귀 (Sprint 5 #48) | Sprint 5 다음 PR (#48 P1 TS 정정)에서 자연 관찰 | 본 fix 머지 후 #48 PR open 시 workflow trigger + 이슈 #48 라벨 자동 전이 |

## 4. 빌드·실행 검증 단계

```bash
# 단계 A: 본 PR diff 빌드 검증 (workflow YAML 자체)
yq eval '.' .github/workflows/sync-issue-labels.yml > /dev/null && echo "YAML syntactic PASS"

# 단계 B: manual reproduction (양축 검증 ADR-0047)
# act 미설치 환경에서 step bash 단계별 cherry-pick 실행:
PR_BODY="Closes #47"
ISSUES=$(printf '%s' "$PR_BODY" \
  | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' \
  | grep -oE '#[0-9]+' \
  | tr -d '#' \
  | sort -u \
  | tr '\n' ' ')
echo "Extracted: ${ISSUES}"   # 기대: "47 "

# 단계 C: Settings API 변경 (사용자 승인 후)
gh api -X PUT repos/jungsoobin96/board-app/actions/permissions/workflow \
  -F default_workflow_permissions=write \
  -F can_approve_pull_request_reviews=false
gh api repos/jungsoobin96/board-app/actions/permissions/workflow \
  --jq '.default_workflow_permissions'   # 기대: "write"

# 단계 D: PR push + open + trigger 관찰 (H4 가설 최종 검증)
git push -u origin bug/sync-issue-labels-workflow-issue-47
gh pr create --base main --head bug/sync-issue-labels-workflow-issue-47 \
  --title "bug(infra): sync-issue-labels.yml workflow 0 runs (#47)" \
  --body "..."   # /qa-test --ai 단계 자동
sleep 30  # workflow 트리거 대기
gh api repos/jungsoobin96/board-app/actions/workflows/sync-issue-labels.yml/runs \
  --jq '.total_count'   # 기대: ≥ 1

# 단계 E: 머지 후 검증 (D-06 2단)
# 사람이 PR 머지 → 자동 트리거 +1 → runs ≥ 2, 이슈 #47 라벨 자동 정리 + close
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요: no** — 본 PR은 ADR-0029의 기존 정책 *복구*이지 신규 정책 아님. 단, Sprint 5 retro에서 다음 두 후속 결정 검토 후보:
  - (a) install.sh에 `gh api -X PUT .../actions/permissions/workflow -F default_workflow_permissions=write` 자동화 추가 — agent-toolkit upstream ADR 후보
  - (b) `manual-sync-guide.md` §"agent-toolkit 도입 후 수동 보강" 절에 workflow permission 변경 단계 추가 — 별도 이슈
- **사용자 승인 필요**: Settings API 호출 (P8 implement 단계 C 직전, contract §3 호출자 표에 명시)
- **신규 워크플로 도입 미고려**: ADR-0046 §2.5 `pr-body-checkbox-gate.yml`은 별도 이슈로 분리 (본 PR scope 밖, 비목표 §6에 명시)
- **결정**: 본 PR은 코드 변경 + 운영 정책 변경의 *복합* 이슈. PR body `Manual verification` 절에 settings 변경 명령 + 결과를 사람이 검증 가능한 형태로 명시
