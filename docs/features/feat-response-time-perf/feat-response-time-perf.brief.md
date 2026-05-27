---
doc_type: feature-brief
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

# 응답 시간 측정 통합 (Issue 20) — Feature Brief

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — perf.integration.test.ts 4 시나리오 × 100회 + p95 측정 + WARN (BLOCK X) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 1. 한 줄 의도

backend/tests/integration/perf.integration.test.ts 신설 — 100건 시드 + 4 시나리오 × 100회 응답 시간 측정 + p95 < 200ms 임계 + WARN 출력(BLOCK X) + 결과 JSON. R-N-01 추적성 확보.

## 2. 사용자 가치

- R-N-01 (응답 시간 < 200ms p95) 정량 측정 — 향후 회귀 발생 시 측정 결과로 추적 가능
- BLOCK 없이 WARN만 — 환경 변동(로컬 vs CI) 안전 흡수, 추적이 우선
- 결과 JSON 콘솔 출력 — CI 또는 사람이 추세 모니터링 가능
- 4 시나리오 묶음(목록·상세·태그·댓글) — Home·Article·Tags·Comments 골든패스 응답 시간 한 번에 측정

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| backend integration tests | 5 파일 (articles/cascade/comments/error-schema/tags) — 24건 | 6 파일 (+perf.integration.test.ts) — **25건** |
| backend 통합 카운트 | 24 passed (Sprint 2 #6/#7/#8/#9 완성) | **25 passed** (+1 신규 perf test) |
| R-N-01 추적성 | acceptance 명시 (04-srs §3) — 측정 미존재 | **perf.integration.test.ts로 정량 측정 + JSON 출력** |
| p95 임계 검증 | 없음 | 4 시나리오 모두 p95 < 200ms (WARN if 초과) |
| 100건 시드 | 없음 | seed100Articles helper (글 100 + 태그 8 + ArticleTag 다수 + 댓글 3) |
| performance.now() wrapper | 없음 | measureScenario(label, fn) — 100회 측정 + p50/p95/max/mean 통계 |

## 4. 모드 자동 감지 결과

- 부정 시그널: type:bug=No / UI=No / modify=No / type:test 라벨=Yes
- 충돌 0건 → ADR-0032 규칙 4 기본값 add 자동 결정
- **결정: mode=add** (신규 통합 테스트 파일 1건 추가)
- Mode Decision Trace: type:test 라벨 + "응답 시간 측정" 신규 시나리오 → 부정 시그널 0건 → mode=add 무질문 진행

## 5. 영향 범위

- `backend/tests/integration/perf.integration.test.ts` (신설)
- 13/02-catalog §2 통합 R-N-01 — 기존 fan-in(line 336~344) 그대로 유지 (perf 측정은 R-N-01 시나리오 발현, 별도 row 추가 불필요)
- `docs/features/feat-response-time-perf/*.md` (8건 신설)
- backend 통합 카운트 24 → 25
- `backend/src/`, `backend/prisma/` 등 변경 없음

## 6. 비목표

- CI 환경 p95 임계 별도 정의 — 본 PR은 로컬 SQLite 기준만. CI 환경 차이는 운영 정책
- BLOCK gate 도입 — WARN만 (이슈 본문 명시 + acceptance §AC-02)
- 4 시나리오 외 추가 (PUT/POST 변형, pagination, tag 필터링) — Sprint 6+ 확장 후보
- 결과 JSON 영속화 (file 저장 또는 dashboard) — 콘솔 출력만, 추세 추적은 Sprint 6+ 후보
- 부하 테스트 / stress test — perf 추적이 본 PR scope (R-N-01 추적성)

## 7. Open Questions

(없음 — 4 시나리오 × 100회 측정 단순 작업)
