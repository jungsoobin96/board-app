---
doc_type: feature-brief
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

# feat-cascade-integration — Feature Brief

> Sprint 2 세 번째 이슈 — Issue #8. cascade.integration.test.ts에 rollback 시나리오 추가 + 기존 happy 케이스와 통합 회귀 매트릭스 완결.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (Sprint 2 세 번째 진입) |

## 1. 한 줄 의도

cascade 무결성 통합 회귀 완결 — 기존 happy(글 삭제 cascade + 태그 삭제 ArticleTag cascade) 2 케이스에 **rollback 시나리오 1건** 추가하여 R-F-07 검증 매트릭스 완결.

## 2. 사용자 가치

- **운영**: 트랜잭션 실패 시 부분 commit 차단 보장 — 데이터 무결성 신뢰
- **개발**: 향후 service 코드 변경 시 cascade·rollback 회귀를 자동 검출
- **품질**: R-F-07이 schema-level CASCADE + 트랜잭션 wrapper 두 축으로 보장됨을 회귀 매트릭스로 입증

## 3. 현재 상태 → 변경 후 상태

| 측면 | 현재 | 변경 후 |
| --- | --- | --- |
| `backend/tests/integration/cascade.integration.test.ts` | 2 케이스 (#4 PR #32 산출) — happy 글 삭제 cascade + 태그 삭제 ArticleTag cascade | + rollback 시나리오 1건 = 3 케이스 |
| rollback 시나리오 검증 | 0 | 1 — `prisma.$transaction` 안에서 throw 주입 → 모든 row 0건 (보존) |
| 통합 테스트 실행 | 21 passed (#7 PR #35 후) | + 1 = 22 passed |
| R-F-07 검증 매트릭스 | happy 만 | happy + rollback = 완결 |
| 13/02-catalog R-F-07 §2 | 출처 04#R-F-07, "Failure: 트랜잭션 rollback 시나리오 (force throw 주입)" 명시됨 | 본 PR 시점에 실제 코드 추가 (정본 정합) |
| 부팅 자산 | 변경 없음 | 동일 |

## 4. 모드 자동 감지 결과

- **부정 시그널**: bug(0) / design(0) / modify(0) — 0건
- **라벨**: `type:test` + `area:backend` + `priority:P0`
- **자연어**: "통합 회귀" — 신규 시나리오 추가
- **자동 판정**: ADR-0032 규칙 4 기본값 → **mode=add** (test도 신규 동작이라 add)
- **trace**: type:test는 add/modify 결정 시그널 아님. 자연어 "추가"·신규 케이스 → add

## 5. 영향 범위

| 종류 | 위치 | 영향 |
|---|---|---|
| 변경 코드 | `backend/tests/integration/cascade.integration.test.ts` | +1 it 블록 (rollback 시나리오) |
| 신규 코드 | 없음 — 본 PR은 *테스트 전용* | 0 |
| src 변경 | 없음 — service 코드 미변경 | 0 (회귀 위험 0) |
| 부팅 자산 | 변경 없음 | 6번째 axis: 부팅 코드 변경 0 |
| 09 API spec | 영향 없음 | 0 |
| 13/02-catalog | R-F-07 §2 fan-in이 이미 명시됨 (실 코드 추가가 본 PR 효력) | docs-update 갱신 1줄 (실 코드 정합 명시) |

## 6. 비목표

- **service 코드 수정** — withTransaction wrapper는 #4 산출 그대로
- **schema 변경** — CASCADE는 #3 산출 그대로
- **CI 회귀 매 PR** (DoD-4) — CI workflow 미구축 (Sprint 1 follow-up), 본 PR scope 외
- **새 cascade 패턴 도입** — Comment·ArticleTag·Tag 3종 cascade 정의는 #3 그대로
- **rollback 비기능 측정** (rollback 시간 등) — MVP 범위 외

## 7. Open Questions

- **O-Ca1**: rollback throw 주입 위치 — service 호출 vs raw prisma.$transaction. → 답: raw prisma.$transaction (service 코드 의존 0, 트랜잭션 자체 보장 검증). 더 직접적.
- **O-Ca2**: rollback 시나리오에서 article·comment·tag 모두 시드 후 throw vs 일부만 시드. → 답: 모두 시드 (article + comment + tag + articleTag 4종 createMany 후 throw) — cascade 전체 rollback 검증.
