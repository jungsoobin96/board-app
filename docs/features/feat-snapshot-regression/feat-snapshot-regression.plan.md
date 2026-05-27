---
doc_type: feature-plan
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-27
gate: feature
related:
  R-ID: [R-N-06]
  F-ID: [F-11]
  supersedes: null
---

# Snapshot 회귀 5종 (Issue 19, scope 축소) — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-27 | jungsoobin96 | 본문 — 1 commit (Toast.test.tsx +1 it + snap + 8 docs) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `test(frontend): Toast snapshot 회귀 보호 추가 — snapshot 5종 (#19)` | `frontend/tests/unit/components/Toast.test.tsx` (it +1) + `frontend/tests/unit/components/__snapshots__/Toast.test.tsx.snap` (신설, 2 sub-snap) + `docs/features/feat-snapshot-regression/*.md` (8 docs) | snapshot 1 it (success + error variant 2 sub-snap) | Low — 신규 it 추가만, 기존 4 it 무변경 |

## 2. 의존성 그래프

```
[P0 context-loader] frontend/components/Toast + tests/unit/components/Toast.test.tsx + __snapshots__/ 식별
   │
   ▼
[P1 brief] mode=add 결정 + Toast 채택 (5종 도달)
   │
   ▼
[P3 contract] §0 R-N-06 + F-11 + §2 8행 Before/After
   │
   ▼
[P4 plan] 본 문서 (1 commit)
   │
   ▼
[P5/P6/P7 eng-review/acceptance/risk] PASS
   │
   ▼
[P8 implement] Toast.test.tsx 신규 it 5 추가 → pnpm test 86 passed + 2 sub-snap written 확인 → 1 commit
   │
   ▼
[P9 reviewer] code-review.md verdict
   │
   ▼
[P10 qa-test --ai] 6축 + 3 profile smoke + workflow 양축 + ui_changed=false (테스트 파일만, .tsx 매칭이나 src/ 아닌 tests/ 경로)
                  → PR open + Closes #19
```

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 1 | `frontend/tests/unit/components/Toast.test.tsx` it 5 | **snapshot — success + error variant 회귀 보호 (#19)**: success variant render → asFragment.toMatchSnapshot('Toast-success'). cleanup → error variant render → asFragment.toMatchSnapshot('Toast-error'). 2 sub-snap |
| 1 | 기존 4 it 회귀 | success role=alert + error 닫기 onDismiss + auto-dismiss 3000ms + durationMs null 모두 PASS 유지 |

## 4. 빌드·실행 검증 단계

```bash
# 단계 A: schema validate (전체 8 docs)
for f in docs/features/feat-snapshot-regression/*.md; do
  bash .claude/scripts/validate-doc.sh "$f" || echo "FAIL: $f"
done
# 기대: 모두 OK

# 단계 B: frontend 단위 + snapshot
pnpm --filter @app/frontend run test:unit
# 기대: 86 passed + 1 skipped (Sprint 5 #18 후 85 + 신규 1 it)
# 첫 실행: "Snapshots: 2 written" (Toast-success + Toast-error)
# 재실행: "Snapshots: 0 written, 0 obsolete"

# 단계 C: snapshot 파일 존재 확인
ls frontend/tests/unit/components/__snapshots__/Toast.test.tsx.snap
# 기대: 파일 존재 + 2 entry (Toast-success + Toast-error)

# 단계 D: snapshot 컴포넌트 수
ls frontend/tests/unit/components/__snapshots__/*.snap | wc -l
# 기대: 5 (ArticleCard + CommentList + Pagination + TagList + Toast)

# 단계 E: 3 profile smoke (R-OPS-SMOKE 자기 검증)
pnpm run smoke:3profiles
# 기대: 3/3 PASS

# 단계 F: workflow 양축 manual reproduction (R-OPS-WORKFLOW)
PR_BODY="Closes #19"
ISSUES=$(printf '%s' "$PR_BODY" | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' | grep -oE '#[0-9]+' | tr -d '#' | sort -u | tr '\n' ' ')
echo "Extracted: ${ISSUES}"   # 기대: "19 "
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요: no** — 본 PR은 작은 mode=add 테스트 추가. modify Strict Rule N/A
- **사용자 승인 필요 X**: P14 표준 휴먼 게이트
- **결정 사항**:
  - Toast 채택 (5종 도달용) — variant 4종 + auto-dismiss 등 가장 회귀 보호 가치
  - viewport 4×5 페이지 + Playwright는 #21 이관 (사용자 (C) 결정)
  - snapshot은 sub-snap 명시 (toMatchSnapshot('Toast-success') 형식)으로 1 it 안에서 success + error 2 케이스
- **PR title**: `test(frontend): Toast snapshot 회귀 보호 추가 — snapshot 5종 (#19)` — ADR-0021 정규식 `test` prefix 정합 + branch `feat/` (ADR-0044 mode=add 정합, #56 발견 영향 없음)
- **BLOCKED 분기**: pnpm test 86 미달 시 BLOCKED, snapshot 파일 5종 미만 시 BLOCKED
- **ui_changed=false**: 테스트 파일만 변경 (`frontend/tests/unit/components/Toast.test.tsx`). `frontend/src/` 매칭 없음. snapshot 파일은 자동 생성 자산
