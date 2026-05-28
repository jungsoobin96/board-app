---
doc_type: feature-plan
version: v0.2
status: Accepted
author: jungsoobin96@users.noreply.github.com
date: 2026-05-28
gate: feature
related:
  R-ID: [R-N-01]
  F-ID: [F-01]
  supersedes: null
---

# 응답 시간 측정 통합 (Issue 20) — Implementation Plan

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — 1 commit (perf.integration.test.ts + 8 docs) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 커밋 시퀀스 (DAG)

| # | 커밋 | 영향 파일 | 테스트 추가 | 회귀 위험 |
| --- | --- | --- | --- | --- |
| 1 | `test(backend): 응답 시간 측정 통합 — 4 시나리오 × 100회 p95 측정 (#20)` | `backend/tests/integration/perf.integration.test.ts` (신설 ~150 line) + `docs/features/feat-response-time-perf/*.md` (8 docs) | perf 1 it (4 시나리오 × 100회) | Low — 신규 파일만, 기존 24 통합 무변경 |

## 2. 의존성 그래프

```
[P0 context-loader] backend/tests/integration/ + buildApp + Env 식별
   │
   ▼
[P1 brief] mode=add 결정 + 4 시나리오 선택 (목록/상세/태그/댓글)
   │
   ▼
[P3 contract] §0 R-N-01 + F-01 + §2 10행 Before/After
   │
   ▼
[P4 plan] 본 문서 (1 commit)
   │
   ▼
[P5/P6/P7] eng-review PASS / acceptance AC-01~04 / risk 3 F-RISK Low
   │
   ▼
[P8 implement] perf.integration.test.ts 신설 → pnpm test:integration → 25 passed + 4 시나리오 p95 < 200ms 확인 → 1 commit
   │
   ▼
[P9 reviewer] code-review.md verdict
   │
   ▼
[P10 qa-test --ai] 6축 + 3 profile smoke + workflow 양축 → PR open + Closes #20
```

## 3. 테스트 매핑

| 커밋 | 테스트 추가 위치 | 시나리오 |
| --- | --- | --- |
| 1 | `backend/tests/integration/perf.integration.test.ts` it 1 | **4 시나리오 × 100회 — p95 측정 + WARN 출력 + 결과 JSON**: seed100Articles → 4 measureScenario(GET /api/articles?page=1&limit=10 / GET /api/articles/:id / GET /api/tags / GET /api/articles/:id/comments) 각 100회 performance.now() 측정 → percentile(p95) → console.log JSON + WARN if p95 ≥ 200ms (BLOCK X) + sanity expect (status=200, iterations=100, min ≤ p95 ≤ max) |
| 통합 회귀 | 기존 5 파일 24 it | articles/cascade/comments/error-schema/tags 모두 PASS 유지 (총 25 passed) |

## 4. 빌드·실행 검증 단계

```bash
# 단계 A: schema validate (전체 8 docs)
for f in docs/features/feat-response-time-perf/*.md; do
  bash .claude/scripts/validate-doc.sh "$f" || echo "FAIL: $f"
done
# 기대: 모두 OK

# 단계 B: backend typecheck
pnpm --filter @app/backend run build
# 기대: 0 errors

# 단계 C: backend 통합 + perf
pnpm --filter @app/backend run test:integration
# 기대: 25 passed (Sprint 4 24 baseline + 신규 1 perf test)
# 콘솔에 [PERF] R-N-01 응답 시간 측정 결과 JSON 출력
# 4 시나리오 모두 p95 < 200ms이면 WARN 없음, summary.all_p95_under_threshold: true

# 단계 D: 측정 결과 sanity
# - 4 시나리오 모두 statusAllOk: true
# - iterations: 100
# - p95 > 0, min ≤ p95 ≤ max

# 단계 E: 3 profile smoke (R-OPS-SMOKE 자기 검증)
pnpm run smoke:3profiles
# 기대: 3/3 PASS

# 단계 F: workflow 양축 manual reproduction (R-OPS-WORKFLOW)
PR_BODY="Closes #20"
ISSUES=$(printf '%s' "$PR_BODY" | grep -oiE '(closes|fixes|resolves)[[:space:]]+#[0-9]+' | grep -oE '#[0-9]+' | tr -d '#' | sort -u | tr '\n' ' ')
echo "Extracted: ${ISSUES}"   # 기대: "20 "
```

## 5. 점진 합의 / 결정 발생 항목

- **ADR 작성 필요: no** — mode=add 신규 통합 테스트 1건. modify Strict Rule N/A
- **사용자 승인 필요 X**: P14 표준 휴먼 게이트
- **결정 사항**:
  - 4 시나리오 채택 — 목록(F-01)/상세(F-04 일부)/태그(F-08)/댓글(F-05 일부) — Home·Article·Tags·Comments 골든패스 망라
  - WARN(BLOCK X) — 환경 변동 안전 흡수, 추적 우선
  - 결과 JSON 콘솔 출력 — 영속화는 별 후보 (DoD JSON 충족)
  - testTimeout 15000ms 기존 정합 (4 시나리오 × 100회 ~4초 typical)
- **PR title**: `test(backend): 응답 시간 측정 통합 — 4 시나리오 × 100회 p95 측정 (#20)` — ADR-0021 정규식 `test` prefix 정합 + branch `feat/` (ADR-0044 mode=add 정합)
- **BLOCKED 분기**: pnpm test:integration 25 미달 또는 sanity expect FAIL 시 BLOCKED
- **ui_changed=false**: backend 통합 테스트만 — frontend src/tests 매칭 0건
