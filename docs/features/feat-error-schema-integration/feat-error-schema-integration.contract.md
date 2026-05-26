---
doc_type: feature-contract
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-N-02]
  F-ID: [F-12]
  supersedes: null
---

# feat-error-schema-integration — Change Contract

> Issue #9 · mode=add · P3. errorHandler 통합 회귀 신설. test 전용 PR (src 0).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P3) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID | docs/planning/04-srs/04-srs.md | R-N-02 (에러 응답 schema 일관성) |
| F-ID | docs/planning/05-prd/05-prd.md | F-12 (보안 안내 — 간접) |
| 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md §M10 §M9 | M10 errorHandler·notFoundHandler (검증 대상) / M9 ValidationError·NotFoundError·RepositoryError (throw 측) |
| 엔드포인트 | docs/planning/09-lld-api-spec/09-lld-api-spec.md §3 | 모든 9 endpoint (4xx/5xx 응답 검증). 본 PR은 *통합 회귀*라 신규 endpoint 없음 |
| 규약 | docs/planning/11-coding-conventions/11-coding-conventions.md §2 PREFIX, docs/planning/13-test-design/02-catalog.md §2 R-N-02 | 13/02 R-N-02 §2 "전 엔드포인트의 4xx/5xx (의도 throw 주입)" 정합 |

## 1. 변경 의도

`backend/tests/integration/error-schema.integration.test.ts` 신설. 9 endpoint × ~2 에러 케이스 통합 회귀 — R-N-02 정합 검증 (`{error:string}` schema + stack/code 미노출). 추가로 의도 throw 주입(vi.mock service) 시 500 fallback + stderr stack 양축 검증. 단위 errorHandler.test.ts(#2 산출)와는 *층위 분리* — 단위는 mock express, 통합은 실 buildApp + 실 SQLite + 실 endpoint 흐름. 13/02-catalog §2 R-N-02 "의도 throw 주입" 명시 실 코드 정합.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `backend/tests/integration/error-schema.integration.test.ts` | 미존재 | 신설 (~200 lines, ~12-18 it 케이스) |
| R-N-02 통합 검증 | 각 PR별 부분 (articles 9 / comments 7 / tags 3) | **모든 9 endpoint 일괄 통합 회귀** |
| 의도 throw 500 통합 | 0 | 1 케이스 (vi.mock article.service → throw → 500 + stderr stack + body 메시지) |
| notFoundHandler 통합 | 0 (단위만 #2) | 1 케이스 (`GET /nonexistent` → 404) |
| 통합 테스트 합계 | 22 passed (#8 PR #36 후) | + 12-18 ≈ 34-40 passed |
| typecheck | PASS 유지 | PASS |
| build | PASS 유지 | PASS |
| smoke | Sprint 1 #5 baseline | 동일 |
| 부팅 자산 | 무변경 | 무변경 |
| 09 API spec | 영향 없음 (검증만) | 영향 없음 |
| 코드 라인 추가 | — | 약 +200 (test 1 신설) + 약 +200 (docs) |
| src 변경 | 0 | 0 |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `backend/src/middleware/error-handler.ts` (M10) | 본 PR 검증 대상 — 코드 변경 0 | 회귀 위험 0 |
| `backend/src/errors/{validation,not-found,repository}-error.ts` | throw 측 — 본 PR test에서 의도 throw 주입에 활용 | 변경 없음 |
| `backend/src/services/article.service.ts` 등 | vi.mock 대상 — 의도 throw 주입 | 변경 없음 (test에서만 mock) |
| 기존 integration 테스트 (articles 9 / comments 7 / tags 3 / cascade 3) | 본 PR이 별 파일 — 영향 0 | 기존 PASS 유지 |
| `backend/src/app.ts` | 변경 없음 — buildApp 그대로 사용 | 변경 없음 |
| `backend/tests/unit/error-handler.test.ts` (#2) | 단위 layer — 본 PR 통합 layer는 별 axis | 그대로 보존 |

## 4. Backward Compatibility

- **Breaking**: no — test 1 파일 신설. src 0.
- **마이그레이션**: no.
- **API contract 변경**: 0 — test 전용.
- **버전 bump**: 0.
- **에러 코드**: 0 — 기존 4종 (Val/NF/Repo + 기본) 그대로.

## 5. Rollback 전략

- **Revert 가능**: yes — git revert.
- **데이터 손상 위험**: 없음 — test가 dev.db에 시드해도 beforeEach deleteMany 정리. afterAll disconnect.
- **Rollback 절차**: revert → CI green (기존 22 PASS 회귀 0)
- **부팅 자산 회귀**: 0.

## 6. 비목표

- **errorHandler 코드 수정** — #2 산출 그대로
- **새 에러 클래스 도입** — 4종 그대로
- **E2E 에러 시나리오** — Sprint 4 별 진행
- **rate limit / circuit breaker** — MVP 범위 외
- **에러 로깅 외부 송신** (Sentry) — MVP 범위 외
- **에러 메시지 i18n** — 한국어 fixed (R-N-02)
- **에러 ID 추적 (correlation ID)** — Phase 2
