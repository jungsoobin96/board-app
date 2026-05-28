---
doc_type: feature-brief
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

# mod-title-lint-policy-fix — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-28 | jungsoobin96 | 초안 — title-lint 정규식 ↔ branch prefix ↔ commit message type 3 어휘 집합 정합 (이슈 #56) |

## 1. 한 줄 의도

`.github/workflows/issue-pr-title-lint.yml`의 정규식을 `branch-strategy.md §3.2` commit message type 목록(`feat|fix|mod|docs|chore|refactor|test|perf|style`)과 정합하도록 확장하고, branch prefix(`feat|mod|bug|design`) ≠ commit/PR title type(변경 분류)이 의도적 분리임을 ADR로 명문화한다.

## 2. 사용자 가치

- **개발자**: PR title 작성 시 정책 어휘 mismatched로 lint FAIL되는 마찰 제거. `mod(infra):`·`mod(plan):` 등 §3.2 정합 type 자유 사용. branch prefix `bug/`·`design/` 사용 시 PR title은 conventional commits 표준 type(`fix(scope):`·`feat(scope):`) 사용으로 commit history 가독성 유지
- **운영(유지보수)**: 3 어휘 집합(branch prefix / commit message / title-lint regex)의 관계가 ADR로 명문화되어 후속 변경 시 정합 검증 가능. 이전 PR(#51 PR #53 `bug(infra):` → `fix(infra):`, #52 PR #55 `mod(docs):` → `docs(plan):`) 정정 패턴이 더 이상 반복되지 않음
- **본 PR 자기 검증**: 본 PR title `mod(infra): ...`가 신규 정규식에 정합하므로 자기 자신이 lint success 회복의 증거

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| `.github/workflows/issue-pr-title-lint.yml` 정규식 | `^(feat\|fix\|chore\|docs\|test\|refactor)\([a-z][a-z0-9,_-]*\): .+$` (6 type) | `^(feat\|fix\|mod\|docs\|chore\|refactor\|test\|perf\|style)\([a-z][a-z0-9,_-]*\): .+$` (9 type, §3.2 commit message 컨벤션과 1:1) |
| branch prefix 정책 (`branch-strategy.md §2.1`) | `feat / mod / bug / design` (작업 분류) | **변경 없음** (작업 분류 의미 유지) |
| commit message type (`§3.2`) | `feat / fix / mod / docs / chore / refactor / test / perf / style` (9 type) | **변경 없음** (변경 분류 의미 유지) |
| 3 어휘 집합 관계 명시 | 암묵적 (각 정책 파일에 흩어짐) | **ADR-0003 신설** — 의도적 분리 명문화 (작업 분류 ≠ 변경 분류) |
| 본 PR title `mod(infra): ...` | lint FAIL (현 정규식에서 `mod` 미허용) | lint PASS (자기 검증) |
| 이슈 #56 본문 옵션 결정 | 미결정 (A/B/C 후보 나열) | **변형 옵션 D** 선택 — Option A 부분 채택 + Option C ADR 명문화. branch prefix는 변경 안 함 |

## 4. 모드 자동 감지 결과

**mode=modify** (ADR-0032 자동 결정).

- 이슈 title prefix: `mod(infra):` → modify 시그널 1건
- 이슈 본문 키워드: "정책 수정", "변경", "정규식 변경", "branch prefix 정책 수정" → modify 시그널 다수
- `type:bug` 라벨: 없음 → bug 시그널 0건
- UI/디자인 키워드: 없음 → design 시그널 0건
- 부정 시그널 충돌: 0건 → 자동 결정 PASS

**modify 강제 단계** (CLAUDE.md / flow-feature.md 정합):
- P3 change-contract: Before/After 두 컬럼 강조 (3 어휘 집합 mapping 표)
- P7 risk-check: workflow 정규식 변경의 회귀 위험 (기존 정합 PR title 일괄 영향)
- P13 docs-update: **ADR-0003 신설 필수** (3 어휘 집합 분리 결정)

## 5. 영향 범위

**직접 변경**:
- `.github/workflows/issue-pr-title-lint.yml` (정규식 1줄 — line 29)
- `docs/planning/adr/0003-title-lint-and-branch-prefix-separation.md` (신설, mode=modify ADR 의무)
- `docs/planning/adr/INDEX.md` (ADR-0003 entry 추가)
- `docs/planning/CHANGELOG.md` (§Current Status + 변경 이력 표 + History 절)

**참조 정합 검증 (변경 없음, 인용만)**:
- `docs/planning/policies/branch-strategy.md` §2.1 (branch prefix 유지) + §3.2 (commit message type — 본 PR로 workflow regex와 정합 달성)
- `docs/planning/adr/0002-mod-r-ops-r-id-taxonomy.md` (R-OPS-WORKFLOW 정본, 본 결함이 본 카테고리에 해당)

**테스트 자산**:
- 본 PR title `mod(infra):` 자체가 workflow re-run 시 lint success 회복 → 자기 검증 정본 (별도 unit test 신설 N/A)
- 후속 PR (#56 머지 후) 자연 회귀 관찰: 후속 PR title `mod(...)`·`perf(...)`·`style(...)` 사용 시 lint PASS

**영향 없음**:
- frontend / backend / shared 코드: 0줄 변경
- DB / migrations / .env: 0 변경
- 부팅 자산: 0 변경 (workflow YAML은 부팅 자산 아님)

## 6. 비목표

- **branch prefix 정책 변경 안 함**: `branch-strategy.md §2.1` `feat/mod/bug/design`은 *작업 분류* 의미로 의도 유지. PR title type(*변경 분류*)과 분리 — ADR-0003에서 명문화
- **기존 23개 WBS 이슈 title 일괄 rename 안 함**: 본 PR로 정규식 확장 시 기존 `bug(infra):`·`mod(plan):`·`design(...):` title이 자동 lint PASS. 별도 일괄 작업 불필요
- **conventional commits 1.0 표준 100% 정합 안 함**: `mod` type은 conventional commits 비표준이나, `branch-strategy.md §3.2`가 이미 9 type 변형을 채택하고 있어 본 PR은 그 정합을 lint에 반영만 함. 표준 회귀(예: `mod` → `refactor`로 일괄 정정)는 별도 결정 — 본 PR scope 외
- **workflow 파일의 코멘트 / MSG 본문 갱신은 최소**: 정규식 line만 수정. line 1 헤더 코멘트는 동기 갱신, line 52 MSG 본문(`type: feat·fix·chore·docs·test·refactor`)도 9 type으로 동기 — 그러나 본문 부수 갱신은 cosmetic

## 7. Open Questions

- (해소) ~~Option A vs B vs C 선택~~: **변형 옵션 D** (= A 부분 + C ADR 명문화) 선택. 본 brief §3 표에 결정 반영. 이슈 #56 본문 옵션 A·B·C는 ADR-0003 §Alternatives에서 채택 사유 정리
- (해소) ~~기존 23 이슈 title 일괄 정정 필요?~~: **불필요** (정규식 확장으로 자동 정합). brief §6 비목표 명시
- (open) workflow MSG 본문 line 52~54 갱신 폭: 최소 정합(`feat·fix·mod·chore·docs·test·refactor·perf·style`)로 동기. 별 question 없음 — implement 단계에서 일괄 동기 처리
