---
doc_type: feature-risk
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

# feat-error-schema-integration — Feature Risk

> Issue #9 · mode=add · P7. test 전용 — High 0.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.1 | 2026-05-26 | woosung.ahn@bespinglobal.com | 초안 (P7) |

## 1. 본 변경의 리스크

| RISK-ID | 제목 | 영향(1~5) | 가능성(1~5) | 등급 |
| --- | --- | --- | --- | --- |
| E-RISK-01 | vi.mock 누수 — afterEach restore 누락 시 다음 통합 테스트 영향 | 4 | 2 | Medium |
| E-RISK-02 | 의도 throw 케이스에서 stderr stack에 시크릿 leak | 4 | 1 | Low |
| E-RISK-03 | error-handler.test.ts(#2)와 중복 — 유지 비용 증가 | 2 | 3 | Low |
| E-RISK-04 | 9 endpoint × 2 = 많은 case → 테스트 시간 증가 | 2 | 2 | Low |
| E-RISK-05 | flaky — singleFork 외 다른 통합 케이스와 mock 충돌 | 3 | 1 | Low |

High 0.

## 2. 리스크 상세

### E-RISK-01: vi.mock 누수

- **시나리오**: tag.service mock이 다음 테스트 파일에 영향 → tag.integration.test.ts FAIL
- **완화**: `afterEach(() => vi.restoreAllMocks())` + 파일 level isolation (vitest.integration.config.ts `singleFork: true`)
- **검증**: 본 파일 후 tags.integration.test.ts 회귀 확인

### E-RISK-02: stderr stack 시크릿 leak

- **시나리오**: errorHandler가 console.error(err.stack) — stack에 process.env 인용 가능?
- **완화**: stack은 코드 trace만 (typeof string). process.env 값 직접 stack에 포함 안 됨. 본 PR test에서 vi.spyOn으로 console.error mock → CI 로그에 출력 0
- **검증**: errorSpy.mock.calls 검증

### E-RISK-03: 단위/통합 중복

- **시나리오**: errorHandler.test.ts(#2) 5 케이스 vs 본 PR 12 케이스 일부 중복
- **완화**: 층위 다름 명시 (단위 = mock express, 통합 = 실 buildApp). 중복은 *회귀 안전망* — 비용 vs 가치 평가에서 가치 우위.
- **검증**: 양쪽 PASS 유지

### E-RISK-04: 테스트 시간

- **시나리오**: 12 case + 시드 + cleanup → 통합 테스트 시간 늘어남
- **완화**: 12 case는 작은 규모. supertest mock 격리. 예상 < 2s.
- **검증**: 측정

### E-RISK-05: flaky

- **시나리오**: mock 동시 실행 시 충돌
- **완화**: `fileParallelism: false + singleFork: true`. file-level mock + afterEach restore.
- **검증**: 5회 연속 실행

## 3. High 등급 단계적 롤아웃

High 0 — 불필요.

## 4. 데이터 영속성 변경

- schema 0
- migration 0
- dev.db: test 시드 → beforeEach 정리.

## 5. 15-risk.md 갱신 항목

본 PR scope 외.
