---
doc_type: feature-plan
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-OPS-AUTO-LABEL, R-OPS-SMOKE, R-OPS-WORKFLOW, R-OPS-DOCS-SYNC]
  F-ID: []
  supersedes: null
---

# R-OPS R-ID taxonomy (Issue 52) — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 1 commit(8 docs + ADR + 04-srs + 13-catalog) + check-test-catalog-sync.sh 검증 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `mod(docs): 04-srs §비기능 R-OPS-* 4건 정식 등록 + 13/02-catalog fan-in + ADR-0002 (#52)` | `docs/planning/04-srs/04-srs.md` (4 subsection 추가 + frontmatter + 변경 이력) + `docs/planning/13-test-design/02-catalog.md` (§2 4행 + §4 매트릭스 4행 + frontmatter + 변경 이력) + `docs/planning/adr/0002-mod-r-ops-r-id-taxonomy.md` (신설) + `docs/planning/adr/INDEX.md` (0002 등록) + `docs/features/mod-r-ops-r-id-taxonomy/*.md` (7 feature docs: contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report — investigation은 modify N/A) | N/A — docs-only. validate-doc.sh로 schema 정합 자동 검증 + check-test-catalog-sync.sh로 fan-in 정합 검증 | Low — 04-srs §3 기존 R-N-* 무변경, R-OPS-* subsection 추가만 |

> 코드 변경 0건 docs/markdown PR. 단 1 commit으로 04-srs + 13-catalog + ADR + 7 feature docs + INDEX 묶음.

## 2. 의존성 그래프

```
[Investigation N/A - mode=modify]
   │
   ▼
[Contract] §0 R-OPS-* 4건 + §2 Before/After 11행 + §3 호출자 13행 + §6 비목표 7건
   │
   ▼
[ADR-0002] 컨텍스트 + 결정 + 대안 3건(A/B/C) + 결과 + 재검토 — modify Strict Rule 충족
   │
   ▼
[Plan] 본 문서 (1 commit)
   │
   ▼
[Acceptance + Risk + Eng-review] 검증/등급/PASS 게이트
   │
   ▼
[P8 implement] git add docs/planning/04-srs/ docs/planning/13-test-design/ docs/planning/adr/ docs/features/mod-r-ops-r-id-taxonomy/
              → 1 commit → push -u
   │
   ▼
[P9 reviewer] code-review.md verdict (Generator≠Evaluator)
   │
   ▼
[P10 qa-test --ai] 6축 + 3 profile smoke + workflow 양축 + check-test-catalog-sync.sh OK 확인
                  → PR open + Closes #52
   │
   ▼
[P11 자동] sync-issue-labels.yml: status:in-progress → status:in-review 자동 전이
                                  (#51 회복 검증 자연 회귀)
   │
   ▼
[P14 human] Manual + DoD + Approve + 머지
   │
   ▼
[Post-merge] sync runs +1 + 이슈 #52 close + 라벨 자동 제거 + R-OPS-* 정본 사용 가능
```

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 1 (04-srs + 13-catalog + ADR + 7 docs) | `bash .claude/scripts/validate-doc.sh <file>` 전체 8건 (04-srs · 13/02-catalog · ADR-0002 · 7 feature docs) | OK 응답 |
| 1 동일 | `bash .claude/scripts/check-test-catalog-sync.sh` | WARN 없음 (R-OPS-* 모두 13-catalog §2 fan-in 충족) |
| 통합 회귀 (Sprint 5 #48 등) | 후속 PR에서 R-OPS-* 정본 참조 자연 채택 | acceptance §0 related.R-ID에 `R-OPS-*` 명시 가능 (ad-hoc 우회 불필요) |
| workflow 양축 (R-OPS-WORKFLOW 자기 검증) | PR open + 머지 시 sync-issue-labels.yml + issue-pr-title-lint.yml 자연 trigger | 본 PR 머지로 R-OPS-WORKFLOW 정의가 실증 시나리오로 동작 |

## 4. 빌드·실행 검증 단계

```bash
# 단계 A: schema validate (전체 8 docs + ADR)
for f in docs/features/mod-r-ops-r-id-taxonomy/*.md docs/planning/adr/0002-mod-r-ops-r-id-taxonomy.md docs/planning/04-srs/04-srs.md docs/planning/13-test-design/02-catalog.md; do
  bash .claude/scripts/validate-doc.sh "$f" || echo "FAIL: $f"
done
# 기대: 모두 OK

# 단계 B: 13/02-catalog 동기화 검사 (ADR-0035)
bash .claude/scripts/check-test-catalog-sync.sh
# 기대: WARN 없음 (R-OPS-* 모두 §2 fan-in 충족)

# 단계 C: 04-srs §3 R-OPS-* 4건 정합 검증
grep -cE '^### R-OPS-' docs/planning/04-srs/04-srs.md
# 기대: 4

# 단계 D: 13-catalog §2 R-OPS-* fan-in 정합 검증
awk '/^## 2\. 통합/,/^## 3\./' docs/planning/13-test-design/02-catalog.md | grep -cE '^### R-OPS-'
# 기대: ≥ 2 (R-OPS-AUTO-LABEL + R-OPS-WORKFLOW 최소)

# 단계 E: ADR-0002 ID 정합 + Status Accepted
grep -E '^# ADR 0002 — |^status: Accepted$' docs/planning/adr/0002-mod-r-ops-r-id-taxonomy.md
# 기대: 2건 매칭

# 단계 F: 3 profile smoke (R-OPS-SMOKE 자기 검증)
pnpm run smoke:3profiles
# 기대: 3/3 PASS

# 단계 G: workflow 양축 manual reproduction (R-OPS-WORKFLOW 자기 검증, ADR-0047)
PR_BODY="Closes #52"
ISSUES=$(printf '%s' "$PR_BODY" | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' | grep -oE '#[0-9]+' | tr -d '#' | sort -u | tr '\n' ' ')
echo "Extracted: ${ISSUES}"   # 기대: "52 "

# 단계 H: LOCAL.md 동기 확인 (R-OPS-DOCS-SYNC 자기 검증, ADR-0040)
git diff main...HEAD --name-only | grep -E '^(\.env\.|prisma/migrations/|pnpm-lock\.yaml$|package\.json$|LOCAL\.md$|scripts/setup)'
# 기대: 빈 결과 (부팅 자산 변경 없음, LOCAL.md 동기 N/A)
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요: yes** (modify Strict Rule) — ADR-0002 신설 — `mod-r-ops-r-id-taxonomy`. 대안 3건(A/B/C) 검토 + 채택안 명시.
- **사용자 승인 필요 X**: 본 PR은 docs-only modify이며 정본 변경(04-srs §3 추가만). breaking change 아니므로 별도 명시 승인 불필요. P14 표준 휴먼 게이트 진행.
- **결정 사항**: R-OPS-* prefix 명명 규칙 — `R-OPS-<SUFFIX>` 형식, suffix는 대문자+하이픈 분리 짧은 명사형. ADR 출처 명시 필수. ADR-0002 §2에 명문화.
- **04-srs frontmatter status**: Draft → Accepted bump. agent-toolkit upstream 정책상 첫 정식 등록 시점 (Sprint 1~4 동안 R-F-*/R-N-* 사용했지만 frontmatter status는 Draft 유지). 본 PR로 Accepted 정식 진입.
- **BLOCKED 분기**: `check-test-catalog-sync.sh`가 WARN 출력 시 BLOCKED — R-OPS-* §2 fan-in 부족 분석 후 재작업.
