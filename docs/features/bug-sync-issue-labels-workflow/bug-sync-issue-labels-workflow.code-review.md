---
doc_type: feature-code-review
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

# sync-issue-labels.yml workflow 0 runs — Code Review

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 -- P9 code-review 8단계 점검 완료 (Issue #47) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. Verdict

- verdict: **PASS**
- reviewer: jungsoobin96@users.noreply.github.com
- review_at: 2026-05-27
- MAJOR: 0
- MINOR: 1 (R-OPS-AUTO-LABEL ad-hoc R-ID 후속 정리 필요 -- doc-only, 머지 비차단)

근거: workflow YAML 변경은 contract Before/After 6행과 정합. concurrency group이 PR 번호별 namespace로 올바르게 구성됨. 보안 영향(F-RISK-01) 분석 충분. 시크릿 노출 0건. scope creep 0건. 커밋 메시지에 (#47) 포함 + body에 근본 원인/Settings 분리 명시. docs 6 산출 상호 일관.

## 1. 컨트랙트 충실도

### 1.1 workflow YAML 변경 정합

| 항목 | 기대 (contract) | 실제 (diff) | 판정 |
|---|---|---|---|
| `on:` 트리거 | `pull_request: [opened, ready_for_review, closed]` 유지 | 변경 없음 -- 동일 3 types | OK |
| `permissions:` | `issues: write / pull-requests: read` 유지 | 변경 없음 -- 동일 | OK |
| `concurrency:` 신규 | `group: sync-issue-labels-${{ github.event.pull_request.number }}` + `cancel-in-progress: true` | diff +3행 정합 | OK |
| 주석 보강 | Issue #47 + 근본 원인(default_workflow_permissions=read) 명시 | diff +7행 -- Sprint 5 P0, H4 가설, Settings API fix, docs 참조 모두 포함 | OK |
| contract §2 Before/After | 6행 정량 변경 | YAML diff가 concurrency/주석만 추가. runs 카운트 변화는 Settings 변경 후 검증 대상 | OK |
| contract §6 비목표 | issue-pr-title-lint 미수정 / manual-sync-guide 미수정 등 5건 | `git diff --stat` 확인 -- 해당 파일 0건 변경 | OK |

### 1.2 커밋 시퀀스 정합

| plan 커밋 | 실제 git log | 판정 |
|---|---|---|
| #1: `fix(infra): workflow YAML 방어 보강 (concurrency + 본 이슈 참조 주석) (#47)` | `3b8702f` -- 메시지 동일 | OK |
| #2: Settings API 호출 (PR diff 외) | PR body Manual verification에 명시 예정 -- commit 아닌 API 호출이므로 git log 부재 정상 | OK |

### 1.3 concurrency 의도 정합

contract §2 After에서 "중복 트리거 시 직전 실행 취소"를 명시. workflow YAML의 `cancel-in-progress: true`가 이를 구현. risk F-RISK-03 완화 전략(PR 번호별 namespace로 다른 PR과 충돌 방지)과 YAML `group: sync-issue-labels-${{ github.event.pull_request.number }}`가 정합.

## 2. 테스트 커버리지

| 항목 | 판정 | 근거 |
|---|---|---|
| 단위 테스트 | N/A | workflow YAML은 GitHub Actions 환경 전용. acceptance §2 DoD에 N/A 명시. plan §4에 manual reproduction(step bash cherry-pick) 제시 |
| Manual reproduction | plan §4 단계 B 제시 | `grep -oiE` 추출 로직 cherry-pick 검증 -- workflow YAML 변경은 concurrency/주석만이라 기존 step 동작 무변경 |
| 양축 검증 (ADR-0047) | plan §4에 5단계 명시 | YAML parse(yq) + manual reproduction + API PUT + PR open trigger + 머지 후 runs >= 2 |
| 회귀 관찰 | acceptance §4에 3건 명시 | Sprint 5 #48 자연 관찰 + issue-pr-title-lint 부수 회복 + Settings rollback 방지 |

YAML 변경이 concurrency 추가 + 주석만이므로 기존 step의 동작 검증은 Settings 변경 후 PR trigger 관찰로 커버. 적절한 범위.

## 3. 보안 / 시크릿

| 점검 항목 | 결과 |
|---|---|
| diff 내 API key / secret / password / credential 문자열 | 0건 (GITHUB_TOKEN 참조는 `${{ secrets.GITHUB_TOKEN }}` 기존 패턴 유지) |
| 새 secrets 참조 추가 | 0건 -- 기존 `secrets.GITHUB_TOKEN` 외 추가 없음 |
| .env / credential 파일 변경 | 0건 |
| GITHUB_TOKEN write 확대 보안 영향 | risk F-RISK-01에서 분석 완료: (1) `can_approve_pull_request_reviews: false` 유지로 PR 승인 불가, (2) 개인 repo + 단일 trunk 환경에서 제3자 PR 악용 가능성 매우 낮음, (3) workflow YAML의 `permissions:` 명시가 그 workflow에만 적용 -- 충분한 분석 |
| workflow에서 외부 action 사용 | 0건 -- 모든 step이 inline `run:` (supply chain 공격 면 없음) |

보안 관점 이슈 없음.

## 4. 가독성 / 단순성

| 항목 | 판정 | 비고 |
|---|---|---|
| 주석 분량 | 적절 | 7행 주석 추가 -- 근본 원인 + fix 경로 + docs 참조. 향후 유지보수자에게 유용 |
| concurrency block | 명확 | 2행 + 인라인 주석 1행. group 이름이 workflow 이름 + PR 번호로 자명 |
| 기존 step 무변경 | 좋음 | scope 최소화. 읽기 부하 증가 없음 |
| docs 6 산출 간 cross-reference | 일관 | investigation H4 -> contract §1/§2 -> plan §1 -> acceptance AC-01/02/03 -> risk F-RISK-01/02/03 -> eng-review §1~§6 체인 추적 가능 |

## 5. 발견 사항 (3축 OX 분류)

| 발견 | in_scope | blocks_merge | same_area | 처리 |
|---|---|---|---|---|
| CR-01: R-OPS-AUTO-LABEL ad-hoc R-ID가 04-srs에 부재. acceptance frontmatter `related.R-ID: [R-OPS-AUTO-LABEL]`이 정본 미등록 상태 | No | No | No | A.Derived -- MINOR. eng-review §6.4 Q1/Q2에서 이미 "Sprint 5 후속 이슈 후보"로 분류. 본 PR 머지 차단 불필요. 후속 이슈에서 04-srs §비기능에 R-OPS-* prefix 신설 |
| CR-02: plan §1 커밋 2(Settings API)가 git log에 없음 -- PR diff 외 운영 변경 | Yes | No | Yes | A.InScope -- 정상. plan §1 "별도 step" + plan §2 DAG에서 "diff 외" 명시. commit이 아닌 API 호출이므로 git log 부재 의도적. PR body Manual verification에 증적 명시 예정 |
| CR-03: acceptance AC-03(concurrency 동작 검증)이 수동 확인 + 사후 관찰 의존 | Yes | No | Yes | A.InScope -- 정상. AC-03 "Sprint 5 #48 reopen 시 자연 관찰"은 인위적 재현 비용 대비 합리적. race condition 발생 시 P1 follow-up 등록 명시 |
| CR-04: issue-pr-title-lint.yml 부수 회복이 본 PR scope 밖이나 acceptance §4에서 관찰 예정 | No | No | No | A.Derived -- eng-review §6.4 Q3에서 이미 "runs >= 1이면 skip, 0이면 등록" 분류 |
| CR-05: workflow YAML에 `branches:` 필터 미명시 (모든 base branch 대상) | Yes | No | Yes | A.InScope -- 본 repo는 단일 trunk(main) 운영. `branches: [main]` 명시는 명확성 개선이나 현재 동작에 영향 없음. MINOR 아님 (개선 후보) |

## 6. NEEDS-WORK 항목

(없음 -- verdict=PASS. MAJOR 0개, MINOR 1개(CR-01, doc-only 후속 이슈).)

MINOR 1건 상세:
- **CR-01**: R-OPS-AUTO-LABEL이 04-srs에 등록되지 않은 ad-hoc R-ID. acceptance.md의 `related.R-ID` frontmatter에서 참조하나 정본(04-srs)에 부재. 머지 차단 사유 아님 -- eng-review §6.4에서 이미 후속 이슈로 분류. Sprint 5 후속 PR에서 04-srs §비기능에 R-OPS-* prefix 신설 시 해소.
