---
doc_type: feature-risk
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

# feat-cascade-integration — Feature Risk

> Issue #8 · mode=add · P7. test 전용 PR — High 0.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P7) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| Ca-RISK-01 | Prisma `$transaction` async fn throw가 자동 rollback 안 됨 (특정 Prisma 버전 이슈) | 4 | 1 | Low |
| Ca-RISK-02 | beforeEach deleteMany 실행 전 throw → 다음 테스트 영향 (격리 실패) | 3 | 1 | Low |
| Ca-RISK-03 | test가 try/catch 누락 → vitest가 throw를 fail로 처리 | 3 | 2 | Low |
| Ca-RISK-04 | 시크릿 노출 (Prisma 디버그 로그) | 5 | 1 | Medium |
| Ca-RISK-05 | SQLite isolation level 가정 — concurrent test 시 영향 | 2 | 2 | Low |

High 0. test 전용이라 src 영향 0.

## 2. 리스크 상세

### Ca-RISK-01: Prisma $transaction throw 자동 rollback

- **시나리오**: Prisma 5.x는 callback throw 시 자동 rollback 보장. 잘못된 버전 또는 동기 throw vs async throw 차이로 일부 케이스 미rollback 가능.
- **완화**: Prisma 5.22 (backend package.json #3 산출) 동작 검증된 버전. async callback throw rollback 표준 동작.
- **검증**: test 자체가 count=0으로 검증 — 자동 검출.

### Ca-RISK-02: beforeEach 격리 실패

- **시나리오**: throw 시점이 beforeEach 정리 전이면 다음 케이스 영향. but beforeEach는 *다음* 케이스 전에 실행 → 이번 throw는 다음 케이스 전에 정리됨.
- **완화**: beforeEach 4 deleteMany 보장 (기존 패턴)
- **검증**: 다른 통합 테스트 PASS 유지

### Ca-RISK-03: try/catch 누락

- **시나리오**: `await prisma.$transaction(...)` 자체가 throw → test가 fail로 처리됨
- **완화**: test 본문에 `await expect(...).rejects.toThrow('intentional rollback')` 사용 (vitest 표준)
- **검증**: 작성 시점에 syntax 보장

### Ca-RISK-04: 시크릿 노출 (Prisma 로그)

- **시나리오**: Prisma 로그가 throw 시점에 query를 console.log → CI 로그에 데이터 leak (sensitive 입력 시)
- **완화**: 본 test는 임시 데이터(`title: 't'` 등)만 사용. DATABASE_URL 직접 출력 0. Prisma 기본 로그 레벨은 backend env(`LOG_LEVEL`) 영향 받지 않으나 본 test는 prisma 직접 사용 — log level 미설정 시 기본 (error만)
- **검증**: reviewer agent grep — `console.log(process.env|DATABASE_URL)` 0건

### Ca-RISK-05: SQLite isolation level

- **시나리오**: SQLite 기본 isolation은 SERIALIZABLE에 가까움 (single writer). concurrent integration test에서 영향 가능
- **완화**: vitest.integration.config.ts `singleFork: true + fileParallelism: false` (#4 산출) — 동시 실행 0
- **검증**: 5회 연속 실행 안정성

## 3. High 등급 단계적 롤아웃

High 0 — 불필요.

## 4. 데이터 영속성 변경

- schema 0
- migration 0
- dev.db: test가 시드 → throw → rollback → 0건. 정상 시 잔존 데이터 0 (transactional rollback).
- 기존 dev.db data 영향: beforeEach가 정리.

## 5. 15-risk.md 갱신 항목

본 PR scope 외. transactional rollback은 RISK-04 (cascade) 완화 전략의 일부 — 15-risk RISK-04에 본 PR 검증 fan-in만 추가 권고.
