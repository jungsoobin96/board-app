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

# GitHub Actions workflow 전역 0 runs (Issue 51) — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 1 커밋(8 docs + screenshots) + push 직후 trigger 관찰 양축 검증 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `bug(infra): workflow 전역 0 runs — Actions dispatcher 첫 활성화 cycle 진단 (#51)` | `docs/features/bug-workflow-global-zero-runs/{investigation,contract,plan,eng-review,acceptance,risk,code-review,ai-qa-report}.md` (8건) + `screenshots/{settings-actions-general,actions-page}.png` (2건) | manual reproduction (단계 A·B) + 본 PR push 직후 trigger 관찰 (단계 C) | Low — docs/screenshots 추가만, 기존 파일 무변경 |

> 코드 변경 0건. dispatcher 활성화는 사용자가 P3a 단계에서 Actions 탭 방문으로 이미 완료. PR push가 활성화 이후 첫 PR이므로 trigger 자연 발생으로 H6 확정.

## 2. 의존성 그래프

```
[P3a Investigation]  H4 기각 + H6 채택 (UI 스크린샷 협업)
   │                                  │
   │                                  ▼
   │                          사용자가 Actions 탭 방문
   │                          (dispatcher 활성화 — "Actions Enabled." 배너 노출)
   │
   ▼
[Contract] §0 모두 (none — 운영 인프라) + Before/After 정량 측정 가능
   │
   ▼
[Plan] 본 문서 (1 커밋, 코드 변경 0건)
   │
   ▼
[Acceptance + Risk + Eng-review] 검증/등급/PASS 게이트
   │
   ▼
[P8 implement] git add docs/ + screenshots/ → 1 commit → push -u
   │
   ▼
[P9 reviewer] code-review.md verdict
   │
   ▼
[P10 qa-test --ai] 6축 게이트 + ai-qa-report.md → PR open
   │                                                    │
   │                                                    ▼
   │                            **검증 임계**: PR opened 이벤트 trigger 발생
   │                            sleep 30 → gh api .../runs --jq '.total_count' ≥ 1
   │                                                    │
   │                            ├─ ≥ 1 → H6 확정 → PR 본문 검증 ✅ → 머지로 진행
   │                            └─ 0   → H6 기각 → BLOCKED → H8/H10 재진단
   │                                                    │
   └────────────────────────────────────────────────────┘
                     │
                     ▼
[P14 human gate] 사용자 Manual ✅ + DoD ✅ + Approve + 머지
                     │
                     ▼
[Post-merge 회귀] merged 이벤트 trigger 추가 +1 → 이슈 #51 자동 close + 라벨 일괄 제거
```

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 1 (docs + screenshots) | manual reproduction (act 또는 GitHub UI 관찰) | (a) `git push -u origin bug/workflow-global-zero-runs-issue-51` 후 `gh pr create` 직후 `sleep 30 && gh api repos/.../actions/workflows/sync-issue-labels.yml/runs --jq '.total_count'` ≥ 1, (b) `issue-pr-title-lint.yml` trigger도 +1 (PR title 정규식 검증), (c) PR merged 이벤트로 sync-issue-labels.yml total ≥ 2 + 이슈 #51 close + status:* 일괄 제거 |
| 통합 회귀 (Sprint 5 #52 or #48) | Sprint 5 다음 PR에서 자연 관찰 | 본 PR 머지 후 다음 PR open 시 라벨 자동 전이 + title-lint 모두 정상 작동 |

## 4. 빌드·실행 검증 단계

```bash
# 단계 A: schema validate (전체 8 docs)
for f in docs/features/bug-workflow-global-zero-runs/*.md; do
  bash .claude/scripts/validate-doc.sh "$f" || echo "FAIL: $f"
done
# 기대: 모두 OK

# 단계 B: workflow YAML 무변경 검증 (본 PR이 workflow file에 영향 없음 확인)
git diff main...HEAD --name-only | grep -E '^\.github/workflows/' && echo "FAIL: workflow 변경 감지" || echo "PASS: workflow 무변경"
# 기대: PASS

# 단계 C: PR push + trigger 자연 발생 관찰 (H6 검증)
git push -u origin bug/workflow-global-zero-runs-issue-51
gh pr create --base main --head bug/workflow-global-zero-runs-issue-51 \
  --title "bug(infra): workflow 전역 0 runs — Actions dispatcher 첫 활성화 cycle 진단 (#51)" \
  --body "$(cat docs/features/bug-workflow-global-zero-runs/bug-workflow-global-zero-runs.ai-qa-report.md)..."

# PR open 후 30초 대기 + trigger 관찰
sleep 30
SYNC=$(gh api 'repos/jungsoobin96/board-app/actions/workflows/sync-issue-labels.yml/runs?per_page=1' --jq '.total_count')
LINT=$(gh api 'repos/jungsoobin96/board-app/actions/workflows/issue-pr-title-lint.yml/runs?per_page=1' --jq '.total_count')
echo "sync runs: $SYNC, lint runs: $LINT"
# 기대: SYNC ≥ 1, LINT ≥ 1
# 0이면 → H6 기각 → BLOCKED → H8/H10 재진단

# 단계 D: 양축 검증 (ADR-0047) — manual reproduction (act 미설치 환경)
# sync-issue-labels.yml step "Extract linked issues" 시뮬레이션:
PR_BODY="Closes #51"
ISSUES=$(printf '%s' "$PR_BODY" \
  | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' \
  | grep -oE '#[0-9]+' \
  | tr -d '#' \
  | sort -u | tr '\n' ' ')
echo "Extracted: ${ISSUES}"   # 기대: "51 "

# 단계 E: 머지 후 추가 trigger (사람 단계)
# 사람이 PR 머지 → closed && merged==true 이벤트
# → sync-issue-labels.yml +1, 이슈 #51 자동 close + 라벨 일괄 제거
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요: no** — 본 PR은 코드 변경 0건 진단/관찰 PR. ADR-0029의 자동화 회복 단계로 위치. 단, Sprint 5 retro에서 다음 후속 결정 검토 후보:
  - (a) **ADR-신규 후보**: "Actions dispatcher 첫 활성화 cycle은 GitHub 정책 한계" 명문화 + manual-sync-guide 보강 정책 — Sprint 5 retro 결정
  - (b) `manual-sync-guide.md` §"agent-toolkit 도입 후 수동 보강"에 "**필수**: Actions 탭(`https://github.com/<owner>/<repo>/actions`) owner 첫 방문" 단계 추가 — agent-toolkit upstream 별도 이슈
  - (c) install.sh setup 완료 시 Actions 탭 URL 자동 출력 + `gh browse <owner>/<repo>/actions` 안내 — Sprint 6+ 후속
- **사용자 승인 필요 X**: 본 PR은 코드 변경 0건이므로 별도 명시 승인 불필요. 단, P14 휴먼 게이트에서 사용자 Manual ✅ + DoD ✅ + Approve+머지 3단 표준 진행
- **결정**: 본 PR push 직후 trigger 0건이 관찰되면 **BLOCKED** — H6 기각 + H8(plan billing) 또는 H10(account 보안) 재진단 + 사용자 추가 협업 요청. 추측 기반 fix 금지
