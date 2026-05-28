---
doc_type: feature-contract
version: v0.1 (Draft)
status: Draft
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-OPS-WORKFLOW]
  F-ID: []
  supersedes: null
---

# mod-title-lint-policy-fix — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — workflow regex 9 type 확장 + ADR-0003 신설 (mode=modify, 이슈 #56) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | 04-srs | R-OPS-WORKFLOW |
| F-ID (기능) | 05-prd | (none) |
| 영향 모듈 | 08-lld-module-spec | (none) — 본 PR은 workflow YAML + ADR만 변경, 코드 모듈 0건 |
| 영향 엔드포인트 | 09-lld-api-spec | (none) |
| 적용 컨벤션 절 | 11-coding-conventions | (none) — 본 PR은 운영 정책(ADR + workflow YAML), 코딩 컨벤션 적용 0건 |

## 1. 변경 의도

`.github/workflows/issue-pr-title-lint.yml` 정규식을 `branch-strategy.md §3.2` commit message type 목록(9 type)과 정합하도록 확장하여 3 어휘 집합(branch prefix / commit message type / title-lint regex)의 *상호 정합*을 회복한다. branch prefix(`feat/mod/bug/design`, *작업 분류*) ≠ commit/PR title type(`feat/fix/mod/docs/chore/refactor/test/perf/style`, *변경 분류*)이 의도적 분리임을 신설 ADR-0003으로 명문화한다.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `.github/workflows/issue-pr-title-lint.yml` line 29 정규식 | `^(feat\|fix\|chore\|docs\|test\|refactor)\([a-z][a-z0-9,_-]*\): .+$` (6 type) | `^(feat\|fix\|mod\|docs\|chore\|refactor\|test\|perf\|style)\([a-z][a-z0-9,_-]*\): .+$` (9 type, §3.2 정합) |
| `.github/workflows/issue-pr-title-lint.yml` line 2 헤더 코멘트 (정규식 인용) | `# 정규식: ^(feat\|fix\|chore\|docs\|test\|refactor)\(...\): .+$` | `# 정규식: ^(feat\|fix\|mod\|docs\|chore\|refactor\|test\|perf\|style)\(...\): .+$` (동기) |
| `.github/workflows/issue-pr-title-lint.yml` line 52 MSG type 목록 (lint FAIL 코멘트 본문) | `- **type**: \`feat\` · \`fix\` · \`chore\` · \`docs\` · \`test\` · \`refactor\`` | `- **type**: \`feat\` · \`fix\` · \`mod\` · \`docs\` · \`chore\` · \`refactor\` · \`test\` · \`perf\` · \`style\`` (동기) |
| `docs/planning/adr/0003-*.md` | 부재 | **신설** — "Title-lint regex와 branch prefix는 의도적으로 분리한다" 결정 + 3 어휘 집합 mapping 표 + Option A/B/C/D 비교 |
| `docs/planning/adr/INDEX.md` | ADR 0001/0002만 entry | ADR-0003 entry 추가 (`0003-title-lint-and-branch-prefix-separation.md` 한 줄) |
| `branch-strategy.md §2.1` branch prefix | `feat / mod / bug / design` | **변경 없음** (작업 분류 의미 유지, ADR-0003이 분리 정당성 인용) |
| `branch-strategy.md §3.2` commit message type | `feat / fix / mod / docs / chore / refactor / test / perf / style` (9 type) | **변경 없음** (변경 분류 의미 유지, 본 PR로 workflow regex와 1:1 정합 달성) |
| 본 PR title `mod(infra): ...` lint 결과 | FAIL (현 정규식에 `mod` 없음) | PASS (자기 검증) — workflow re-run으로 lint success 확인 |
| 후속 PR `mod(...)`·`perf(...)`·`style(...)` title | lint FAIL 위험 (현 정규식 미정합) | lint PASS (자연 회귀로 검증) |
| 후속 PR `bug/`·`design/` branch prefix + `fix(...)`·`feat(...)` title | branch prefix와 title type mismatched로 사용자 혼란 (#51 PR #53, #52 PR #55 패턴) | ADR-0003 §Decision §Rationale에 명문화로 혼란 해소 (branch=작업 분류, title=변경 분류 분리 정당화) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `.github/workflows/issue-pr-title-lint.yml` line 29 (정규식) | 정규식 6 type → 9 type 확장 (`mod`·`perf`·`style` 추가) | 본 PR에서 1 line edit |
| `.github/workflows/issue-pr-title-lint.yml` line 2 (헤더 코멘트) | 정규식 인용 동기 | 본 PR에서 동기 edit |
| `.github/workflows/issue-pr-title-lint.yml` line 52 (MSG type 목록) | lint FAIL 시 사용자 안내 코멘트의 type 목록 동기 | 본 PR에서 동기 edit (cosmetic — 사용자 가독성) |
| `docs/planning/policies/branch-strategy.md` §3.2 commit message type | 인용 (변경 없음) | ADR-0003 §Context에서 본 §3.2를 본 PR 정합 정본으로 인용 |
| `docs/planning/policies/branch-strategy.md` §2.1 branch prefix | 인용 (변경 없음) | ADR-0003 §Decision에서 본 §2.1을 작업 분류 의미로 인용 |
| `docs/planning/adr/0002-mod-r-ops-r-id-taxonomy.md` (R-OPS-WORKFLOW 정본) | 인용 (변경 없음) | 본 contract §0 R-ID 매핑 |
| 후속 PR 작성자 (전역) | workflow regex 확장 후 자유롭게 9 type 사용 가능 | 별도 조치 N/A — 정책 인지는 ADR-0003 + workflow MSG 본문 갱신으로 흡수 |
| WBS 23개 기존 이슈 (`bug(infra):`·`mod(plan):`·`design(...):` title) | 본 PR 머지 시점부터 lint 자동 PASS | 별도 일괄 정정 작업 N/A (brief §6 비목표 명시) |
| GitHub Actions runner 환경 (ubuntu-latest, `grep -E`) | POSIX ERE 정규식 변경 — POSIX ERE 호환 알파벳·`|`·`()` 사용으로 호환성 영향 0건 | 별도 검증 N/A |

## 4. Backward Compatibility

- **Breaking**: **no**
  - 정규식 *확장* (superset)이므로 기존에 PASS하던 6 type(`feat/fix/chore/docs/test/refactor`)은 모두 그대로 PASS 유지
  - 신규 3 type(`mod/perf/style`)이 추가로 허용될 뿐, 기존 패턴 거부 0건
- **마이그레이션 필요**: **no**
  - 기존 PR title·이슈 title 영향 0건 (모두 superset에 흡수)
  - 기존 23 WBS 이슈 title 중 `bug(...)`·`design(...)` 등은 본 PR 머지 *전*에도 정규식 미정합 상태 — 본 PR 머지 *후*에도 여전히 미정합 (∵ `bug/design`은 §3.2 commit message type 자체에 없음). 그러나 본 PR scope는 §3.2 정합만 — `bug/design` PR title은 별도 *수동 정정* (Option B의 부분 채택 — 후속 PR마다 사용자가 fix/feat/style 등으로 자연 선택). ADR-0003 §Consequences에서 명시
- **deprecation 일정**: N/A (제거된 type 없음)

## 5. Rollback 전략

- **revert 가능**: **yes**
- **rollback 절차** (3단계 이내):
  1. `git revert <merge-commit-sha>` — 본 PR squash 머지 commit 1개 revert
  2. workflow YAML 정규식이 6 type으로 복원, ADR-0003 파일 제거, ADR INDEX entry 1줄 제거
  3. revert PR 생성 + 머지 → workflow regex 회귀
- **데이터 손상 위험**: **없음**
  - workflow YAML만 변경, 코드/DB/migrations 0건 영향
  - revert 후에도 GitHub Actions runner는 다음 PR 트리거 시점에 새 정규식으로 즉시 검증 시작 (workflow 자체 stateless)
- **revert 시 부수 영향**:
  - revert 직후 `mod(...)`·`perf(...)`·`style(...)` title PR이 다시 lint FAIL 시작 — 사용자가 title 일괄 정정 필요
  - ADR-0003 결정이 retraction된 사유 인용을 위한 후속 ADR(예: ADR-0004 revert) 작성 필요 — 정책 history 추적 정합

## 6. 비목표

- **branch prefix 정책 변경 안 함**: `branch-strategy.md §2.1` `feat/mod/bug/design`은 *작업 분류* 의미로 의도 유지. ADR-0003이 분리 정당성 명문화
- **기존 23개 WBS 이슈 title 일괄 rename 안 함**: 본 PR로 정규식 확장 시 `mod(...)`·`perf(...)`·`style(...)` title은 자동 lint PASS. `bug(...)`·`design(...)` title은 별도 후속 PR마다 사용자 정정 (Option B 부분 채택)
- **conventional commits 1.0 표준 100% 정합 안 함**: `mod` type은 conventional commits 비표준 (refactor가 표준 대안). 그러나 `branch-strategy.md §3.2`가 이미 9 type 변형 채택 — 본 PR은 그 정합을 lint에 반영만 함. 표준 회귀(예: `mod` → `refactor` 일괄 정정)는 별도 결정
- **`bug` / `design` type을 workflow regex에 추가 안 함**: 본 PR 옵션 D 결정의 핵심 — branch prefix(`bug/`·`design/`)와 PR title type(`fix(...)`·`feat(...)`)의 분리 유지. `bug`/`design`을 title type으로 인정하면 §3.2 commit message 컨벤션과 불일치 발생
- **workflow re-run 자동화 안 함**: 본 PR 머지 시점에 *과거 OPEN 이슈*의 lint 결과를 자동 re-run하지 않음. 후속 PR 작성/편집 시 자동 트리거 (workflow `on: issues.edited / pull_request.edited`)에 위임
