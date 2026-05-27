---
doc_type: feature-contract
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

# 응답 시간 측정 통합 (Issue 20) — Change Contract

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | 본문 — perf.integration.test.ts + 4 시나리오 × 100회 + WARN(BLOCK X) |
| v0.1 | 2026-05-27 | jungsoobin96 | 초안 (scaffold-doc.sh 생성) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID (요구) | 04-srs | R-N-01 (응답 시간 < 200ms p95) |
| F-ID (기능) | 05-prd | F-01 (글 목록 + 페이지네이션 — 측정 대상 시나리오 1) |
| 영향 모듈 | 08-lld-module-spec | backend/tests/integration (read-only — 9 endpoint 측정) |
| 영향 엔드포인트 | 09-lld-api-spec | GET /api/articles, GET /api/articles/:id, GET /api/tags, GET /api/articles/:id/comments (4 endpoint, read-only) |
| 적용 컨벤션 절 | 11-coding-conventions | (none — 기존 vitest + supertest 통합 패턴 답습) |

## 1. 변경 의도

`#20` 이슈 본문 "100건 시드 + 100회 측정 + p95 < 200ms (WARN if 초과, BLOCK X) + 결과 JSON" 충족. R-N-01 정량 측정 + 추적성 확보. 4 시나리오 묶음(목록·상세·태그·댓글) — Home·Article·Tags·Comments 골든패스 응답 시간 한 번에.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| backend integration tests 파일 수 | 5 (articles/cascade/comments/error-schema/tags) | **6** (+perf.integration.test.ts) |
| backend 통합 카운트 | 24 passed | **25 passed** (+1 신규 perf test) |
| R-N-01 추적성 | acceptance 명시(04-srs §3) — 측정 미존재 | **정량 측정 + JSON 출력** |
| p95 측정 함수 | 없음 | `percentile(samples, p)` helper |
| performance.now() wrapper | 없음 | `measureScenario(label, fn)` — 100회 × ms 측정 + min/p50/p95/max/mean |
| 100건 시드 helper | 없음 | `seed100Articles()` — 글 100 + 태그 8 + ArticleTag 라운드로빈 + 댓글 3 |
| 측정 결과 출력 | 없음 | console.log JSON + WARN if 초과 |
| WARN 형식 | 없음 | `[PERF WARN] <label> — p95=<ms>ms ≥ 200ms threshold (BLOCK X, 추적만)` |
| 최소 sanity 검증 | 없음 | 모든 시나리오 status=200 + iterations=100 + min ≤ p95 ≤ max |
| 실측 결과 (사전 검증) | N/A | 4 시나리오 모두 p95 < 200ms (목록 ~28 / 상세 ~30 / 태그 ~7 / 댓글 ~37 ms typical) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `backend/tests/integration/perf.integration.test.ts` | 신설 (~150 line) | 본 PR diff |
| `backend/src/app.ts` (buildApp) | read-only 사용 | 영향 없음 |
| `backend/src/env.ts` (Env type) | read-only 사용 | 영향 없음 |
| `backend/prisma/schema.prisma` (Article/Tag/Comment 모델) | read-only 사용 | 영향 없음 |
| `backend/vitest.integration.config.ts` (testTimeout 15000) | 본 perf 1 it가 ~4초 (100×4 시나리오 + 시드) — testTimeout 충분 | 영향 없음 |
| `docs/planning/13-test-design/02-catalog.md` §2 R-N-01 (line 336~344) | 기존 fan-in 그대로 — perf 측정은 R-N-01 발현 시나리오 (별도 row 추가 불필요) | 영향 없음 |
| `docs/features/feat-response-time-perf/*.md` | 신설 8건 (brief·contract·plan·eng-review·acceptance·risk·code-review·ai-qa-report — investigation은 mode=add N/A) | 본 PR diff |

## 4. Backward Compatibility

- Breaking: **no** — 신규 통합 테스트 파일만, 기존 24 테스트 무변경, src/prisma 무변경
- 마이그레이션 필요: **no**
- 사용자 노출: 없음 (테스트 코드)
- 영향 사용자: 개발자만

## 5. Rollback 전략

- revert 가능: **yes** — `git revert <merge-sha>`로 perf 테스트 파일 + 8 feature docs 일괄 제거
- rollback 절차 (1단계): `git revert <PR-#-merge-sha>` → 통합 카운트 24 복귀
- 데이터 손상 위험: **없음** — 테스트 코드만. dev.db는 beforeEach deleteMany로 격리

## 6. 비목표

- CI 환경 p95 임계 별도 정의 — 본 PR은 로컬 SQLite 기준만
- BLOCK gate 도입 — WARN만 (이슈 본문 명시, acceptance §AC-02)
- 4 시나리오 외 추가 (POST/PUT 변형, pagination, tag filtering 등) — Sprint 6+ 확장 후보
- 결과 JSON 영속화 (file/dashboard) — 콘솔만, 추세 추적 별 후보
- 부하 테스트 / stress test — perf 추적이 본 PR scope
- pre-existing TS 3건 정정 (#48) — 별 PR
