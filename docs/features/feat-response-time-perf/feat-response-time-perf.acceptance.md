---
doc_type: feature-acceptance
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

# 응답 시간 측정 통합 (Issue 20) — Acceptance Criteria

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — AC-01/02/03/04 + DoD 7항 + 회귀 1항 |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 인수 기준 (Given/When/Then)

### AC-01: 100건 시드 + GET /api/articles 100회 측정 → p95 < 200ms (#20 본문 ①)

- **Given** seed100Articles helper로 글 100건 + 태그 8건 + ArticleTag 라운드로빈 시드
- **When** `measureScenario('GET /api/articles?page=1&limit=10', ...)` 100회 실행 + percentile(p95) 계산
- **Then** 결과 JSON `scenarios[0].p95 < 200`. 측정 방법: vitest 출력 console.log JSON. 실측: p95 ~28ms typical.

### AC-02: 4 시나리오 × 100회 → 모두 p95 < 200ms (WARN if 초과, BLOCK X) (#20 본문 ②)

- **Given** 4 시나리오(목록·상세·태그·댓글)
- **When** 각 100회 measureScenario 실행
- **Then** `summary.all_p95_under_threshold: true` (실측: 4건 모두 < 50ms). 초과 시 `[PERF WARN]` 출력 (BLOCK X — expect로 차단 안 함). 측정 방법: vitest 출력.

### AC-03: 결과 JSON 콘솔 출력 (#20 DoD ④)

- **Given** perf 테스트 실행
- **When** vitest 출력 확인
- **Then** `[PERF] R-N-01 응답 시간 측정 결과:` + JSON 구조 (issue/r_id/threshold_ms/iterations/scenarios[4]/summary) 출력. 측정 방법: stdout grep.

### AC-04: backend 통합 카운트 24 → 25 (sanity 검증)

- **Given** 신규 perf.integration.test.ts 1 it
- **When** `pnpm --filter @app/backend run test:integration`
- **Then** **25 passed** (Sprint 4 baseline 24 + 신규 1). 측정 방법: vitest 출력 last line.

## 2. Definition of Done (D-06)

| # | 항목 | 검증 |
| --- | --- | --- |
| 1 | perf.integration.test.ts 신설 (~150 line) | AC-04 vitest count |
| 2 | performance.now() wrapper (measureScenario) | 사람 review |
| 3 | 4 시나리오 × 100회 실행 | AC-02 |
| 4 | WARN 출력 (BLOCK X) | acceptance §3 console grep |
| 5 | 결과 JSON 출력 | AC-03 |
| 6 | AI 게이트 6축 PASS (5번째 N/A, 6번째 3 profile smoke) | ai-qa-report §2 |
| 7 | Manual/DoD 체크박스 미체크 + Approve + 머지 + 자동 close | P14 휴먼 게이트 |

## 3. 비기능 인수

- **R-OPS-AUTO-LABEL**: 본 PR open/머지 시 sync-issue-labels.yml 자동 trigger + 이슈 #20 라벨 자동 전이/제거 자연 회귀
- **R-OPS-SMOKE**: 3 profile smoke PASS (ai-qa-report §7)
- **R-OPS-WORKFLOW**: PR open 시 title-lint conclusion=success (`test(backend):` 정규식 정합)

## 4. 회귀 인수

- **회귀-01**: 기존 5 파일 24 통합 it (articles 8 / cascade 3 / comments 4 / error-schema 5 / tags 3 + 기타) 모두 PASS 유지. perf 1 it 추가가 기존 it에 영향 없음 (vitest pool=forks singleFork + fileParallelism=false, beforeEach deleteMany 격리).
  - 검증 시점: `pnpm test:integration` 출력 25 passed
  - 실패 시: perf 테스트 격리 또는 시드 충돌 분석
