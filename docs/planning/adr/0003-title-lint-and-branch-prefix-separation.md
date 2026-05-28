---
doc_type: adr
version: v1.0
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: C
related:
  R-ID: [R-OPS-WORKFLOW]
  F-ID: []
  supersedes: null
---

# ADR 0003 — Title-lint regex 9 type 확장 + branch prefix와 PR title type의 의도적 분리

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v1.0 | 2026-05-28 | jungsoobin96 | 초안 + 채택 — `.github/workflows/issue-pr-title-lint.yml` 정규식을 `branch-strategy.md §3.2` 9 type과 정합. branch prefix(`feat/mod/bug/design`, 작업 분류) ≠ PR title type(`feat/fix/mod/docs/chore/refactor/test/perf/style`, 변경 분류) 의도적 분리 명문화 (이슈 #56). |

## 1. 컨텍스트

본 프로젝트(board-app, agent-toolkit 도입)는 3개의 type 어휘 집합을 사용한다:

| 집합 | 정본 위치 | 어휘 | 의미 |
|---|---|---|---|
| **A. branch prefix** | `policies/branch-strategy.md §2.1` (ADR-0044) | `feat / mod / bug / design` (4종) | *작업 분류* — 이슈가 어떤 종류의 작업인가 (사람 운영용) |
| **B. commit message type** | `policies/branch-strategy.md §3.2` (ADR-0021) | `feat / fix / mod / docs / chore / refactor / test / perf / style` (9종) | *변경 분류* — 커밋이 무엇을 변경하는가 (Conventional Commits 변형) |
| **C. title-lint regex** | `.github/workflows/issue-pr-title-lint.yml` line 29 (ADR-0021) | `feat / fix / chore / docs / test / refactor` (6종, 본 ADR 채택 *전*) | *변경 분류 강제* — 이슈/PR title이 §B 컨벤션 정합인지 자동 검증 |

**불일치 패턴 (본 ADR 채택 이전)**:
- §C가 §B의 부분집합(6종 ⊂ 9종) — `mod / perf / style` 누락
- §A·§C 어휘 차이: §A의 `bug`·`design`은 §C 어휘에 없음 (의도 vs 실수가 명확하지 않음)

**발견 경로**:
- PR #53 (이슈 #51): branch `bug/h6-...` + title `bug(infra): ...` 작성 → §C lint FAIL → `fix(infra): ...`로 정정 후 머지
- PR #55 (이슈 #52): title `mod(docs): ...` 작성 → §C lint FAIL 예상 → `docs(plan): ...`로 정정 후 머지
- 본 패턴 재발 위험 + WBS 23 이슈 title 중 `bug(...)`·`mod(...)`·`design(...)` 다수 — 이슈 #56로 등록

## 2. 결정

**§C title-lint regex를 §B commit message type 목록과 1:1 정합하도록 확장한다.** §A는 변경하지 않는다.

| 항목 | 결정 |
|---|---|
| §C 정규식 (line 29) | `^(feat\|fix\|mod\|docs\|chore\|refactor\|test\|perf\|style)\([a-z][a-z0-9,_-]*\): .+$` — 9 type (§B와 1:1) |
| §A branch prefix | **변경 없음** — `feat / mod / bug / design` 유지 (작업 분류 의미 보존) |
| `bug(...)` / `design(...)` PR title | **허용하지 않음** — branch는 `bug/...`·`design/...`이라도 PR title은 §B 9 type 중 하나(`fix(...)`·`feat(...)`·`style(...)`) 사용 |
| §B commit message type | **변경 없음** — §3.2 9 type 유지 |
| workflow MSG 본문 (line 52) | 9 type 목록으로 동기 갱신 — 사용자가 lint FAIL 시 정확한 type 안내 |

**핵심 정당화 (Rationale)**:
- §A와 §B·§C는 *목적이 다르다*. §A는 *작업 단위* 분류(사람이 어떤 종류의 작업을 하고 있는가), §B·§C는 *변경 단위* 분류(이 커밋이 무엇을 어떻게 변경하는가, Conventional Commits 표준)
- `bug/` branch에서 작업한다고 모든 commit이 `bug(...)`가 되는 것은 아니다. 예: `bug/login-redirect-issue-58` branch에서 (a) login 모듈 fix(`fix(login):`), (b) 회귀 test 추가(`test(login):`), (c) 관련 docs 갱신(`docs(login):`) 등 commit type이 다양
- §A·§B 분리는 한 *작업*(이슈) 안에서 여러 *변경 type*이 발생하는 현실 반영
- §A가 §B와 정확히 일치할 필요 없음 — *작업 분류 어휘*는 사용자 운영 편의(`bug/`·`design/`이 보기 명확)에 따라 자유 선택

### 채택 mapping 표 (사용자 가이드)

| branch prefix (§A) | 권장 PR title type (§B·§C) |
|---|---|
| `feat/` | `feat(...)` 주로, scope이 docs면 `docs(...)`도 가능 |
| `mod/` | `mod(...)` 또는 `refactor(...)` 또는 `perf(...)` (변경 성격에 따라) |
| `bug/` | `fix(...)` 주로 (= bug fix). 회귀 test 추가 우세면 `test(...)`도 가능 |
| `design/` | `style(...)` 주로 (= 시각 변경). 컴포넌트 신설 우세면 `feat(...)` |

본 mapping은 *강제*가 아닌 *권장* — 사용자가 변경 성격을 가장 잘 판단. workflow §C는 §B 9 type 중 하나면 PASS.

## 3. 검토된 대안

| 옵션 | 설명 | 채택 여부 | 사유 |
|---|---|---|---|
| **A. §C에 `mod\|bug\|design` 단순 추가** | 정규식을 `feat\|fix\|chore\|docs\|test\|refactor\|mod\|bug\|design`로 9종 확장 | ❌ | `bug`·`design`은 §B(commit message 컨벤션)에 없음. §B·§C가 어긋남 — 본 ADR이 해결하려는 *동일* 문제 재발생 |
| **B. §A branch prefix를 §B와 일치시킴** (mod→refactor, bug→fix, design→feat 등) | `feat / fix / refactor / docs ...` 4~9종으로 branch prefix 변경 | ❌ | §A `feat/mod/bug/design`은 *작업 분류* 의미로 사용 — 사람 운영 편의(`bug/` branch가 한눈에 bug 작업임을 알림) ↑. §B와 강제 일치 시 가독성 ↓. ADR-0044 branch-strategy.md §2.1 정본 변경 부담 + 기존 23 이슈 title 일괄 rename 필요 |
| **C. 둘 다 정규식 확장 + ADR로 명문화** | 옵션 A + 본 ADR로 변형 정책 선언 | ❌ | 옵션 A의 결함(§B·§C 어긋남) 그대로. ADR로 정당화한다고 §B 인접 인용자(implement.md 커밋 메시지 컨벤션 등) 정합이 회복되지 않음 |
| **D (채택). §C를 §B와 정합 + §A는 의도 분리 유지 + ADR로 명문화** | §C 정규식 9 type (§B와 1:1) + §A 그대로 + 본 ADR로 §A ≠ §B·§C 분리 정당화 | ✅ | (1) §B·§C 정합 회복 (2) §A의 사람 운영 편의 보존 (3) `bug/` branch + `fix(...)` PR title이 자연스러운 mapping (Conventional Commits 표준 정합) (4) 기존 23 WBS 이슈 중 `mod(...)`·`perf(...)`·`style(...)` title은 자동 lint PASS — 일괄 rename 부담 0건. `bug(...)`·`design(...)` title만 후속 PR마다 `fix(...)`·`feat(...)`·`style(...)`로 자연 정정 (별도 일괄 작업 N/A) |

## 4. 결과 (Consequences)

### 긍정적
- §B(commit message 컨벤션)와 §C(title-lint regex)가 1:1 정합 → 사용자 PR title 작성 시 어휘 mismatched로 lint FAIL되는 마찰 제거
- `mod(...)`·`perf(...)`·`style(...)` type 자유 사용 가능 → 변경 성격을 더 정확히 표현
- ADR로 §A·§B·§C 관계 명문화 → 후속 변경 시 정합 검증 가능 (예: §B 어휘 변경 시 §C도 동기 갱신 의무)
- workflow MSG 본문 line 52 동기 갱신 → lint FAIL 시 사용자가 정확한 9 type 즉시 발견

### 부정적
- `bug/` / `design/` branch에서 PR title `bug(...)`·`design(...)`를 무심코 사용하면 여전히 lint FAIL
  - **완화**: 본 ADR §2 mapping 표 + workflow MSG line 52 9 type 안내 + 후속 PR 작성자가 자연 학습 (수 회 PR 작성 후 정착 예상)
- `mod` type은 conventional commits 1.0 표준 비호환 — 외부 도구(release-please 등) 도입 시 host에 본 변형 정책 알려야 함
  - **완화**: 본 ADR §3 옵션 D 채택 사유에 명시 — agent-toolkit upstream `branch-strategy.md §3.2`가 이미 채택한 변형, 본 PR은 정합 따라가기일 뿐

### 후속 작업
- **(자동)** workflow MSG line 52~54 type 목록 동기 갱신 — 본 PR 머지로 흡수
- **(자연 관찰)** 후속 PR에서 `bug/` branch + `fix(...)` title이 자연 정착하는지 1~2 sprint 모니터링. 정착 부족 발견 시 본 ADR §2 mapping 표를 별 위치(`branch-strategy.md` §2.1 footnote 등)로 cross-ref 확장 — 본 ADR amend
- **(toolkit upstream 전파 후보)** 본 결정이 board-app 고유라기보다 agent-toolkit 전체에 적용 가능 — agent-toolkit upstream amend 권고 (toolkit 측 ADR로 별도 등록). 본 ADR은 board-app 고유로 유지

## 5. 추적 / 재검토 시점

- **추적 metric**: PR title lint FAIL 빈도 (GitHub Actions UI 또는 `gh run list --workflow=issue-pr-title-lint.yml --json conclusion`)
- **재검토 시점**:
  - Sprint 7 완료 후 (예상 1~2 sprint, ~2 주) — `bug/`·`design/` branch PR title 자연 정착 여부 점검
  - agent-toolkit upstream에서 `branch-strategy.md §3.2` type 어휘 변경 amend 시 — 본 ADR + workflow regex 동기 갱신 의무
  - 외부 도구(release-please / commitlint) 도입 시 — 본 ADR §4 부정 결과 재평가, 표준 회귀(`mod` → `refactor` 일괄) 여부 결정
- **자동 회귀 검증**: 본 ADR 채택 후 본 PR title `mod(infra): expand title-lint regex to 9 commit types (#56)` 자체가 workflow self-test 정본 — PR open 시 lint conclusion=success가 회귀 검증
