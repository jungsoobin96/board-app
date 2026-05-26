---
doc_type: feature-contract
version: v0.1
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-26
gate: feature
related:
  R-ID: [R-F-07]
  F-ID: [F-07]
  supersedes: null
---

# feat-cascade-integration — Change Contract

> Issue #8 · mode=add · P3. cascade.integration.test.ts에 rollback 시나리오 1건 추가. test 전용 PR (src 변경 0).

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P3) |

## 0. 참조 정본 ID (Referenced-IDs)

| 종류 | 정본 위치 | 영향 ID |
| --- | --- | --- |
| R-ID | docs/planning/04-srs/04-srs.md | R-F-07 (cascade 무결성) |
| F-ID | docs/planning/05-prd/05-prd.md | F-07 |
| 모듈 | docs/planning/08-lld-module-spec/08-lld-module-spec.md §M7 §M8 §M11 | M7 withTransaction wrapper (검증 대상) / M8 article·comment·tag repo (시드 사용) / M11 prisma schema CASCADE (검증 대상) |
| 엔드포인트 | (none) — test 전용, HTTP layer 미사용 (raw prisma) | (none) |
| 규약 | docs/planning/11-coding-conventions/11-coding-conventions.md §3 명명 + docs/planning/13-test-design/02-catalog.md §2 R-F-07 통합 | 13/02-catalog R-F-07 §2 "Failure: 트랜잭션 rollback 시나리오 (force throw 주입)" 정합 |

## 1. 변경 의도

`backend/tests/integration/cascade.integration.test.ts`에 rollback 시나리오 1건 추가. 기존 2 케이스(happy 글 삭제 cascade + 태그 삭제 cascade)에 더해 *트랜잭션 throw 주입 → 모든 row 보존*을 통합 검증. R-F-07 schema-level CASCADE + 트랜잭션 wrapper 두 축 보장이 회귀 매트릭스로 완결됨. 13/02-catalog §2 R-F-07 명시 시나리오의 *실 코드 발현*.

## 2. Before / After

| 항목 | Before | After |
| --- | --- | --- |
| `backend/tests/integration/cascade.integration.test.ts` it 블록 | 2 (글 삭제 cascade + 태그 삭제 cascade) | 3 (+ rollback throw 주입 시나리오) |
| rollback 검증 방식 | 0 (검증 안 됨) | `prisma.$transaction(async (tx) => { ...createMany... throw new Error('rollback test') })` → 모든 4 테이블 0건 |
| 회귀 매트릭스 R-F-07 §2 | "Failure: 트랜잭션 rollback 시나리오 (force throw 주입)" 명시만 | 실 코드 검증 |
| 통합 테스트 합계 | 21 passed (#7 PR #35 후) | + 1 = 22 passed |
| typecheck | PASS 유지 | PASS |
| build | PASS 유지 | PASS |
| smoke | Sprint 1 #5 baseline | 동일 (test 추가만, src·env·schema 영향 0) |
| 부팅 자산 | 무변경 | 무변경 |
| 09 API spec | 영향 없음 | 영향 없음 |
| 코드 라인 추가 | — | 약 +30 (test 1 it 블록) + 약 +200 (docs) |
| src 변경 | 0 | 0 (test 전용 PR — 회귀 위험 0) |

## 3. 호출자·의존자 (Call Sites)

| 위치 | 영향 | 조치 |
| --- | --- | --- |
| `backend/src/services/article.service.ts` (withTransaction) | 본 PR 검증 대상 — 코드 변경 0 | 본 PR 변경 없음, 회귀 위험 0 |
| `backend/src/repositories/article.repo.ts` | 본 PR test 시드에서 사용 가능 — but raw prisma 직접 호출이 더 명확 | 미사용 |
| `backend/prisma/schema.prisma` | CASCADE 정의는 #3 산출 그대로 — 본 PR 변경 0 | 변경 없음 |
| 기존 cascade.integration.test.ts 2 케이스 | 본 PR이 같은 파일에 it 1건 추가 — 기존 케이스 영향 0 | 기존 PASS 유지 |
| Sprint 4 `feat-article-delete-ux` | 본 PR cascade 보장이 FE 차단 해소 의미 — but #4 PR #32에서 이미 baseline | 변경 없음 (이미 충족) |

## 4. Backward Compatibility

- **Breaking**: no — test 1 it 블록 추가만. src 0 변경.
- **마이그레이션**: no.
- **API contract 변경**: 0 — test 전용.
- **버전 bump**: 0.
- **에러 코드**: 0 — test에서 throw하는 Error는 임시 (production 코드 영향 X).

## 5. Rollback 전략

- **Revert 가능**: yes — git revert 1 commit.
- **데이터 손상 위험**: 없음 — test가 dev.db에 시드하더라도 beforeEach deleteMany로 정리. afterAll disconnect.
- **Rollback 절차**: revert → CI green (기존 21 PASS 회귀 0)
- **부팅 자산 회귀**: 0.

## 6. 비목표

- **service 코드 수정** — withTransaction은 #4 산출 그대로
- **schema 변경** — #3 그대로
- **CI 회귀 매 PR** (DoD-4) — CI workflow는 Sprint 1 follow-up
- **새 cascade 패턴 도입** — Comment·ArticleTag 3종 그대로
- **rollback 비기능 측정** — MVP 범위 외
- **isolation level 검증** — SQLite 기본 (READ COMMITTED 유사)
